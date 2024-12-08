# Large Language Model (LLM) interface


from prmx import datastore_local, util
from prmx.context import localContext
from prmx.errors import MockMismatchError
import os, time
import re
import tiktoken
from functools import lru_cache
import copy
from prmx.imagen import shot_types
import json
from enum import Enum
from openai import APIConnectionError, RateLimitError, APIStatusError, APIError, OpenAI
from fuzzywuzzy import fuzz
from functools import cache


@cache
def openai_client() -> OpenAI:
    return OpenAI(
        max_retries=1,
        timeout=90,
    )


# We generate a fallback character, that should not be editable and is used for unrecognized dialog lines
# The fallback character is used during script->shots translation if the LLM hallucinates a new actor.
FALLBACK_CHAR_NAME = "Fallback"


def sanitize_prompt(prompt_text: str) -> str:
    # remove {{, }}, <<, >> and replace with nothing. Used for text that comes from the LLM.
    invalid_chars = ["{{", "}}", "<<", ">>"]
    for char in invalid_chars:
        prompt_text = prompt_text.replace(char, "")
    return prompt_text


# This function removes parenthesized content from a string.
# Example: "The (quick) brown fox" -> "The brown fox"
def remove_parenthesized_content(string: str) -> str:
    # if the first and last character of the string are parentheses, remove them. Sometimes, in
    # movie scripts this notation is used to indicate whispering.
    if string[0] == "(" and string[-1] == ")":
        string = string[1:-1]
    string = re.sub(r"\([^)]*\)", "", string)

    # remove double spaces
    string = string.replace("  ", " ").strip()

    return string


# get a token id from a string
@lru_cache(maxsize=None)
def get_token(token: str, modelname: str) -> int:
    enc = tiktoken.encoding_for_model(modelname)
    encoded = enc.encode(token)
    assert len(encoded) == 1, (
        f"token {token} is not representable in the model's encoding: " + modelname
    )
    return encoded[0]


# modify the "logit_bias" parameter in parameters, to replace the str key with an integer from get_token
def replace_tokens_logitbias(parameters: dict, modelname: str) -> dict:
    if "logit_bias" in parameters:
        logit_bias = parameters["logit_bias"]
        if isinstance(logit_bias, dict):
            new_logit_bias = {}
            for key, value in logit_bias.items():
                new_logit_bias[get_token(key, modelname)] = value
            parameters["logit_bias"] = new_logit_bias
    return parameters


class Llm_model(Enum):
    GPT_3_5_INSTRUCT = 0
    GPT_3_5_TURBO = 1
    SHOT_FINETUNE = 2
    CHAR_FINETUNE = 3
    LOC_FINETUNE = 4
    SCRIPT_FINETUNE = 5


# Chat based LLMs like gpt-3.5 require a "role" parameter to specify the LLMs behavior.
def get_llm_role(model: Llm_model):
    if model == Llm_model.GPT_3_5_INSTRUCT:
        return "You are a helpful assistant for writing movie production material like scripts, storyboards and dialogs."
    if model == Llm_model.SHOT_FINETUNE:
        return "You are a script writing assistant to turn movie scripts into shot notation."
    if model == Llm_model.CHAR_FINETUNE:
        return "You are a script writing assistant to turn movie summaries into a list of character descriptions."
    if model == Llm_model.LOC_FINETUNE:
        return "You are a script writing assistant to turn movie summaries into a list of location descriptions."
    if model == Llm_model.SCRIPT_FINETUNE:
        return "You are a script writing assistant to create movie scripts based on scene summaries."
    assert False, "Invalid LLM model"


