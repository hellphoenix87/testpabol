# functions exposed to the frontend and deployed serverless in a cloud environment

from os import environ
from typing import Tuple
import concurrent
from prmx import util, llm, music, speech, audio, assets
from prmx.context import localContext
from prmx.util import load_txt
from prmx.promptparser import eval_prompt, prompt_preprocess
from prmx.imagen import (
    gen_image,
    shot_type_prompt,
    draw_dialog_on_image,
    shot_type_desc,
)
from prmx.decoration import timer
from prmx.genres import genres
from prmx.llm import remove_parenthesized_content
from pydub import AudioSegment
import uuid

# Story attributes with context for the LLM
attribute_prompts = {
    "hero": "The movie is centered around a hero.",
    "open end": "The movie has an open end.",
    "plot twist": "The story has a plot twist.",
    "flashbacks": "The movie contains flashbacks.",
    "foreshadowing": "The movie contains foreshadowing.",
    "antagonist": "The movie contains an antagonist.",
    "love story": "The movie contains a love story.",
    "narrator": "Occasionally, a narrator supports the story.",
    "inner monologue": "We can hear the inner monologue of the main character.",
}

# attribute prompts that are added if the tag is not present
attribute_prompts_opposite = {
    "hero": "The movie is not centered around a hero.",
    "open end": "The movie does not have an open end.",
    "plot twist": "The story follows a straightforward narrative without a plot twist.",
    "flashbacks": "The movie maintains a continuous timeline without the use of flashbacks.",
    "foreshadowing": "The movie unfolds without any foreshadowing elements.",
    "antagonist": "The movie lacks an antagonist character.",
    "love story": "No love story.",
    "narrator": "No narrator voice tells the story. There is no narrator in this movie.",
    "inner monologue": "No inner monologue, we can't hear the character's thoughts.",
}

# Audience list should be consisted with the list in the frontend
audience_prompts = [
    "for children",  # Children
    "for teens",  # Teens
    "for adults",  # Adults
    "for the whole family",  # Families
]


# How many preview images do we display per asset?
ASSET_PREVIEW_IMAGES = 3

# We generate a fallback character, that should not be editable and is used for unrecognized dialog lines
# The fallback character is used during script->shots translation if the LLM hallucinates a new actor.
FALLBACK_CHAR_NAME = "Fallback"
NUM_VOICES_PER_CHARACTER = 3


def get_meta(genre_index: int, attributes: list, audience: int) -> str:
    assert genre_index < len(genres) and genre_index >= 0, "unknown genre"

    lowercased_attributes = [att.lower() for att in attributes]
    genre = genres[genre_index]

    # add "an" or "a" to genre
    if genre[0] in ["a", "e", "i", "o", "u"]:
        meta = "This is an " + genre + " movie "
    else:
        meta = "This is a " + genre + " movie "

    if audience is not None:
        meta += f"{audience_prompts[audience]}"
    meta += ". "

    for att in lowercased_attributes:
        meta += f"{attribute_prompts[att]} "

    # go through all keys in attribute_prompts_opposite, and if not in attributes, add the opposite prompt
    for att in attribute_prompts_opposite:
        if att not in lowercased_attributes:
            meta += f"{attribute_prompts_opposite[att]} "

    meta = meta.strip()
    return meta


def get_prompt_for_shot_image(
    shot: dict, characters: list[dict], locations: list[dict]
) -> dict:
    # since we need to replace character ids by embedding ids in the image prompt,
    # we keep track of the mapping between the two to then store bounding boxes by character id
    # -> the image inference server is stateless and does not know about the character ids
    content, char_id_mapping = util.replace_references_for_shot_image_prompting(
        shot["content"], characters, locations
    )
    type = shot_type_prompt(shot["shot_type"])
    location_id = shot["location"]
    prompt = (
        content
        + " "
        + type
        + " "
        + util.replace_references(locations[location_id]["name"], characters, locations)
        + ", "
        + util.replace_references(locations[location_id]["desc"], characters, locations)
        + " Movie scene."
    )
    return {"prompt": prompt, "char_id_mapping": char_id_mapping}


