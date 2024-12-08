# We generate a list of asset descriptions with GPT and then use the a image model to generate jpg files.
from functools import lru_cache
from os import environ
import numpy as np
import torch
from prmx.errors import MockMismatchError
from prmx.util import get_best_dot_matches
from prmx.context import localContext
from download import clip_text_model_paths

location_prompt_path = "assets/images/location_prompts.json"
character_prompt_path = "assets/images/character_prompts.json"


# Paths to the precomputed CLIP embeddings for characters and locations
CLIP_PATHS = {
    "characters": (
        "assets/images/chars_clip.npy",
        "assets/images/chars_processed_clip_files.txt",
    ),
    "locations": (
        "assets/images/loc_clip.npy",
        "assets/images/loc_processed_clip_files.txt",
    ),
}


@lru_cache(maxsize=1)
def load_embeddings(emb_type: str) -> np.ndarray:
    numpy_path, text_path = CLIP_PATHS[emb_type]
    return np.load(numpy_path), open(text_path, "r").read().splitlines()


assets_clip_tokenizer = None
assets_clip_model = None


def initialize_clip() -> None:
    """Initialize the CLIP model and clip_tokenizer"""

    global assets_clip_tokenizer, assets_clip_model
    if assets_clip_tokenizer is None:
        assets_clip_tokenizer = torch.load(clip_text_model_paths["local_tokenizer"])
    if assets_clip_model is None:
        assets_clip_model = torch.load(clip_text_model_paths["local_model"])


def get_clip_text(text: str, emb_type: str) -> np.ndarray:
    """Returns the CLIP embedding of the input text"""

    ctx = localContext()

    if not ctx.config.mock:
        initialize_clip()
        with torch.no_grad():
            text_tokenized = assets_clip_tokenizer(
                text, padding=True, return_tensors="pt", truncation=True
            )
            emb = assets_clip_model(**text_tokenized).text_embeds.numpy()
        ctx.save(emb.tolist(), text, prompt=text)
        return np.asarray(emb)

    emb = ctx.load(text)

    if emb is None:
        raise MockMismatchError(text, ctx.get_all_mocked_assets_desc(emb_type))

    return np.asarray(emb)


def get_asset_url(
    emb_type: str, desc: str, n: int = 1, taken_indices: list = []
) -> tuple[dict[str, list[str or int]], list[int]]:
    """
    Returns a dict of asset url and another list of indices that can be passed to this function to avoid duplicates.
    The urls refer to images that are placed in a cloud bucket. They have been generated
    using the scripts in precompute/assets/... and the code in Assetprecomputation Repo.
    We use CLIP similarity between the input text and the precomputed embeddings to find the best matches.
    """

    assert emb_type in ["characters", "locations"]
    clip_embeds, url_list = load_embeddings(emb_type)
    emb_res = get_clip_text(desc, emb_type)  # Takes ~100ms on a laptop CPU
    # calculate the cosine similarity between the input text and all the embeddings
    dot_prods = np.dot(clip_embeds, emb_res.T)
    indices = get_best_dot_matches(dot_prods, n + len(taken_indices))

    # remove indices that have already been taken
    indices = [idx for idx in indices if idx not in taken_indices]

    assert len(indices) > 0, f"Could not find any {emb_type} for the given description."

    # use the first n indices
    indices = indices[:n]

    urls = [
        f"{environ['PRECOMPUTE_ASSET_VER']}/{emb_type}/{url_list[idx][:-4]}.jpg"
        for idx in indices
    ]

    data_to_return = {
        "images_urls": urls,
    }

    if emb_type == "characters":
        data_to_return["ids"] = [int(url_list[idx][:-4]) for idx in indices]

    return data_to_return, list(indices)