def llm_api_call(
    prompt: str, parameters: dict = {}, model: Llm_model = Llm_model.GPT_3_5_INSTRUCT
) -> str:
    ctx = localContext()
    model_dict = {
        Llm_model.GPT_3_5_INSTRUCT: "gpt-3.5-turbo-instruct",
        Llm_model.GPT_3_5_TURBO: "gpt-3.5-turbo",
        Llm_model.SHOT_FINETUNE: "ft:gpt-3.5-turbo-0613:pabolo:shot:8QtvRPUK",
        Llm_model.CHAR_FINETUNE: "ft:gpt-3.5-turbo-0613:pabolo:char:8QtLWmlW",
        Llm_model.LOC_FINETUNE: "ft:gpt-3.5-turbo-0613:pabolo:loc:8Qt6OdlB",
        Llm_model.SCRIPT_FINETUNE: "ft:gpt-3.5-turbo-0613:pabolo:script:8QtsvHgO",
    }

    model_name = model_dict[model]

    chat_model = model_name != "gpt-3.5-turbo-instruct"
    if chat_model:
        messages = [
            {
                "role": "system",
                "content": get_llm_role(model),
            },
            {"role": "user", "content": prompt},
        ]
        hash_list = copy.deepcopy([messages, parameters, model_name])
    else:
        hash_list = copy.deepcopy([prompt, parameters, model_name])

    parameters = replace_tokens_logitbias(parameters, model_name)

    # In any case, we check if we can find the LLM output in the cache. This saves LLM calls and is a "trick"
    # as long as we're hitting LLM quota issues.
    # In the case of a mock, we require that the LLM output is in the cache. In the long run, we should not call ctx.load
    # if ctx.config.mock == True
    llm_out = ctx.load(hash_list)

    if llm_out is None:
        if ctx.config.mock:
            raise MockMismatchError(prompt, ctx.get_mocked_prompts())

        while True:
            try:
                if chat_model:
                    response = openai_client().chat.completions.create(
                        model=model_name, messages=messages, **parameters
                    )
                    max_tokens = 4096  # See documentation https://platform.openai.com/docs/guides/chat/introduction
                    assert (
                        response.choices[0].message.role == "assistant"
                    ), "LLM did not return a message. This should not happen."

                    llm_out = response.choices[0].message.content
                else:
                    response = openai_client().completions.create(
                        model=model_name, prompt=prompt, **parameters
                    )
                    max_tokens = 4097  # See documentation https://platform.openai.com/docs/models/gpt-3-5
                    llm_out = response.choices[0].text
                assert (
                    response.usage.prompt_tokens < max_tokens
                ), "The prompt is too long. Please shorten it."
                break
            except APIConnectionError as e:
                print(
                    f"OpenAI: The server could not be reached or is not responding, possible cause: {e.__cause__}",
                )
                raise e
            except RateLimitError as e:
                print("OpenAI: A 429 (RateLimitError) status code was received.")
                raise e
            except APIStatusError as e:
                print(
                    f"OpenAI: API Status Error, status code received: {e.status_code}, response: {e.response}",
                )
                raise e
            except APIError as e:
                print(
                    f"OpenAI: API Error, message: {e.message}, request: {e.request}, body: {e.body}, code: {e.code}, param: {e.param}, type: {e.type}",
                )
                raise e
            except Exception as e:
                print("Error in LLM API call:", str(e))
                raise e

        ctx.save(llm_out, hash_list, prompt=prompt)

    llm_out = sanitize_prompt(llm_out)

    # if the option is enabled, save prompt and output to a local file
    if ctx.config.log_llm_prompts:
        datastore_local.create_dir_if_not_there("prompt_log")
        # first, find the last number in the folder
        files = os.listdir("prompt_log")
        files = [file for file in files if file.endswith("_prompt.txt")]
        files = [int(file[:-11]) for file in files]
        if len(files) == 0:
            last_number = 0
        else:
            last_number = max(files)
        # save prompt into a text file with increasing number as filename in prompt_log folder
        util.save_to_txt(prompt, f"prompt_log/{last_number+1}_prompt.txt")
        util.save_to_txt(llm_out, f"prompt_log/{last_number+1}_output.txt")

    return llm_out