@timer
def get_title_plot(
    genre: int, attributes: list, audience: int, userText: str = ""
) -> dict:
    meta = get_meta(genre, attributes, audience)
    user_instruction = ""
    if userText:
        # remove certain characters to avoid breaking the prompt
        userText = (
            userText.replace('"', "")
            .replace("'", "")
            .replace("\n", " ")
            .replace("\r", " ")
        )
        user_instruction = (
            f'The audience submitted the following requirements: "{userText}"'
        )

    """
    impact of temperature value on the output:
    less than 0.4: almost always the same story for a given set of attributes
    more than 1.4: can output random characters or non english words
    between 0.8 and 1.2: the output is acceptable, the default value is 1
    """
    llm_res = eval_prompt(
        load_txt("prmx/prompts/title_plot.txt"),
        {"META": meta, "USER_INSTRUCTION": user_instruction},
        additional_params={"temperature": 1},
    )
    scenes = llm.parse_scenes(llm_res["SCENES"])
    return {"title": llm_res["TITLE"], "scenes": scenes}


def get_plot_block(scenes: list[dict]) -> str:
    plot_block = ""
    for scene in scenes:
        plot_block += f"{scene['desc']}\n\n"
    return plot_block.strip("\n")


@timer
def get_summary(
    genre: int, attributes: list, audience: int, title: str, scenes: list[dict]
) -> str:
    meta = get_meta(genre, attributes, audience)
    llm_res = eval_prompt(
        load_txt("prmx/prompts/summary.txt"),
        {"META": meta, "TITLE": title, "PLOT": get_plot_block(scenes)},
    )
    return llm_res["SUMMARY"]


@timer
def get_captions(scenes: list[dict]) -> list[str]:
    captions = []
    for scene in scenes:
        captions.append(
            eval_prompt(load_txt("prmx/prompts/caption.txt"), {"SCENE": scene["desc"]})[
                "CAPTION"
            ].strip(" \"'.")
        )
    return captions


# Takes a list of entities (locations, characters or scenes) and formats them into
# one string.
# If entry_name is None, the entity name and id is not included in the string.
def get_block_representation(
    entry_name: str, entity_list: list[dict], name_only: bool = False
) -> str:
    block = ""
    for i, entity in enumerate(entity_list):
        # Fallback entries should not appear in this list
        if "name" in entity and entity["name"] == llm.FALLBACK_CHAR_NAME:
            continue

        if entry_name:
            block += f"{entry_name} {i}: "

        if "name" in entity and entity["name"]:
            block += f"{entity['name']}. "

        if not name_only:
            if "desc" in entity and entity["desc"]:
                block += f"{entity['desc']} "

            if "purpose" in entity and entity["purpose"]:
                block += f"Purpose: {entity['purpose']} "

            if "role" in entity and entity["role"]:
                block += f"Role: {entity['role']} "

        block = block.strip()
        block += "\n"
    return block.strip("\n")


def get_voices_urls(speaker_indices: list[int]) -> list[str]:
    voice_sample_urls = []
    for speaker_index in speaker_indices:
        url = f"{environ['PRECOMPUTE_VOICEDB_VER']}/{speaker_index}.mp3"
        voice_sample_urls.append(url)
    return voice_sample_urls


