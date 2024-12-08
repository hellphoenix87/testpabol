# image generation

from prmx.context import localContext
from prmx import util
from prmx.util import oidc_token, inference_url, parse_mlflow_response
import requests
import io
from PIL import ImageDraw, ImageFont, Image
import base64
from typing import Optional, Tuple
import json
import inspect

# This list and its order needs to be in sync with the front end
shot_types = [
    "Over the shoulder",
    "Profile shot",
    "Overhead",
    "High angle",
    "Low angle",
    "Extreme close-up",
    "Medium close-up",
    "Close up",
    "Medium shot",
    "Wide shot",
    "Establishing shot",
]

shot_type_desc = {
    "SHOT_TYPE_DESC": {
        0: "Over the shoulder: A shot from behind a person looking towards what they are facing.",
        1: "Profile shot: A side view of a character, often displaying emotion.",
        2: "Overhead: A bird's-eye view shot, revealing context or location.",
        3: "High angle: A shot from above, diminishing the subject's importance.",
        4: "Low angle: A shot from below, often to make the subject seem powerful.",
        5: "Extreme close-up: A very tight shot focusing on a detail, like eyes or lips.",
        6: "Medium close-up: A shot framing the subject from chest up, used for dialogues.",
        7: "Close up: A shot that fills the frame with a part of the subject, such as a person's face.",
        8: "Medium shot: A waist-high shot that shows a subject in their environment.",
        9: "Wide shot: A shot showing the subject and their surrounding context.",
        10: "Establishing shot: A wide-angle shot at the start of a scene showing the setting.",
    }
}


# Takes the shot type and returns the appendix to the prompt.
def shot_type_prompt(shot_type: int) -> str:
    return f"{shot_types[shot_type]}."


def load_config(config_file: str) -> dict:
    with open(config_file, "r") as f:
        return json.load(f)


# Translate embedding IDs returned by the model into character IDs
def translate_bounding_box_ids(
    bounding_boxes: list[dict], mappings: dict
) -> list[dict]:
    # Check if the bounding boxes are empty
    if not bounding_boxes:
        return bounding_boxes
    # Iterate over each bounding box
    for box in bounding_boxes:
        character_name = box["name"]
        box["character_id"] = mappings[character_name]
        del box["name"]  # Remove the 'name' key
    return bounding_boxes


def gen_image(
    prompt_and_mappings: dict,
    url: str = inference_url("stable-diffusion-host", path="invocations"),
) -> Tuple[Image.Image, str]:
    """generate an image from a prompt and return it as a PIL Image

    Parameters
    -----------
    prompt : str
        the prompt to generate the image from
    prefix : str, optional
        string to prefix the prompt with, by default read from json file
    negative_prompt : str, optional
        string to use as a negative prompt, by default read from json file
    guidance_scale : int, optional
        the guidance scale to use, by default read from json file
    steps : int, optional
        the number of steps to use, by default read from json file

    Returns
    --------
    Image.Image
        the generated image as a PIL Image
    str
        the hash of the shot
    """
    prompt = prompt_and_mappings["prompt"]
    mappings = prompt_and_mappings["char_id_mapping"]
    model_inputs = {
        "prompt": prompt,
    }
    ctx = localContext()
    hash = util.hash(model_inputs)
    if ctx.config.mock:
        image, bounding_boxes = ctx.get_image(hash)
    else:
        model_input = {"dataframe_records": [model_inputs]}
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer {}".format(oidc_token()),
        }

        response = requests.post(url, json=model_input, headers=headers)

        image_base64, bounding_boxes = parse_mlflow_response(
            response, ["image_base64", "bounding_boxes"]
        )
        image = Image.open(io.BytesIO(base64.b64decode(image_base64)))
        bounding_boxes = translate_bounding_box_ids(bounding_boxes, mappings)
    return image, hash, bounding_boxes


def draw_dialog_on_image(
    image: Image,
    dialog_lines: list[dict],
    characters: list[dict],
    locations: list[dict],
    prompt: str,
) -> Image:
    font = ImageFont.truetype("prmx/arial.ttf", 14)
    # insert a newline in the prompt every 78 characters
    prompt = "\n".join([prompt[i : i + 78] for i in range(0, len(prompt), 78)])
    text_concat = prompt + "\n\n"
    if dialog_lines:
        # concat all dialog strings in list with \n in between
        for line in dialog_lines:
            speaker, text = line["character_id"], line["line"]
            for char in characters:
                if char["id"] == speaker:
                    char_name = char["name"]
            text_concat += f"{char_name}: {text}\n"

        text_concat = util.replace_references(text_concat, characters, locations)
    # Render dialog text onto the PIL image
    draw = ImageDraw.Draw(image)
    draw.text((0, 0), text_concat, (255, 255, 255), font=font, align="left")
    return image
