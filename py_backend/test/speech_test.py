import os
import pytest

if os.environ.get("CI") == "true":
    pytest.skip("skipping TTS tests", allow_module_level=True)

from prmx import datastore_local, speech, util
import time
import unittest
from pydub import AudioSegment
from typing import Optional

TEST_PATH = "runtime/unitspeech_tests"


def gen_voice(
    voice,
    text="What's the connection between the heists?",
    emotion="Neutral",
    name=None,
    index=None,
    export=True,
) -> Optional[AudioSegment]:
    """Simple function to perform TTS for qualitative assessment and runtime performance measurement"""
    voice_data = speech.get_voice_for_speaker_index(voice)
    speaker = voice_data["speaker"]
    pitch_ratio = voice_data["pitch_ratio"]
    folder = TEST_PATH
    if [name, index].count(
        None
    ) == 0:  # enumerate and put all the audios by one character in the same folder
        export_path = f"{folder}/{name.split(' ')[-1]}_{index}.mp3"
    else:
        export_path = f"{folder}/{voice}_{emotion}.mp3"

    speech_line, exception = None, None
    start = time.perf_counter()
    try:
        speech_line = speech.infer(text, speaker, emotion)
        if pitch_ratio != 1.0:
            speech_line = speech.shift_pitch(speech_line, pitch_ratio)
    except Exception as e:
        exception = e
    finally:
        elapsed = time.perf_counter() - start
        if exception:
            # detect timeouts
            print(f"{export_path} returned a failure in {elapsed:.3f}s")
            raise exception
        else:
            print(f"generated {export_path} in {elapsed:.3f}s")

    if export:
        datastore_local.create_dir_if_not_there(folder)
        speech_line.export(export_path, format="mp3")
    else:
        return speech_line


