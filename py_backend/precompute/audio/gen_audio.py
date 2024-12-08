# This file is used to precompute the audio files from the audio prompts. It is not used in the main codebase.
# To get it running:
# git clone https://github.com/declare-lab/tango.git
# cd tango
# pip install -r requirements.txt
# python gen_audio.py

# FFMPEG with liv-vorbis is required. I made it working with this: https://chat.openai.com/share/9806335f-6b6f-4c63-858a-a1b174b499ed

import pydub
from tango import Tango
import json
import os
from tqdm import tqdm
import numpy as np

OUT_FOLDER = "audio_results"

# check if the folder exists
if not os.path.exists(OUT_FOLDER):
    os.mkdir(OUT_FOLDER)

json_path = "audio_prompts.json"
with open(json_path, "r") as f:
    audio_descs = json.load(f)

tango = Tango(
    "declare-lab/tango-full-ft-audiocaps"
)  # This tango model produces the best quality

BATCH_SIZE = 8

# get the next batch of audio
for k in tqdm(range(0, len(audio_descs), BATCH_SIZE)):
    batch = audio_descs[k : k + BATCH_SIZE]

    audios = tango.generate_for_batch(
        batch, steps=200, disable_progress=False, batch_size=BATCH_SIZE
    )
    for audio_id, audio in enumerate(audios):
        # We need to trim silence since the model usually generates 0.3 seconds of silence at the end
        THRESH = 100
        start_idx = 0
        end_idx = len(audio)
        for i in range(len(audio)):
            if abs(audio[i]) > THRESH:
                start_idx = i
                break
        for i in range(len(audio) - 1, 0, -1):
            if abs(audio[i]) > THRESH:
                end_idx = i
                break

        sampling_rate = 16000
        print(
            "Length of cutted silence in seconds:",
            (len(audio) - (end_idx - start_idx)) / sampling_rate,
            start_idx,
            end_idx,
        )
        audio = audio[start_idx:end_idx]
        sample_width = 2
        # ensure that audio length is a multiple of sample_width
        if len(audio) % sample_width != 0:
            audio = audio[: -(len(audio) % sample_width)]
        audio_index = k + audio_id
        filename = os.path.join(OUT_FOLDER, f"{audio_index}.ogg")
        # save numpy array as audio file with pydub
        pydub.AudioSegment(
            audio, frame_rate=sampling_rate, sample_width=sample_width, channels=1
        ).export(filename, format="ogg", bitrate="80000")
