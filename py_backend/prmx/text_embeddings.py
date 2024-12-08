import json
import logging
from typing import Callable
from prmx.errors import MockMismatchError
from prmx import util
import numpy as np
from openai import OpenAI

from prmx.context import localContext
from functools import cache


@cache
def openai_client() -> OpenAI:
    return OpenAI(
        max_retries=1,
        timeout=90,
    )


def generate_embeds(
    input_json_file: str,
    output_json_file: str,
    text_constructor: Callable,
    overwrite: bool = False,
    keys_to_match_for_overwrite: list[str] = ["title"],
) -> None:
    """generates embeddings from a text input using the OpenAI API and saves them to the output_json_file file
    (as another JavaScript Object Property/Python dictionary key).

    Parameters
    -----------
    input_json_file : json file
        needs to be formatted as a json array of objects [{},{},{}..]
    output_json_file : json file
        if file exists, and overwrite=False, then the new embeds will be appended to the existing file.
        Otherwise, the file will be overwritten.
    text_constructor : callback function
        change the function used for constructing the input text. Pass the function name without brackets
    overwrite : boolean
        stops embeddings being recomputed by default. Specify overwrite=True to recompute
    keys_to_match_for_overwrite : list of str
        list of keys to match for overwriting. If all keys match, then the embed is considered to be the same.
    """

    logging.basicConfig(
        filename="compute.log",
        filemode="w",
        format="%(asctime)s %(levelname)s: %(message)s",
        datefmt="%d.%m.%y %H:%M:%S",
        level=logging.INFO,
    )
    output_data = []
    if not overwrite:
        try:
            with open(output_json_file, "r") as f:
                output_data = json.load(f)
        except FileNotFoundError:
            logging.error(
                f"output file {output_json_file} not found. Creating new file."
            )

    input_data = util.load_json(input_json_file)
    embed_data_key = "embed_data"
    for entry_number, entry in enumerate(input_data):
        if not embed_already_computed(entry, output_data, keys_to_match_for_overwrite):
            try:
                input_text = text_constructor(entry)
                embed_data = text_embed_api_call(input_text)
                output_entry = entry
                output_entry[embed_data_key] = embed_data
                output_data.append(output_entry)
                logging.info(f"fetched embed {entry_number} successfully")
            except Exception as e:
                print(e)
                logging.error(f"fetching embed {entry_number} unsuccessful. {e}")
        else:
            logging.info(
                f"embed already {entry_number} already computed. Specify overwrite=True to recompute."
            )

    with open(output_json_file, "w") as f:
        json_string = json.dumps(output_data, indent=2)
        f.write(json_string)


def embed_already_computed(entry, optput_data, keys_to_match_for_overwrite) -> bool:
    """checks if an embed has already been computed for a given entry"""
    for output_entry in optput_data:
        for key in keys_to_match_for_overwrite:
            if entry[key] != output_entry[key]:
                break
        else:
            # if the loop completes without breaking, then all keys match
            return True
    return False


def text_embed_api_call(text: str | list[str]) -> dict:
    """calls the openai text embedding api and returns the result as a dictionary"""

    ctx = localContext()

    if not ctx.config.mock:
        embedding_data = openai_client().embeddings.create(
            input=text, model="text-embedding-ada-002"
        )
        ctx.save(embedding_data, text, binary=True)

        return embedding_data

    embedding_data = ctx.load(text, binary=True)

    if embedding_data is None:
        raise MockMismatchError(text, ctx.get_mocked_media_prompts())

    return embedding_data


def get_text_embed_batch(text: list[str]) -> list[np.ndarray]:
    """gets the embedding for a text strings and returns a list of embeddings"""
    embed_data = text_embed_api_call(text)
    return [np.array(text_entry["embedding"]) for text_entry in embed_data["data"]]


def get_text_embed(text: str) -> np.ndarray:
    """gets the embedding for a text string

    Parameters
    -----------
    text : str
        the text to get the embedding for

    Returns
    --------
    embed: np.array
        the embedding for the text
    """
    embed_data = text_embed_api_call(text)
    return np.array(embed_data.data[0].embedding)


def k_nearest_vectors(input_vec: np.ndarray, candidates: np.ndarray, k) -> list[int]:
    """finds the closest matches to a vector

    Parameters
    -----------
    input_vec : 1 X N vector
        the vector to find the k nearest vectors for
    candidates: list of 1 X N vectors
        the set of vectors to compare to.
    k: integer
        the number of most similar vectors to find.

    Returns
    --------
    k_nearest: list of indices
        list of indices for the k closest vectors. Ordered by closeness.
    """
    # if candidates or input_vec is empty, return empty list
    if len(candidates) == 0 or len(input_vec) == 0:
        return []

    np_list = np.argsort(-np.dot(candidates, input_vec))[:k]
    return [int(i) for i in np_list]


def get_precomputed_embeds_ids(
    json_file_path: str, key_name: str
) -> tuple[np.ndarray, list[int]]:
    """loads the precomputed embeddings from a json file"""
    jason_data = util.load_json(json_file_path)
    embeds = np.array(
        [music["embed_data"]["data"][0]["embedding"] for music in jason_data]
    )
    key_lookup = [entry[key_name] for entry in jason_data]
    return embeds, key_lookup
