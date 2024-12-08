from functools import lru_cache
import json
from pprint import pprint
import requests
import subprocess
import tempfile
import time
from typing import Sequence, Union
import wave

import librosa
import numpy as np
from pydub import AudioSegment
from scipy.io.wavfile import write as write_wav
from scipy.signal import butter, lfilter

from prmx.decoration import timer
from prmx.text_embeddings import text_embed_api_call
from prmx.util import inference_url, get_best_dot_matches, oidc_token

MODEL = "unit-speech-host"

VOICE_DATA_PATH = "assets/speech/voice_data.json"
EMOTION_EMBED_PATH = "assets/speech/emotion_embeddings.json"

BINS_PER_OCTAVE = 12
MAX_INT16 = 2**15


def get_embed(text: str) -> np.ndarray:
    return text_embed_api_call(text).data[0].embedding


def get_voice_for_speaker_index(speaker_index: int) -> dict:
    voice_data, _ = load_data(VOICE_DATA_PATH)
    return [v for v in voice_data if v["speaker_index"] == speaker_index][0]


@lru_cache(maxsize=None)
def load_data(path: str) -> tuple[dict[str, int], list[np.ndarray]]:
    with open(path) as file:
        mapping = json.load(file)

    # mapping is a list of dicts, each dict contains a key "text_embed" with a serialized np.ndarray
    # extract them into one np.array
    embeddings = np.array([json.loads(entry["text_embed"]) for entry in mapping])
    return mapping, embeddings


# attribute a voice to a character
def attribute_voices(
    name: str,
    desc: str,
    voice_desc: str = None,
    taken_indices: list[int] = [],
    num_voices_per_character: int = 3,
) -> dict:
    # load precomputed embeddings
    voice_data, voice_text_emb = load_data(VOICE_DATA_PATH)

    if voice_desc:
        text = voice_desc
    else:
        text = name + ". " + desc

    query_embedding = get_embed(text)
    best_ids = get_best_dot_matches(
        np.dot(voice_text_emb, query_embedding), len(query_embedding)
    )

    # remove ids that are already assigned to a character
    best_ids = [
        best_id
        for best_id in best_ids
        if voice_data[best_id]["speaker_index"] not in taken_indices
    ]

    # if best_ids contains less than num_voices_per_character, fill with random speaker_index from voice_data
    if len(best_ids) < num_voices_per_character:
        best_ids.extend(
            np.random.choice(
                [i for i in range(len(voice_data))],
                num_voices_per_character - len(best_ids),
            )
        )

    indices = best_ids[:num_voices_per_character]

    selected_speaker_indices = []
    speakers = []
    pitch_ratios = []
    for best_id in indices:
        selected_speaker_indices.append(voice_data[best_id]["speaker_index"])
        speakers.append(voice_data[best_id]["speaker"])
        pitch_ratios.append(voice_data[best_id]["pitch_ratio"])

    data_to_return = {
        "speaker_indices": selected_speaker_indices,
        "speakers": speakers,
        "pitch_ratios": pitch_ratios,
        # api.get_shot_speeches() applies the target pitch when it is specified in a character dict
    }

    return data_to_return, selected_speaker_indices


def attribute_emotions(lines: list[str]):
    # load precomputed embeddings
    emotion_data, emotion_text_emb = load_data(EMOTION_EMBED_PATH)
    line_embeddings = [get_embed(line) for line in lines]
    dot_products = np.dot(line_embeddings, emotion_text_emb.T)
    best_indices = np.argmax(dot_products, axis=1)

    emotion_indices = []
    emotions = []
    for best_id in best_indices:
        emotion_indices.append(emotion_data[best_id]["emotion_index"])
        emotions.append(emotion_data[best_id]["emotion"])

    data_to_return = {
        "emotion_indices": emotion_indices,
        "emotions": emotions,
    }

    return data_to_return


