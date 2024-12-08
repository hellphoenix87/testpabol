"""
Finds a piece of music which fits the scene by comparing the music description string for the scene
with the text from audio text pairs.The text is constructed from textual data associated with the music
e.g. the title and the tags. Text embeddings are precomputed and stored in the music_embeds.npy file.
music_names.json contains a list of names to keep track of the order of the embeddings in the npy file.
A KNN lookup returns the music which is most similar to the music description string.
"""

import numpy as np

from prmx import util
from prmx.text_embeddings import text_embed_api_call
from functools import lru_cache
import random


@lru_cache(maxsize=None)
def get_precomputed_embeds_ids_attrib() -> tuple[np.array, list[int]]:
    music_names = util.load_json("assets/music/music_names.json")
    embeds = np.load("assets/music/music_embeds.npy")
    return music_names, embeds


def k_nearest_vectors(input_vec: np.array, candidates: np.array, k) -> list[int]:
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
    np_list = np.argsort(-np.dot(candidates, input_vec))[:k]
    return [int(i) for i in np_list]


def get_music_id_knn(
    music_string: str,
    embeds: np.array,
    k: int = 1,
    prev_music_ids: list[int] | None = [],
    shuffle_buffer: int = 0,
) -> list[list[dict]] | None:
    """implements a k nearest vectors search for the music string

    Parameters
    -----------
    music_string : str
        music description string
    k: integer
        the number of matches to return
    prev_music_ids: array of integers or None
        the ids of the previous music pieces. If the same as the best match, the next best match is returned
    shuffle_buffer: integer
        the number of ids to shuffle before returning the first k ids
    Returns
    --------
    ids of the music files that resemble their file name on gcloud storage
    or None if no music is found
    """
    # if llm suggests no music, return None
    music_string = music_string.lower().strip()
    if music_string in ["none", "no music", "no_music", "no-music", "n/a", ""]:
        return None
    target_embedding = np.array(text_embed_api_call(music_string).data[0].embedding)
    number_of_candidates = (
        k if prev_music_ids is None else k + len(list(prev_music_ids))
    )

    knn_ids = k_nearest_vectors(
        target_embedding, embeds, number_of_candidates + shuffle_buffer
    )
    # remove prev_music_ids from list
    knn_ids = [id for id in knn_ids if id not in prev_music_ids]
    assert len(knn_ids) >= k, "Not enough music ids found"
    # shuffle knn_ids, seeded with music_string to keep it deterministic
    random.Random(music_string).shuffle(knn_ids)
    return knn_ids[:k]
