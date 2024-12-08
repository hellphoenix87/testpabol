import json
from openai import OpenAI
from tqdm import tqdm
from prmx.text_embeddings import text_embed_api_call
import os
import numpy as np
from multiprocessing.pool import ThreadPool
import pydub
from prmx import util
from functools import cache


@cache
def openai_client() -> OpenAI:
    return OpenAI(
        max_retries=1,
        timeout=90,
    )


def generate_embeds(scrape_result_folder: str) -> None:
    """
    Music embeddings.
    generate text embeddding vectors starting from textual data.
    the starting data file can be obtained via pixabay_scraper.py."""

    def process_file(filename):
        if not filename.endswith(".json"):
            return

        json_filename = os.path.join(scrape_result_folder, filename)
        desc_filename = json_filename[:-5] + ".txt"
        embed_filename = json_filename[:-5] + ".npy"

        # if both already exist, skip
        if os.path.isfile(desc_filename) and os.path.isfile(embed_filename):
            print("skipping " + filename)
            return

        with open(json_filename, "r") as f:
            entry_data = json.load(f)
        desc_text = get_desc_from_title_tags(entry_data)

        # save the desc string in the filename with a txt extension
        with open(desc_filename, "w") as f:
            f.write(desc_text)

        print("desc_text:", desc_text)

        # calculate embedding and save as npy
        desc_embed = text_embed_api_call(desc_text).data[0].embedding

        np.save(embed_filename, desc_embed)

    if False:  # single threaded
        # in the folder, iterate over all json files
        for filename in tqdm(os.listdir(scrape_result_folder)):
            process_file(filename)
    else:
        num_threads = 16
        with ThreadPool(num_threads) as pool:
            pool.map(process_file, os.listdir(scrape_result_folder))


# Takes the results of generate_embeds and writes the lookup files that are read in
# production by pyBackend.
def generate_lookup_files(scrape_result_folder: str) -> None:
    discarded_folder = os.path.join(scrape_result_folder, "discarded")
    if not os.path.exists(discarded_folder):
        os.makedirs(discarded_folder, exist_ok=True)

    untrimmed_folder = os.path.join(scrape_result_folder, "untrimmed")
    if not os.path.exists(untrimmed_folder):
        os.makedirs(untrimmed_folder, exist_ok=True)

    name_list = []
    music_descs = []
    emb_list = []

    def process_file(filename):
        if not filename.endswith(".npy"):
            return
        # check if the corresponding mp3 file exists
        mp3_filename = os.path.join(scrape_result_folder, filename[:-4] + ".mp3")
        if not os.path.isfile(mp3_filename):
            return
        # if the txt file is smaller than 20 bytes, continue
        # This could happen if the LLM which creates the captions, made a mistake.
        txt_filename = os.path.join(scrape_result_folder, filename[:-4] + ".txt")
        if os.path.getsize(txt_filename) < 20:
            # copy mp3 file into discarded folder
            os.rename(
                mp3_filename, os.path.join(discarded_folder, filename[:-4] + ".mp3")
            )
            return
        txt_content = open(txt_filename, "r").read()
        # load mp3 file and calculate length
        audio = pydub.AudioSegment.from_mp3(mp3_filename)
        length = audio.duration_seconds
        MIN_LENGTH = 30
        MAX_LENGTH = 60 * 6
        # if it's smaller than min_lenght or larger than max_length,
        # copy the file into the discarded_folder. The very long files seem to have bad quality,
        # mostly auto generated music pieces.
        if length < MIN_LENGTH or length > MAX_LENGTH:
            os.rename(
                mp3_filename, os.path.join(discarded_folder, filename[:-4] + ".mp3")
            )
            return

        # if longer than trim_length, trim it to reduce file size.
        # A scene which is longer than this length is very rare, so we better save space.
        TRIM_LENGTH = 60 * 3
        if length > TRIM_LENGTH:
            # move original file to untrimmed folder
            os.rename(
                mp3_filename, os.path.join(untrimmed_folder, filename[:-4] + ".mp3")
            )
            audio = audio[: TRIM_LENGTH * 1000]
            sample_width = 2
            # ensure that audio length is a multiple of sample_width
            # this is a requirement for the mp3 format
            if len(audio) % sample_width != 0:
                audio = audio[: -(len(audio) % sample_width)]

            # write to original filename
            audio.export(mp3_filename, format="mp3", bitrate="256000")

        name_list.append(filename[:-4])
        music_descs.append(txt_content)
        emb_list.append(np.load(os.path.join(scrape_result_folder, filename)))

    if False:  # single threaded
        for filename in tqdm(os.listdir(scrape_result_folder)):
            process_file(filename)
    else:  # multi thread with tqdm
        num_threads = 16
        files = os.listdir(scrape_result_folder)
        with ThreadPool(num_threads) as pool:
            for _ in tqdm(pool.imap_unordered(process_file, files), total=len(files)):
                pass

    name_list_path = "assets/music/music_names.json"
    emb_list_path = "assets/music/music_embeds.npy"
    desc_list_path = "assets/music/music_descs.json"

    with open(name_list_path, "w") as f:
        json.dump(name_list, f)
    with open(desc_list_path, "w") as f:
        json.dump(music_descs, f)
    np.save(emb_list_path, np.stack(emb_list, axis=0))


def get_desc_from_title_tags(params_dict: dict) -> str:
    """Use title + all associated tags to generate the description."""
    title = params_dict["title"]
    tags = params_dict["tags"]
    tags = ", ".join([t for t in tags])
    prompt = f"""Examples of music pieces with descriptions.:
Title: Bumbi Rock by Jason McCreary
Tags: Beats, Cinematic, Rock
"A modern rock piece with beats and a cinematic atmosphere."

Title: Gentle Piano Blues composed by Mozart Bombastico11
Tags: Piano, Strings, Relaxing
"A gentle piano piece with strings and a relaxing atmosphere."

Write a textual description (one sentence) for the following music piece which is specified by short tags. Ignore royalty or license information. Do not mention the author or composer! Don't mention the length or duration of the music piece!
Title: {title}
Tags: {tags}
"""
    response = openai_client().completions.create(
        model="gpt-3.5-turbo-instruct", prompt=prompt, max_tokens=50
    )
    text = response.choices[0].text

    # remove all " ' or \n
    text = text.replace('"', "")
    text = text.replace("'", "")
    text = text.replace("\n", "")
    # remove trailing spaces
    text = text.strip()
    return text
