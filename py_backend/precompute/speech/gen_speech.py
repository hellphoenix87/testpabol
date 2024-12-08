import json, os, re
from prmx.speech import (
    load_data,
    infer,
    estimate_f0,
    VOICE_DATA_PATH,
    get_embed,
    EMOTION_EMBED_PATH,
    shift_pitch,
)


def get_age_description(age: int) -> str:
    if age < 13:
        return "child "
    if 13 <= age < 18:
        return "teenager "
    if 18 <= age < 40:
        return "young adult "
    if 40 <= age < 60:
        return "middle-aged adult "
    if 60 <= age:
        return "elderly adult "


def generate_text2voice_mapping(
    metadata_filepath="assets/speech/pabolo/voice_metadata.json",
    pitch_shift_ratios: list[float] = [0.925, 1.075],
) -> None:
    """
    This functions creates assets/speech/text_embedding2voice.json to compare w/ character descriptions & assign a voice.
    Metadata about a voice actor's age, gender, location, accent, and speech tone are combined into a semantically meaningful
    voice description for each speaker.
    """
    with open(metadata_filepath) as file:
        voice_metadata = json.load(file)

    if (
        1.0 not in pitch_shift_ratios
    ):  # make sure that the original pitch of the speaker is included
        pitch_shift_ratios = [1.0] + pitch_shift_ratios
    emb_list = []
    speaker_info = voice_metadata["speakers"]
    index = 1
    for speaker, info in speaker_info.items():
        # create a text description from speaker metadata
        location = info["location"]
        location = " from " + location if location else ""
        gender = info["gender"].replace("female", "woman").replace("male", "man")
        age = info["age"]

        if age.isdigit():
            age = int(
                age
            )  # if the age string can be converted to int, then that's the exact age of the speaker
            age_prefix = f"{age}-year-old {gender}"
        else:
            pronoun = "his" if gender in ["man", "boy"] else "her"
            ages = [
                int(match)
                for match in re.findall(
                    r"\d+", age
                )  # "20s" -> [20], "20-30" -> [20, 30]
            ]  # finds all numbers in the age string

            if len(ages) == 1:  # [20] -> "woman in her 20s"
                age_prefix = f"{gender} in {pronoun} {age}"
            else:  # [20, 30] -> "woman between 20 and 30 years old"
                age_prefix = f"{gender} between {ages[0]} and {ages[1]} years old"
            age = ages[0]  # use the minimum age for age description

        age_desc = get_age_description(age)
        age_prefix = f"{age_desc}{age_prefix}"
        tone = f" and {info['tone']} tone voice." if info["tone"] else "."
        speaker_desc = f"{age_prefix}{location} with {info['accent']} accent{tone}"

        f0 = estimate_f0(speaker)

        for pitch_shift in pitch_shift_ratios:
            # if there is a pitch shift other than 1.0, add a "suffix" description so that these modified
            # voices can be distinguished from the original voices
            if pitch_shift < 1.0:
                # pitch decreasing results in deeper tones, but childlike voices still tend to
                # sound childlike albeit a bit more mature
                if gender == "man" or gender == "woman":
                    speaker_desc_suffix = (
                        " Deep, resonant voice. Commanding, charismatic tone."
                    )
                else:
                    speaker_desc_suffix = " Mature voice for age."
            elif pitch_shift > 1.0:
                # pitch increasing always results in younger voices, so it's good measure
                # to include age limits to refine the description these modified voices
                # Ex: Someone in their 20s will most likely sound like a child with an increase to their pitch
                if age >= 30:
                    speaker_desc_suffix = " Youthful, crisp voice. High pitched voice."
                else:
                    speaker_desc_suffix = " Childlike voice."
            else:
                speaker_desc_suffix = ""

            speaker_desc_full = f"{speaker_desc}{speaker_desc_suffix}"

            print("creating embedding for:", speaker_desc_full)
            emb_list.append(
                {
                    "speaker_index": index,
                    "speaker": speaker,
                    "gender": gender,
                    "f0": f0 * pitch_shift,
                    "pitch_ratio": pitch_shift,
                    "speaker_desc": speaker_desc_full,
                    "text_embed": json.dumps(get_embed(speaker_desc_full)),
                }
            )
            index += 1

    with open(VOICE_DATA_PATH, "w") as file:
        json.dump(emb_list, file, indent=2)


def save_emotion_embeddings() -> None:
    emotion_embeddings = []
    emotion_desc = {
        "Angry_not_Screaming": "Angry, but not screaming.",
        "Calming": "Calming. Soft voice, trying to relax somebody. Soothing.",
        "Fearful": "Fearful. Scared. Afraid of a situation.",
        "Frustrated": "Frustrated",
        "Joyful_Smiling": "Joyful, smiling, smirking, laughing, happy, glad. Good news.",
        "Neutral": "Neutral tone",
        "Out_of_Breath": "Out of breath, like after a sprint.",
        "Sad_almost_Crying": "Sad, almost crying. Bad news.",
        "Screaming": "Screaming, shouting.",
        "Whispering": "Whispering, does not want to be heard.",
    }

    for i, (emotion, desc) in enumerate(emotion_desc.items(), start=1):
        embed = get_embed(desc)
        emotion_embeddings.append(
            {"emotion_index": i, "emotion": emotion, "text_embed": json.dumps(embed)}
        )
    with open(EMOTION_EMBED_PATH, "w") as file:
        json.dump(emotion_embeddings, file, indent=2)


def generate_voice_samples() -> None:
    """Function to precompute voice samples for each voice index"""
    voice_sample_path = "runtime/voice_samples/"
    # ensure the folder exists
    os.makedirs(voice_sample_path, exist_ok=True)

    voice_data, _ = load_data(VOICE_DATA_PATH)

    for voice in voice_data:
        speaker = voice["speaker"]
        speaker_index = voice["speaker_index"]
        pitch_ratio = voice["pitch_ratio"]
        # create a default sentence for each voice index
        line = "Prepare to capture my extraordinary voice as I embark on a journey to find the world's most elusive secrets."
        emotion = "Neutral"

        audio_segment = infer(line, speaker, emotion)
        if pitch_ratio != 1.0:
            audio_segment = shift_pitch(audio_segment, pitch_ratio)
        audio_segment.export(voice_sample_path + f"{speaker_index}.mp3", format="mp3")