def parse_dialog_line(dialog_line: str, fallback_character: int = -1) -> (int, str):
    # Catch "no dialog" or "none"
    if dialog_line.lower()[0:2] == "no":
        return -1, ""
    # Catch LLM mistake that it forgot the brackets:
    if "Character " in dialog_line:
        # extract the character id from "Character id: dialog line" by finding the next non-digit character after "Character "
        # this must also work if the separator is :, or " "
        character_id = int(
            re.findall(r"\d+", dialog_line[dialog_line.index("Character ") :])[0]
        )
    elif ":" in dialog_line:
        # Fallback mode: Check if there is at least a ":" symbol in the string. if there is, then use the fallback character id.
        character_id = fallback_character
    else:
        return -1, ""

    # remove the character id from the dialog line
    parsed_line = dialog_line[dialog_line.index(":") + 1 :].strip()

    return character_id, parsed_line


def find_closest_asset(name: str, asset_list: list):
    # find the closest match to name in asset_list
    # if the closest match is below the threshold, return None
    # else, return the closest match
    closest_id = None
    highest_ratio = 0
    for asset_id, asset in enumerate(asset_list):
        ratio = fuzz.ratio(name.lower(), asset["name"].lower())
        if ratio > highest_ratio:
            highest_ratio = ratio
            closest_id = asset_id
    # if the highest ratio is below the threshold, return None
    if highest_ratio < 50:
        return None

    return closest_id


def parse_shots(
    llm_output: str, characters: list, locations: list, char_id_mapping: dict
) -> (list[dict], int):
    num_characters = len(characters)
    num_locations = len(locations)

    shot_list = llm_output.split("Content:")
    shot_list = [shot.strip("\n").strip() for shot in shot_list if shot != ""]
    num_errors = 0
    last_location_id = 0

    dict_list = []
    for shot in shot_list:
        splitted = util.split_newlines(shot)
        if len(splitted) < 4:
            num_errors += 1
            print("Incorrect shot line size:", shot)
            continue
        content = splitted[0].strip()
        # find all <Character ID> references in the content and check that the ID is within range
        for char_id in re.findall(r"<Character (\d+)>", content):
            if int(char_id) < 0 or int(char_id) >= num_characters:
                print("Invalid character id:", char_id)
                num_errors += 1
                continue
        sound_prefix, sound_desc = util.split_string_non_alphanumeric(splitted[1])
        loc_prefix, location_id = util.split_string_non_alphanumeric(splitted[2])
        shot_type_prefix, shot_type_desc = util.split_string_non_alphanumeric(
            splitted[3]
        )

        if (
            sound_prefix != "Sound"
            or loc_prefix != "Location"
            or shot_type_prefix != "Shot Type"
        ):
            print("Invalid shot prefixes:", shot)
            num_errors += 1
            continue

        shot_dialog_lines = []
        if len(splitted) >= 5:
            if not splitted[4].startswith("Dialog:"):
                print("Invalid shot:", shot)
                num_errors += 1
                continue

            dialog = splitted[5:]
            for dialog_line in dialog:
                character_idx, parsed_line = parse_dialog_line(
                    dialog_line, num_characters - 1
                )
                if character_idx == num_characters - 1:
                    print(
                        "Invalid character, using fallback character for:",
                        dialog_line.split(":")[0],
                    )
                    num_errors += 1

                if character_idx == -1:
                    print("Error parsing dialog_line:", dialog_line)
                    num_errors += 1
                    continue

                if character_idx < 0 or character_idx >= num_characters:
                    print(
                        f"Invalid character idx: {character_idx}, using fallback character"
                    )
                    num_errors += 1
                    # Fallback to the fallback character
                    character_idx = num_characters - 1

                shot_dialog_lines.append(
                    {
                        "character_id": char_id_mapping[character_idx],
                        "line": parsed_line,
                    }
                )

        # check if shot type is a number
        if shot_type_desc.isdigit():
            shot_type = int(shot_type_desc)
        else:
            print("Invalid shot type:", shot_type_desc)
            shot_type = shot_types.index("Medium shot")
            num_errors += 1
        # Check that shot type is within range
        if shot_type < 0 or shot_type > len(shot_types):
            print("Invalid shot type:", shot_type)
            num_errors += 1
            continue

        # ensure that <location X> is properly recognized
        location_id = location_id.lower().replace("location", "").strip(" <>")
        # check if location_id is a number
        if location_id.isdigit():
            location_id = int(location_id)
        elif has_empty_description(location_id):
            # in some cases, if the LLM wants to generate a black screen, the location id can be empty.
            # fallback to last_location_id
            location_id = last_location_id
        else:
            location_id = find_closest_asset(location_id, locations)
            if location_id == None:
                print("Invalid location id:", location_id)
                num_errors += 1
                continue

        if location_id < 0 or location_id >= num_locations:
            print("Invalid location id:", location_id)
            num_errors += 1
            continue

        # replace temporary ordered character indices with original ids (they can't be LLM generated)
        for key, value in char_id_mapping.items():
            content = content.replace(f"<Character {key}>", f"<Character {value}>")
            for dialog_line in shot_dialog_lines:
                dialog_line["line"] = dialog_line["line"].replace(
                    f"<Character {key}>", f"<Character {value}>"
                )

        shot_dict = {
            "content": content,
            "location": location_id,
            "dialog": shot_dialog_lines,
            "shot_type": shot_type,
            "sound": sound_desc.strip(),
        }
        last_location_id = location_id
        dict_list.append(shot_dict)
    return dict_list, num_errors


