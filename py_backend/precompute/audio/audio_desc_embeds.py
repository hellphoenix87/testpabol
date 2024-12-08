from prmx.llm import generate_descriptions
from prmx.genres import genres
from prmx.audio import audio_prompt_path
import json
from prmx.text_embeddings import text_embed_api_call
import numpy as np

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
    emb_res = text_embed_api_call(audio_descs)["data"]  # [0]["embedding"]
    print(f"Received {len(emb_res)} embeddings")
    for emb in emb_res:
        emb_list.append(emb["embedding"])
    # save the embeddings
    np.save("assets/audio/audio_embeddings.npy", np.array(emb_list))