# This function takes in a list of characters and adds voice
# and image information to each character, also sets a uuid for each character
# prepares the character object to be used throughout the generation process
def add_id_voice_image_info_to_character(
    characters: list[dict], num_voices_per_character: int
) -> list[dict]:
    # The list of picked voices, used to avoid picking the same voice for multiple characters
    taken_voice_indices = []
    # The list of picked characters ids, used to avoid picking the same id for multiple characters
    taken_character_indices = []

    for character in characters:
        # assign voices to each character
        voice_data, new_taken_voice_indices = speech.attribute_voices(
            name=character["name"],
            desc=character["desc"],
            voice_desc=character["voice_desc"],
            taken_indices=taken_voice_indices,
            num_voices_per_character=num_voices_per_character,
        )
        taken_voice_indices.extend(new_taken_voice_indices)
        character["voices"] = voice_data["speaker_indices"]
        character["pitch"] = voice_data["pitch_ratios"][0]
        character["voice_sample_urls"] = get_voices_urls(
            speaker_indices=voice_data["speaker_indices"]
        )
        character["selected_voice_index"] = 0

        # assign images to each character
        asset_urls, new_taken_character_indices = assets.get_asset_url(
            emb_type="characters",
            desc=character["name"] + ". " + character["desc"],
            n=ASSET_PREVIEW_IMAGES,
            taken_indices=taken_character_indices,
        )
        taken_character_indices.extend(new_taken_character_indices)
        character["images"] = asset_urls["images_urls"]
        character["embedding_ids"] = asset_urls["ids"]
        character["selected_image_index"] = 0

        # assign a uuid to each character
        if localContext().config.mock:
            # the character id must be deterministic in mock mode
            mock_characters = util.load_json(f"assets/default/characters.json")
            for mock_character in mock_characters:
                if mock_character["name"] == character["name"]:
                    character["id"] = mock_character["id"]
                    break
            assert "id" in character, "Could not find a matching mock character id."
        else:
            # generate a uuid
            character["id"] = uuid.uuid4().hex

    return characters


@timer
def get_characters(
    genre: int,
    attributes: list,
    audience: int,
    scenes: list,
    num_voices_per_character: int = NUM_VOICES_PER_CHARACTER,
) -> list[dict]:
    meta = get_meta(genre, attributes, audience)
    prompt = prompt_preprocess(
        load_txt("prmx/prompts/characters.txt"),
        {"META": meta, "PLOT": get_plot_block(scenes)},
    )
    characters = llm.parse_assets(
        "character",
        llm.llm_api_call(
            prompt,
            parameters={"max_tokens": 1024},
            model=llm.Llm_model.CHAR_FINETUNE,
        ),
    )
    # assign a voice to each character and other attributes
    characters = add_id_voice_image_info_to_character(
        characters, num_voices_per_character=num_voices_per_character
    )
    return characters


@timer
def get_character(
    name: str,
    desc: str,
    voice_desc: str = "",
    num_voices_per_character: int = NUM_VOICES_PER_CHARACTER,
) -> list[dict]:
    character = [{"name": name, "desc": desc, "voice_desc": voice_desc}]

    # assign a voice to each character and other attributes
    character = add_id_voice_image_info_to_character(
        character, num_voices_per_character=num_voices_per_character
    )
    return character


@timer
def get_locations(title: str, scenes: list) -> list[dict]:
    prompt = prompt_preprocess(
        load_txt("prmx/prompts/locations.txt"),
        {"TITLE": title, "PLOT": get_plot_block(scenes)},
    )
    locations = llm.parse_assets(
        "location",
        llm.llm_api_call(
            prompt,
            parameters={"max_tokens": 1024},
            model=llm.Llm_model.LOC_FINETUNE,
        ),
    )
    taken_indices = []
    for location in locations:
        asset_urls, new_taken_indices = assets.get_asset_url(
            "locations",
            location["name"] + ". " + location["desc"],
            ASSET_PREVIEW_IMAGES,
            taken_indices,
        )
        taken_indices.extend(new_taken_indices)
        location["images"] = asset_urls["images_urls"]
        location["selected_image_index"] = 0
    return locations


@timer
def get_script(
    genre: int,
    attributes: list,
    audience: int,
    scenes: list,
    locations: str,
    characters: str,
    scene_id: int,
) -> list[dict]:
    return llm.llm_api_call(
        prompt_preprocess(
            load_txt("prmx/prompts/script.txt"),
            {
                "META": get_meta(genre, attributes, audience),
                "SCENES": get_block_representation("Scene", scenes),
                "LOCATIONS": get_block_representation(None, locations),
                "CHARACTERS": get_block_representation(None, characters),
                "SCENE_ID": str(scene_id),
            },
        ),
        parameters={"max_tokens": 1800},
        model=llm.Llm_model.SCRIPT_FINETUNE,
    )


