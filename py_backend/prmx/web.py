""" prmx web interface handling requests and responses passed from main.py

The robustness of this design is ensured by the following assumptions, i.e. what not to break...

ASSUMPTION 1 of the Web API
---------------------------
generic text generation is made possible by keeping in sync the same names for:
- request data keys
- api function parameters
- fields of a creation document in Firestore

ASSUMPTION 2 of the Web API
---------------------------
a parameter name of an api module function has no duplicate entry in DB Layout, i.e.
'shots', 'scenes', 'music', etc. should be unique names across all subcollections of a creation
"""

from enum import Enum
from functools import cache
from inspect import signature, Parameter
from typing import Optional, Tuple
from firebase_admin import auth
from flask import Request
from pydub import AudioSegment
from prmx import api
from prmx.datastore import DataStore


class ASYNC_STATUS(Enum):
    READY = "READY"
    PENDING = "PENDING"
    FAILED = "FAILED"


# initialize a web datastore in gcloud: this assumes firebase has already been initialized, e.g.
# typically, a call to firebase_admin.initialize_app() in main.py or at the top of a test suite
@cache
def ds() -> DataStore:
    return DataStore()


# authenticate a user by verifying the token in the Authorization header
def authenticate(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")

    # Extract the token from the header
    if auth_header and auth_header.startswith("Bearer "):
        uid = None
        id_token = auth_header.split("Bearer ")[1]

        try:
            # Verify the token and get the user's UID
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token["uid"]
        # in all other cases, print error msg
        except Exception as e:
            print("Exception", e)

    else:
        print("Unauthorized")
        uid = None

    return uid


# find required parameters for a given api function: optional parameters will be ignored
def required_parameters(fun: callable) -> list[str]:
    return [
        name
        for name, p in signature(fun).parameters.items()
        if p.default is Parameter.empty
    ]


def update_shots_with_dialogs(
    uid: str, cid: str, shot: list[AudioSegment] | AudioSegment, hashes: list[str]
) -> list[str]:
    shot_urls = []
    if isinstance(shot, AudioSegment):
        shot_urls.append(ds().put_speech(uid, cid, shot, hashes))
    else:
        for line, hash in zip(shot, hashes):
            shot_urls.append(ds().put_speech(uid, cid, line, hash))
    return shot_urls


# callback function for image generation: it uploads images to GCS and returns their URLs
def upload_images(
    uid: str,
    cid: str,
    response: list[dict],
) -> list[str]:
    image_meta = []
    for res in response:
        image_meta.append(
            {
                "url": ds().put_image(uid, cid, res["image"], res["hash"]),
                "bounding_boxes": res["bounding_boxes"],
            }
        )
    return image_meta


# callback function for dialog generation: it uploads speech snippets to GCS and returns their URLs
def upload_dialog(
    uid: str,
    cid: str,
    response: (
        Tuple[list[list[AudioSegment]], list[list[str]]]
        | Tuple[list[AudioSegment], list[str] | Tuple[AudioSegment, str]]
    ),
) -> str | list[str] | list[list[str]]:
    urls = []
    lines, hashes_list = response
    if isinstance(lines, AudioSegment):
        line_url = update_shots_with_dialogs(uid, cid, lines, hashes_list)
        return line_url[0]
    elif any(isinstance(i, list) for i in lines):
        for shot, hashes in zip(lines, hashes_list):
            shot_urls = update_shots_with_dialogs(uid, cid, shot, hashes)
            urls.append(shot_urls)
    else:
        urls = update_shots_with_dialogs(uid, cid, lines, hashes_list)
    return urls


# arguments are passed from request data if provided; otherwise, they're loaded from Firestore
def load_missing_arguments(
    uid: str, cid: str, kwargs: dict, parameters: list[str]
) -> list[str]:
    provided_args = kwargs.keys()

    # determine which parameters are missing from the provided arguments
    missing_parameters = [p for p in parameters if p not in provided_args]

    # load missing arguments from Firestore
    missing_arguments = ds().load(uid, cid, missing_parameters)

    # update the provided arguments with the missing ones
    kwargs.update(missing_arguments)

    # find the parameters that are still missing after loading
    found = missing_arguments.keys()
    still_missing_parameters = [p for p in missing_parameters if p not in found]

    return still_missing_parameters


# wrap the result in a dict if it's not already one to standardize the response format
def response_wrapper(call_name: str, result: any) -> dict:
    return (
        {call_name.removeprefix("get_"): result}
        if not isinstance(result, dict)
        else result
    )


# highest-level generative function dispatching requests to matching api functions:
# it is called from main.py and the test suite
def gen(uid: str, cid: str, call: str, **kwargs) -> dict:
    # lookup the requested function in the api module
    fun = getattr(api, call)

    # execute the function registered handler, defined as an attribute at the bottom of this file
    return fun.handler(uid, cid, fun, **kwargs)


# generate text through a given api callable
def gen_text(uid: str, cid: str, fun: callable, **kwargs) -> dict:
    # load missing arguments in kwargs from Firestore, by comparing the required parameters
    still_missing = load_missing_arguments(uid, cid, kwargs, required_parameters(fun))
    assert len(still_missing) == 0, f"Missing arguments: {still_missing}"

    # execute the request represented by the fun callable
    response = fun(**kwargs)
    return response_wrapper(fun.__name__, response)


# generate images or sound through a given api callable
def gen_media(uid: str, cid: str, fun: callable, **kwargs) -> dict:
    # keep track of unknown arguments after loading missing keys at a creation level in the database
    still_missing = load_missing_arguments(uid, cid, kwargs, required_parameters(fun))

    # media generation requires a scene_id argument for parameter search
    scene_id = kwargs.pop("scene")
    shot_id = "*"
    line_id = "*"
    if "shot_id" in kwargs:
        shot_id = kwargs.pop("shot_id")
    if "line_id" in kwargs:
        line_id = kwargs.pop("line_id")

    if scene_id != "*":
        # go down the creation data tree to find the scene-specific parameters
        subdoc_ref = (
            ds()
            .runtime_path(uid, cid, "creations")
            .collection("scenes")
            .document(str(scene_id))
        )
        kwargs_to_update = ds().load(uid, cid, still_missing, path=subdoc_ref)
        if shot_id != "*":
            shot = subdoc_ref.collection("shots").document(str(shot_id)).get().to_dict()
            kwargs_to_update.update({"shot": shot})
            if line_id != "*":
                line = shot["dialog"][line_id]
                kwargs_to_update.update({"line": line})
        kwargs.update(kwargs_to_update)

    response = fun(**kwargs)

    if hasattr(fun, "callback"):
        # execute the attached callback to upload the generated media to GCS and return the URLs
        response = fun.callback(uid, cid, response)

    return response_wrapper(fun.__name__, response)


# api functions handlers and callbacks attached as attributes and executed by the web module
for fun in [
    api.get_title_plot,
    api.get_summary,
    api.get_locations,
    api.get_characters,
    api.get_character,
    api.get_script,
    api.get_shots,
    api.get_asset_url,
    api.get_ambient_sound_url,
    api.get_captions,
    api.get_acoustic_env,
]:
    fun.handler = gen_text

for fun in [
    api.get_shot_image,
    api.get_shot_images,
    api.get_line_speech,
    api.get_shot_speech,
    api.get_shot_speeches,
    api.get_music,
]:
    fun.handler = gen_media

# media generation executes an upload callback upon completion
api.get_shot_image.callback = upload_images
api.get_shot_images.callback = upload_images
api.get_line_speech.callback = upload_dialog
api.get_shot_speech.callback = upload_dialog
api.get_shot_speeches.callback = upload_dialog
