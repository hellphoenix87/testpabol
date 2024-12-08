from diffusers import StableDiffusionPipeline, EulerAncestralDiscreteScheduler
import json
import os
from tqdm import tqdm
import random

# Use curl to download from "https://civitai.com/api/download/models/143906"
pipeline = StableDiffusionPipeline.from_single_file("ep.safetensors")
pipeline.safety_checker = None
pipeline.scheduler = EulerAncestralDiscreteScheduler.from_config(
    pipeline.scheduler.config
)

pipeline.to("cuda")


# generate an alphanumeric random id
def generate_random_id(num_chars=8):
    return "".join(
        random.choice("abcdefghijklmnopqrstuvwxyz0123456789") for _ in range(num_chars)
    )


def gen_images(prefix, descs_list, out_folder, suffix, negative_prompt, variants=[""]):
    # check if the folder exists
    if not os.path.exists(out_folder):
        os.mkdir(out_folder)

    for desc in tqdm(descs_list):
        for variant in variants:
            img = pipeline(
                prefix + desc + " " + variant + suffix,
                negative_prompt="cartoon, blurry, text, malformed limbs, ugly, cartoon, drawing, painting, "
                + negative_prompt,
                num_inference_steps=50,
                guidance_scale=7,
            ).images[0]
            img.save(os.path.join(out_folder, f"{generate_random_id()}.png"))


with open("character_prompts.json", "r") as f:
    gen_images(
        "Portrait of a ",
        json.load(f),
        "chars",
        " Movie Character. Portrait photography. Outdoor lighting. 60mm lens, ISO 800, f/ 4, 1/ 200th",
        "nsfw, nipples, asian, chinese",
    )


with open("location_prompts.json", "r") as f:
    gen_images(
        "",
        json.load(f),
        "loc",
        " Movie location. 60mm lens, ISO 800, f/ 4, 1/ 200th",
        "portrait, people",
    )