@timer
def infer(
    text: str,
    speaker: str,
    emotion: str,
    url: str = inference_url(MODEL, path="invocations"),
    retry: bool = True,
) -> AudioSegment:
    """Text-To-Speech inference: returns mp3 AudioSegment"""
    model_input = {
        "dataframe_records": [{"prompt": text, "speaker": speaker, "emotion": emotion}]
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer {}".format(oidc_token()),
    }

    response = requests.post(url, json=model_input, headers=headers)
    try:
        response = response.json()
    except Exception as e:
        print(response.text)
        if retry:
            print("retrying in 3 seconds...")
            time.sleep(3)
            response = requests.post(url, json=model_input, headers=headers)
            try:
                response = response.json()
            except Exception as e:
                print(response.text)
                print("backing off 10 seconds before last retry...")
                time.sleep(10)
                response = requests.post(url, json=model_input, headers=headers).json()
        else:
            raise e

    try:
        response = response["predictions"][0]["0"]
    except Exception as e:
        # when the predictions key is missing, mlflow can return the worker stack trace in json format
        pprint(response)
        raise e

    audio_float = response["audio_generated"]
    audio_int = (np.array(audio_float) * MAX_INT16).astype(np.int16)
    audio_sr = response["sampling_rate"]

    # return AudioSegment object from the generated data
    # note that sample width of 2 corresponds to 16 bit audio data, and we typically deal with
    # mono channel audios in TTS
    return AudioSegment(audio_int, frame_rate=audio_sr, sample_width=2, channels=1)


# turn int sound into a float array
def int_sound_to_float(int_array: np.ndarray) -> np.ndarray:
    # divide by the maximum value of a 16-bit signed integer: 32768, i.e. 2^15
    return np.array([np.float32(x / 32768.0) for x in int_array])


# f0 is a voice's fundamental frequency, i.e. the pitch
def estimate_f0(speaker: str) -> float:
    # a text as short as 'Guess my pitch.' returns only 'nan' in f0 + length helps f0 estimate
    line = "Guess my pitch in a long enough line and stretch it to the edges."
    emotion = "Neutral"
    audio = infer(line, speaker, emotion)
    # turn AudioSegment sample into a numpy array to use with librosa
    float_array = int_sound_to_float(audio.get_array_of_samples())

    # min and max frequencies are recommended: do not set the human voice range!
    # https://librosa.org/doc/main/generated/librosa.pyin.html
    f0, _, _ = librosa.pyin(
        float_array,
        fmin=librosa.note_to_hz("C2"),
        fmax=librosa.note_to_hz("C7"),
        sr=audio.frame_rate,
    )
    # return the average f0 to be used for pitch correction
    return np.nanmean(f0)


@timer
def shift_pitch(audio_segment: AudioSegment, ratio: float) -> AudioSegment:
    """Pitch shifting function to increase/decrease the pitch levels of audios of the speakers.
    Args:
      audio_segment (AudioSegment): mp3 AudioSegment object
      ratio (float): Desired pitch shift ratio. Example: if the target pitch shift is +10%, ratio should be 1.1
      Similarly, it should be 0.9 for -10% pitch shift.

    Returns:
      AudioSegment: Audio output of the pitch shifting in pydub AudioSegment type
    """
    audio_data = np.array(audio_segment.get_array_of_samples())
    sample_rate = audio_segment.frame_rate

    with tempfile.NamedTemporaryFile(suffix=".wav") as temp_file_in:
        temp_filename_in = temp_file_in.name
        write_wav(temp_filename_in, rate=sample_rate, data=audio_data)
        semitones = float(BINS_PER_OCTAVE * np.log2(ratio))

        with tempfile.NamedTemporaryFile(suffix=".wav") as temp_file_out:
            temp_filename_out = temp_file_out.name
            subprocess.run(
                [
                    "soundstretch",
                    temp_filename_in,
                    temp_filename_out,
                    f"-pitch={semitones}",
                ],
                check=True,
            )
            with wave.open(temp_file_out, "rb") as wav_file:
                num_channels = wav_file.getnchannels()
                sample_width = wav_file.getsampwidth()
                frame_rate = wav_file.getframerate()
                num_frames = wav_file.getnframes()
                wav_data = wav_file.readframes(num_frames)

    return AudioSegment(
        wav_data,
        sample_width=sample_width,
        frame_rate=frame_rate,
        channels=num_channels,
    )


