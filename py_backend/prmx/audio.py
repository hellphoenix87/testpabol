import json
from functools import lru_cache
from os import environ
import numpy as np
from prmx.genres import genres
from prmx.llm import generate_descriptions
from prmx.util import get_best_dot_matches
from prmx.text_embeddings import text_embed_api_call

acoustic_env_embeddings_path = "assets/audio/acoustic_env_embeddings.npy"
acoustic_environments = {
    "small_room": "The scene takes place in a small room like bedroom, living room, classroom, a small office or hotel room with minimal acoustic reverb.",
    "large_room": "The scene takes place in a large room like shopping mall, theater, airport, supermarket, restaurant, cave, basement or museum with some acoustic reverb.",
    "hall": "The scene takes place in a hall with long acoustic reverb like a cathedral, church, large sports hall, school hall, auditorium, concert Hall or conferance hall.",
    "outside": "The scene takes place in the outside, outdoor or open-air place like a forest, park, beach, shore, island, rooftop, city square or street. No reverb is applied.",
    "telephone": "A scene where the sounds and dialog can be heared through a phone, telephone, radio, television or TV.",
}

audio_prompt_path = "assets/audio/audio_prompts.json"

audio_prompt = """The sound descriptions describe the background sounds of a particular movie scene (without the dialog or music soundtrack). The description should be a short and concise sentence. Don't repeat previous descriptions. Don't describe visual attributes, only how they sound. Don't list specific sound effects, but rather sound backdrops for a scene.

Example:
"The eerie creak of a wooden door echoing in the silence of the night.",
"A bustling city street, filled with the distant honks of cars and conversations.",
"The sound of a busy restaurant, with the clinking of silverware.",
"People walking in a hotel room, with the sound of a door opening.",
"Dining restaurant ambient noise with a piano playing.",
"Office sounds. People talking on the phone.\""""


def generate_audio_descriptions():
    return generate_descriptions(
        prompt=audio_prompt,
        type_name="sound",
        prompt_path=audio_prompt_path,
        num_desc=1000,
        genres=genres,
    )


# Load audio_prompt_path and calculate a textual embedding for each.
# Then saves it into a numpy array.
def calculate_embeddings():
    with open(audio_prompt_path, "r") as f:
        audio_descs = json.load(f)

    print(f"calculating {len(audio_descs)} embeddings")

    emb_list = []
    emb_res = text_embed_api_call(audio_descs)["data"]
    print(f"Received {len(emb_res)} embeddings")
    for emb in emb_res:
        emb_list.append(emb["embedding"])
    # save the embeddings
    np.save("assets/audio/audio_embeddings.npy", np.array(emb_list))


# Calculate an acoustic environment embedding for each acoustic_environments and
# save it to a numpy array to acoustic_env_embeddings_path
def calculate_acoustic_env_embeddings():
    emb_list = []
    emb_res = text_embed_api_call(list(acoustic_environments.values())).data
    for emb in emb_res:
        emb_list.append(emb.embedding)
    # save the embeddings
    np.save(acoustic_env_embeddings_path, np.array(emb_list))


@lru_cache(maxsize=1)
def load_audio_embeddings():
    return np.load("assets/audio/audio_embeddings.npy")


@lru_cache(maxsize=1)
def load_acoustic_env_embeddings():
    return np.load(acoustic_env_embeddings_path)


def get_ambient_sound_url(sound_desc: str, n: int = 1) -> list[str]:
    audio_embeds = load_audio_embeddings()
    # calculate the embedding of the input text
    emb_res = text_embed_api_call(sound_desc).data[0].embedding
    # calculate the cosine similarity between the input text and all the audio embeddings
    dot_prods = np.dot(audio_embeds, emb_res) / (
        np.linalg.norm(audio_embeds, axis=1) * np.linalg.norm(emb_res)
    )

    indices = get_best_dot_matches(dot_prods, n)
    return [f"{environ['PRECOMPUTE_SOUND_VER']}/{idx}.ogg" for idx in indices]


def get_acoustic_env(location_name: str, location_desc: str, shot_content: str) -> str:
    acoustic_embeds = load_acoustic_env_embeddings()
    # calculate the embedding of the input text
    input_text = f"{location_name}: {location_desc}, {shot_content}"
    emb_res = text_embed_api_call(input_text).data[0].embedding
    # calculate the cosine similarity between the input text and all the audio embeddings
    dot_prods = np.dot(acoustic_embeds, emb_res) / (
        np.linalg.norm(acoustic_embeds, axis=1) * np.linalg.norm(emb_res)
    )
    index = np.argmax(dot_prods)
    return list(acoustic_environments.keys())[index]