# Sometimes, the LLM repeats the same shots. Remove subsequent duplicates.
def remove_duplicate_shots(shots: list[dict]) -> list[dict]:
    num_shots_before = len(shots)
    shots = [shot for i, shot in enumerate(shots) if i == 0 or shot != shots[i - 1]]
    num_shots_after = len(shots)
    if num_shots_before != num_shots_after:
        print("Removed", num_shots_before - num_shots_after, "duplicate shots")
    return shots


def generate_shots(
    prompt: str, characters: int, locations: int, char_id_mapping: dict
) -> str:
    shots_llm = llm_api_call(prompt, {"temperature": 0.0}, Llm_model.SHOT_FINETUNE)
    shots, num_errors = parse_shots(shots_llm, characters, locations, char_id_mapping)
    shots = remove_duplicate_shots(shots)
    print("Generated shots with", num_errors, "errors")
    return shots


def is_invalid_asset_name(name: str) -> bool:
    name = name.strip(" \n\r.")
    if not name:
        return True

    invalid_words = ["none", "n/a"]
    # check if lowercase version of name is in invalid_words
    if name.lower() in invalid_words:
        return True
    return False


def has_empty_description(char_desc: str):
    char_desc = char_desc.lower()
    empty = ["", "n/a", "none", "not available", "no description"]
    if char_desc in empty:
        return True
    return False


def parse_scenes(llm_output: str, min_desc_len: int = 20) -> list[dict]:
    scene_descs = util.split_paragraphs(llm_output)
    scenes = []
    for scene in scene_descs:
        # remove "Scene ...: " in front of the scene
        if scene.startswith("Scene"):
            scene = scene.split(":", 1)[-1].strip()

        scene_lines = scene.split("\n")
        # remove empty lines and strip
        scene_lines = [line.strip() for line in scene_lines if line.strip() != ""]

        # check if it's a title with less than min_desc_len characters. delete if present.
        if len(scene_lines) > 0 and len(scene_lines[0]) < min_desc_len:
            scene_lines = scene_lines[1:]

        if len(scene_lines) == 0:
            continue

        music_desc = ""
        if len(scene_lines) > 0 and scene_lines[-1].startswith("Music:"):
            music_desc = scene_lines[-1].split(":", 1)[-1].strip()
            scene_lines = scene_lines[:-1]

        if len(scene_lines) == 0:
            continue

        scenes.append({"desc": scene_lines[0], "music_desc": music_desc})
    return scenes