@timer
def butter_lowpass_filter(
    audio_segment: AudioSegment,
    cutoff_freq: Sequence[Union[int, float]] = 6000,
    order: int = 5,
) -> AudioSegment:
    """
    Apply a low-pass Butterworth filter to the input audio.
    https://en.wikipedia.org/wiki/Butterworth_filter

    Parameters:
    - audio_segment: AudioSegment
        mp3 AudioSegment object.
    - cutoff_freq: int, float (default=6000)
        The cutoff frequency of the filter in hertz.
    - order: int (default=5)
        The order of the Butterworth filter. Higher order results in a steeper roll-off.

    Returns:
    - AudioSegment: Audio output of the filtered input signal.
    """
    audio_data = np.array(audio_segment.get_array_of_samples()) / MAX_INT16
    sample_rate = audio_segment.frame_rate

    # Calculate the Nyquist frequency (half of the sampling rate)
    # see https://en.wikipedia.org/wiki/Nyquist_frequency
    # see also https://en.wikipedia.org/wiki/Nyquist%E2%80%93Shannon_sampling_theorem
    nyquist = 0.5 * sample_rate
    cutoff_freq = np.array(cutoff_freq)

    # Normalize the cutoff frequency to the Nyquist frequency
    # This is a common practice in filter design so that the cutoff frequency is
    # specified independently of the signal sampling rate, making the filters portable
    normal_cutoff = cutoff_freq / nyquist

    # Calculate the Infinite Impulse Response (IIR) coefficients. Normally denoted as (b, a)
    # https://eeweb.engineering.nyu.edu/iselesni/EL713/iir/iir.pdf
    # https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.butter.html
    filter_coeff_num, filter_coeff_denum = butter(
        order, normal_cutoff, btype="low", analog=False
    )
    # Apply the low-pass filter
    audio_data_filtered = lfilter(filter_coeff_num, filter_coeff_denum, audio_data)
    audio_data_filtered = (audio_data_filtered * MAX_INT16).astype(np.int16)
    return AudioSegment(
        audio_data_filtered, frame_rate=sample_rate, sample_width=2, channels=1
    )


def debug_character_pitch_distribution(characters):
    """
    Debugging function to sanity check the pitch ratio distribution for the selected characters.
    Useful to notice any unusual bias towards a pitch shifting type. For instance, there might be undesirable
    bias towards high pitched voices, and this function quantifies the distribution to detect such an anomaly.
    This is not exactly a test function in the sense that there is no hard requirement for pitch distribution to be followed.
    """

    # Api module selects multiple voice choices for each character, and all these choices have a corresponding pitch ratio
    # top1_* refers to the number of times a pitch shift ratio is the top choice
    # tot_* refers to the number of times a pitch shift ratio is selected in total
    # Respectively, orig, lower, higher refer to pitch ratios of [1.0, <1.0, >1.0]
    top1_orig, top1_lower, top1_higher = 0, 0, 0
    tot_orig, tot_lower, tot_higher = 0, 0, 0

    total_characters = 0
    total_voice_selections = 0
    for character in characters:
        if character["name"] == "Fallback":
            continue
        voices = character["voices"]
        total_characters += 1
        total_voice_selections += len(voices)
        for i, voice in enumerate(
            voices
        ):  # this refers to the number of voices per character, typically 3
            if voice % 3 == 0:
                tot_higher += 1
                if i == 0:
                    top1_higher += 1
            if voice % 3 == 1:
                tot_orig += 1
                if i == 0:
                    top1_orig += 1
            if voice % 3 == 2:
                tot_lower += 1
                if i == 0:
                    top1_lower += 1

    print(f"Number of characters: {total_characters}")
    print(f"Total number of voice options: {total_voice_selections}")

    print(f"(Top1) Original pitch percentage: {top1_orig / total_characters : .2f}")
    print(f"(Top1) Lower pitch percentage: {top1_lower / total_characters : .2f}")
    print(f"(Top1) Higher pitch percentage: {top1_higher / total_characters : .2f}")

    print(
        f"(Total) Original pitch percentage: {tot_orig / total_voice_selections : .2f}"
    )
    print(f"(Total) Lower pitch percentage: {tot_lower / total_voice_selections : .2f}")
    print(
        f"(Total) Higher pitch percentage: {tot_higher / total_voice_selections : .2f}"
    )