class Test_TestSpeech(unittest.TestCase):
    def __init__(self, methodName: str = ...) -> None:
        super().__init__(methodName)
        if not os.path.exists(TEST_PATH):
            os.makedirs(TEST_PATH)
        self.characters = [
            {
                "name": "John",
                "desc": "Aged 50s. Greying hair. Intense blue eyes. Weathered face. Muscular build. Wears a leather jacket and jeans.",
                "gender": "man",
            },
            {
                "name": "Detective Cooper",
                "desc": "Aged 40s. Short black hair. Brown eyes. Clean-shaven. Fit build. Wears a suit.",
                "gender": "man",
            },
            {
                "name": "John's Daugther",
                "desc": "Aged 8. Long brown hair. Wears a dress.",
                "gender": "child",
            },
            {
                "name": "Linda",
                "desc": "40 year old female. Short, red hair. Blue, kind eyes. Petite, delicate build.",
                "gender": "woman",
            },
            {
                "name": "Marc",
                "desc": "Cute boy. Wearing a red shirt.",
                "gender": "child",
            },
            {
                "name": "Jack",
                "desc": "Man in his twenties with scruffy hair",
                "gender": "man",
            },
            {
                "name": "Detective Jane",
                "desc": "Dark hair, red suit.",
                "gender": "woman",
            },
            {
                "name": "Antoine",
                "desc": "Pupil. Wearing a red backpack.",
                "gender": "child",
            },
            {
                "name": "Andrew",
                "desc": "15 year old boy. Long hair. Grey eyes. Police uniform.",
                "gender": "man",
            },
            {
                "name": "Michael",
                "desc": "16 years. Wearing a green shirt.",
                "gender": "man",
            },
        ]
        self.lines = {
            "Detective Cooper": [
                "We've been tracking this guy for months.",
                "But we haven't been able to catch him.",
                "We need your help, John.",
            ],
            "John": [
                "Interesting.",
                "Let's see what we can find.",
                "What's the connection between the heists?",
            ],
        }
        self.emotions = {
            0: "Angry_not_Screaming",
            1: "Calming",
            2: "Fearful",
            3: "Frustrated",
            4: "Joyful_SMiling",
            5: "Mumbling",
            6: "Neutral",
            7: "Out_of_Breath",
            8: "Sad_almost_Crying",
            9: "Screaming",
            10: "Whispering",
        }
        self.emotional_lines = {
            "lines": [
                "(Angrily) One does not simply walk into Mordor.",
                "It's not about the mistake; it's about the lack of accountability.",
                "It's okay, take a deep breath. I'm here for you, and we'll get through this together.",
                "I know things seem overwhelming, but we'll find a solution. You're stronger than you think.",
                "I heard strange noises outside my window last night, and it's really freaking me out.",
                "There's something about that old house at the end of the street that gives me the creeps.",
                "I thought we had a plan in place, but it seems like nothing is working.",
                "Yeah, yeah. We all want money. Can we just get on with the plan?",
                "(Laughing) A wizard is never late, nor is he early. He arrives precisely when he means to.",
                "I'm so happy that the exams are finally over.",
                "I completed the report and sent it to your email.",
                "The quarterly review meeting is set for Monday morning.",
                "Wait... give me a moment... I just ran up the stairs.",
                "Hold on. Sorry I'm late. I had to sprint to catch the bus.",
                "I can't talk about it. It's just too much, and I'm trying to hold it together.",
                "(tears coming out of his eyes) I don't know why, but everything just feels so overwhelming right now.",
                "What the hell are you talking about?",
                "(Screaming) You were to bring balance to the force, not leave it in darkness.",
                "(whispering) Hey come here, quickly now!",
                "There's something important I need to tell you, but it's just between us.",
            ],
            "expected": [
                ["Angry_not_Screaming", "Frustrated"],
                ["Angry_not_Screaming", "Frustrated"],
                ["Calming"],
                ["Calming"],
                ["Fearful"],
                ["Fearful"],
                ["Angry_not_Screaming", "Frustrated"],
                ["Angry_not_Screaming", "Frustrated"],
                ["Joyful_Smiling"],
                ["Joyful_Smiling"],
                ["Neutral"],
                ["Neutral"],
                ["Out_of_Breath"],
                ["Out_of_Breath"],
                ["Sad_almost_Crying"],
                ["Sad_almost_Crying"],
                ["Screaming"],
                ["Screaming"],
                ["Whispering"],
                ["Whispering"],
            ],
        }
        util.setup_env_secrets()

    def test_voice(self):
        """Simple test to perform emotional TTS so that the audio can be qualitatively evaluated"""
        gen_voice(
            46,
            text="You look handsome officer.",
            emotion="Joyful_Smiling",
        )

    def test_char1_consistency(self):
        """This test measures the consistency of speech generated for a character with different text lines"""
        name = "Detective Cooper"
        for line_index, line in enumerate(self.lines[name]):
            gen_voice(1, text=line, name=name, index=line_index)

    def test_char2_consistency(self):
        """This test is the same as above, but specified by the other character in the class definition"""
        name = "John"
        for line_index, line in enumerate(self.lines[name]):
            gen_voice(31, text=line, name=name, index=line_index)

    def test_emotion_prediction(self):
        """
        This test measures the accuracy of the emotion prediction by comparing the
        outputs of the `attribute_emotions` in the speech modules with the predefined
        text lines and ground truth emotions. We aim for at least 50% (0.5) accuracy
        for emotion prediction.
        """
        emotion_data = speech.attribute_emotions(self.emotional_lines["lines"])
        predicted_emotions = emotion_data["emotions"]
        expected_emotions = self.emotional_lines["expected"]
        correct_preds = 0
        for i, pred in enumerate(predicted_emotions):
            if pred in expected_emotions[i]:
                correct_preds += 1
        accuracy = correct_preds / len(predicted_emotions)
        print(f"Emotion prediction accuracy: {accuracy : .2f}")
        self.assertTrue(accuracy > 0.5)

    def test_pitch_shift(self):
        """
        Test to perform not only TTS, but also the up and down pitch-shifted versions of the
        generated audio so that the quality of pitch shifting can be evaluated
        """
        voice = 19
        voice_data = speech.get_voice_for_speaker_index(voice)
        speaker = voice_data["speaker"]
        line = speech.infer(
            f"{speaker}'s voice pitch has been shifted. Hear my voice again.",
            speaker,
            "Neutral",
        )
        line.export(TEST_PATH + "/pitch_shift_before.mp3", format="mp3")
        speech.shift_pitch(line, ratio=0.9).export(
            TEST_PATH + "/pitch_shift_after_decrease.mp3", format="mp3"
        )
        speech.shift_pitch(line, ratio=1.1).export(
            TEST_PATH + "/pitch_shift_after_increase.mp3", format="mp3"
        )

    def test_filter(self):
        """Test to perform the denoising filter"""
        voice = 19
        voice_data = speech.get_voice_for_speaker_index(voice)
        speaker = voice_data["speaker"]
        line = speech.infer(
            f"{speaker}'s voice pitch has been filtered. Hear my voice again.",
            speaker,
            "Neutral",
        )
        line.export(TEST_PATH + "/before_filtering.mp3", format="mp3")
        speech.butter_lowpass_filter(line).export(
            TEST_PATH + "/after_filtering.mp3", format="mp3"
        )


if __name__ == "__main__":
    unittest.main()