# Generate a list of assets of a given type.
# asset_type: "character", "location"
# assets_llm is the LLM output
def parse_assets(asset_type: str, assets_llm: str) -> list[dict]:
    asset_list = assets_llm.split("Name:")
    asset_list = [asset.strip("\n").strip() for asset in asset_list if asset != ""]
    asset_list = [asset for asset in asset_list if asset != ""]

    asset_dict_list = []

    for asset in asset_list:
        splitted = util.split_newlines(asset)
        if len(splitted) < (3 if asset_type == "character" else 2):
            print("Invalid asset paragraph count:", asset)
            continue

        name = splitted[0].strip()
        if is_invalid_asset_name(name):
            print("Invalid asset name:", name)
            continue

        description_prefix, description = util.split_string_non_alphanumeric(
            splitted[1].strip()
        )

        if has_empty_description(description):
            print("Invalid asset description:", description)
            continue

        if asset_type == "character":
            role_prefix, role = util.split_string_non_alphanumeric(splitted[2].strip())

            if role_prefix != "Role" or description_prefix != "Visual Description":
                print("Invalid asset prefix:", asset)
                continue

            asset_dict = {
                "name": name,
                "desc": description,
                "role": role,
                "voice_desc": "",
            }
        else:
            if description_prefix != "Description":
                print("Invalid asset:", asset)
                continue
            asset_dict = {"name": name, "desc": description}
        # only add asset_dict if no duplicate name exists
        if not any(d["name"] == name for d in asset_dict_list):
            asset_dict_list.append(asset_dict)

    if asset_type == "character":
        # Add a fallback character for unrecognized dialog lines in the script
        asset_dict_list.append(
            {
                "name": FALLBACK_CHAR_NAME,
                "desc": "fallback description - placeholder",
                "role": "fallback role - placeholder",
                "voice_desc": "Normal, male voice.",
            }
        )
    return asset_dict_list


# Helper function to precompute a list of descriptions
def generate_descriptions(
    prompt: str,
    type_name: str,
    prompt_path: str,
    num_desc: int,
    genres: list[str],
):
    descs = []
    # open json file to continue from where we left off
    try:
        with open(prompt_path, "r") as f:
            descs = json.load(f)
    except FileNotFoundError:
        print(f"output file {prompt_path} not found. Creating new file.")

    loop_id = 0

    while len(descs) < num_desc:
        try:
            genre = genres[loop_id % len(genres)]
            llm_prompt = f"""Generate me a python list of 50 strings with {type_name} descriptions for a {genre} movie. {prompt}

descriptions = [
"""
            response = openai_client().completions.create(
                model="gpt-3.5-turbo-instruct", prompt=llm_prompt, max_tokens=3000
            )
            desc_out = response.choices[0].text

            # desc_out contains a number of strings "...", separated with \n. Extract them into a list of strings.
            desc_out = desc_out.split("\n")
            # remove lines without " or empty lines
            desc_out = [d for d in desc_out if '"' in d and len(d) > 1]
            # skip lines that contain a :
            desc_out = [d for d in desc_out if ":" not in d]
            desc_out = [d for d in desc_out if "ovie -" not in d]
            # remove " at the beginning and end of each string
            desc_out = [d.strip("\" ,'[]").strip("\" ,'[]") for d in desc_out]
            descs += desc_out
            print(len(descs), genre, desc_out)
            loop_id += 1

            with open(prompt_path, "w") as f:
                json.dump(descs, f, indent=2)
        except Exception as e:
            print(e)
            time.sleep(3)
            continue

    # remove duplicates
    descs = list(set(descs))
    print(f"Generated {len(descs)} descriptions")

    with open(prompt_path, "w") as f:
        json.dump(descs, f, indent=2)