@timer
def get_music(scenes: list[dict]) -> list[list[dict] | None]:
    NUMBER_OF_MUSIC = 3  # How many music pieces to return per scene.
    music_names, embeds = music.get_precomputed_embeds_ids_attrib()
    # use prev_music_ids to avoid repeating the same songs for consecutive scenes
    prev_music_ids = []
    music_data = []
    for scene in scenes:
        curr_music_ids = music.get_music_id_knn(
            scene["music_desc"],
            embeds,
            NUMBER_OF_MUSIC * len(scenes),
            prev_music_ids,
            shuffle_buffer=10,
        )

        if curr_music_ids is None:
            scene_music_data = None
        else:
            prev_music_ids = curr_music_ids
            scene_music_data = [
                {
                    "id": f"{environ['PRECOMPUTE_MUSICDB_VER']}/{music_names[curr_music_id]}.mp3"
                }
                for curr_music_id in curr_music_ids
            ][:NUMBER_OF_MUSIC]

        music_data.append(scene_music_data)
    return music_data


def get_ambient_sound_url(sound_desc: str, n: int) -> str:
    return audio.get_ambient_sound_url(sound_desc, n)


def get_asset_url(emb_type: str, desc: str, n: int) -> dict[str, list[str or int]]:
    data, _ = assets.get_asset_url(emb_type, desc, n)
    return data


def get_acoustic_env(location_name: str, location_desc: str, shot_content: str) -> str:
    return audio.get_acoustic_env(location_name, location_desc, shot_content)


@timer
def get_shots(
    script: list[str],
    locations: list[dict],
    characters: list[dict],
    scene: int,
) -> list[dict]:
    prompt = prompt_preprocess(
        load_txt("prmx/prompts/shots.txt"),
        {
            "LOCATIONS": get_block_representation(
                "Location", locations, name_only=True
            ),
            "CHARACTERS": get_block_representation(
                "Character", characters, name_only=True
            ),
            "SCRIPT": script[scene],
        }
        | shot_type_desc,
    )
    char_id_mapping = {}
    for idx, character in enumerate(characters):
        char_id_mapping[idx] = character["id"]

    shot_result = llm.generate_shots(prompt, characters, locations, char_id_mapping)

    # Go through all shots and fill in missing sound information
    for shot in shot_result:
        if shot["dialog"]:
            # if the shot includes dialog, get all the qutoes and assign emotion to each of them
            dialog_lines = [dialog["line"] for dialog in shot["dialog"]]
            emotion_data = speech.attribute_emotions(dialog_lines)
            emotions = emotion_data["emotions"]
            for i, emotion in enumerate(emotions):
                shot["dialog"][i]["emotion"] = emotion
        # get the ambient sound
        ambient_sounds_urls = get_ambient_sound_url(shot["sound"], 3)
        shot["sound_urls"] = ambient_sounds_urls
        shot["selected_sound_index"] = 0
        location = locations[shot["location"]]
        shot["acoustic_env"] = audio.get_acoustic_env(
            location["name"], location["desc"], shot["content"]
        )

    return shot_result


# This function gets the shot image for a given shot. It is different from get_shot_images function
# which generates the shot images for all the shots. kwargs are included here to maintain compatibility with the
# gen_media function in web.py. This gen_media function is common for both speech and image generation.
@timer
def get_shot_image(
    shot: dict,
    characters: list[dict],
    locations: list[dict],
    draw_dialog: bool = False,
) -> list[dict]:
    prompt_and_mapping = get_prompt_for_shot_image(shot, characters, locations)
    image, hash_, bounding_boxes = gen_image(prompt_and_mapping)
    if draw_dialog:
        image = draw_dialog_on_image(
            image, shot["dialog"], characters, locations, prompt_and_mapping["prompt"]
        )
    return [{"image": image, "hash": hash_, "bounding_boxes": bounding_boxes}]


@timer
def get_shot_images(
    shots: list[dict],
    characters: list[dict],
    locations: list[dict],
    draw_dialog: bool = False,
) -> list[dict]:
    results = []

    SINGLE_THREAD = False

    prompt_and_mappings = [
        get_prompt_for_shot_image(shot, characters, locations) for shot in shots
    ]

    if SINGLE_THREAD:
        for prompt_and_mapping in prompt_and_mappings:
            image, hash_, bounding_boxes = gen_image(prompt_and_mapping)
            result = {"image": image, "hash": hash_, "bounding_boxes": bounding_boxes}
            results.append(result)
    else:  # one thread per shot, maintain order
        with concurrent.futures.ThreadPoolExecutor() as executor:
            for image, hash_, bounding_boxes in executor.map(
                gen_image, prompt_and_mappings
            ):
                result = {
                    "image": image,
                    "hash": hash_,
                    "bounding_boxes": bounding_boxes,
                }
                results.append(result)

    if draw_dialog:
        for id, shot in enumerate(shots):
            results[id]["image"] = draw_dialog_on_image(
                results[id]["image"],
                shot["dialog"],
                characters,
                locations,
                prompt_and_mappings[id]["prompt"],
            )
    return results


# this function is needed for generating speeches for characters
# also used in get_line_speech function
# the hash here won't be used in get_line_speech. this hash is only used for character speeches
def get_speech_line(
    quote: str, char_id: int, voice: int, emotion: str
) -> Tuple[AudioSegment, str]:
    temp_dict = {
        "quote": quote,
        "char_id": char_id,
        "voice": voice,
        "emotion": emotion,
    }
    hash = util.hash(temp_dict)
    ctx = localContext()
    if ctx.config.mock:
        line = ctx.get_line(hash)
    else:
        voice_data = speech.get_voice_for_speaker_index(voice)
        speaker = voice_data["speaker"]
        pitch_ratio = voice_data["pitch_ratio"]
        line = speech.infer(quote, speaker, emotion)
        if pitch_ratio != 1.0:
            line = speech.shift_pitch(line, pitch_ratio)
        line = speech.butter_lowpass_filter(line)

    return line, hash


# returns speech line for a single dialog line
# this gets both shot and line dict as arguments from the web module
# thus the need for kwargs
@timer
def get_line_speech(
    line: dict,
    characters: list[dict],
    locations: list[dict],
    **kwargs,
) -> Tuple[AudioSegment, str]:
    ctx = localContext()
    quote = line["line"]
    char_id = line["character_id"]
    if "emotion" not in line:
        emotion_data = speech.attribute_emotions([quote])
        emotion = emotion_data["emotions"][0]
    else:
        emotion = line["emotion"]
    # remove bracket text like (pause.) or (cries) from the text to exclude from TTS generation
    # that information is useful for emotion matching in speech.attribute_emotions to determine how
    # the characters will sound, but we do not want to them to actually say "whispering", for example.
    quote = remove_parenthesized_content(quote)
    quote = util.replace_references(quote, characters, locations)
    dict_to_hash = {"quote": quote, "char_id": char_id, "emotion": emotion}
    hash = util.hash(dict_to_hash)
    if ctx.config.mock:
        line = ctx.get_line(hash)
    else:
        for char in characters:
            if char["id"] == char_id:
                character = char

        voice = character["voice"]
        line, _ = get_speech_line(quote, char_id, voice, emotion)

    return line, hash


# returns speech lines for a single shot
@timer
def get_shot_speech(
    shot: dict, characters: list[dict], locations: list[dict]
) -> Tuple[list[AudioSegment], list[str]]:
    lines = []
    dialog = shot["dialog"]
    hashes = []
    if dialog:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            for line, hash in executor.map(
                get_line_speech,
                dialog,
                [characters] * len(dialog),
                [locations] * len(dialog),
            ):
                lines.append(line)
                hashes.append(hash)
    return lines, hashes


@timer
def get_shot_speeches(
    shots: list[dict], characters: list[dict], locations: list[dict]
) -> Tuple[list[list[AudioSegment]], list[list[str]]]:
    """returns the speech lines per shot and the speech hashes, i.e. shots[lines[AudioSegment, hash]]"""
    lines = []
    hashes = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        for shot_speeches, shot_hashes in executor.map(
            get_shot_speech, shots, [characters] * len(shots), [locations] * len(shots)
        ):
            lines.append(shot_speeches)
            hashes.append(shot_hashes)
    return lines, hashes
