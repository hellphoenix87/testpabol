"""Utilities functions"""

import hashlib
import json
import os
import re
from functools import cache
from typing import Any
import firebase_admin
import google.auth.transport.requests
import numpy as np
import requests
from pprint import pprint
from google import oauth2
from google.cloud import secretmanager


def save_to_txt(string: str, filename: str) -> None:
    """Write to file"""
    if os.path.isfile(filename):
        print(f"[WARNING] Overwriting file {filename}")
    with open(filename, "w", encoding="utf-8") as obj:
        obj.write(string)


def load_txt(filename: str) -> str:
    """Read from file"""
    with open(filename, "r", encoding="utf-8") as obj:
        return obj.read()


def load_json(path: str) -> Any:
    """Read json file or return None if the file does not exist"""
    if not os.path.exists(path):
        return None
    with open(path, "r") as file:
        try:
            data = json.load(file)
            return data
        except json.JSONDecodeError as e:
            print(f"[ERROR] Found {path} but could not parse JSON.")
            raise e


def unit_test_app_init(credential=None) -> firebase_admin.App:
    try:
        app = firebase_admin.get_app()
    except ValueError:
        # hardcode stage project id for safety: you don't want to run tests in prod,
        # but that's what firebase_admin.initialize_app() would do if your shell touched prod
        app = firebase_admin.initialize_app(
            credential=credential, options={"projectId": gcp_project_id()}
        )
    return app


def gcp_project_id() -> str:
    """
    Returns GCP project id from env variable.
    """
    proj = os.environ["GOOGLE_CLOUD_PROJECT"]
    print(f"[INFO] Project ID: {proj}")
    return proj


# get the url of a self-hosted model's inference service
def inference_url(model: str, path: str = "") -> str:
    domain = os.environ["INFERENCE_DOMAIN"]
    return f"https://{model}.{domain}/{path}"


def oidc_token() -> str:
    """Get an authorized token to pass in inference request headers"""

    credentials = oauth2.service_account.IDTokenCredentials.from_service_account_info(
        info=json.loads(os.environ["INFERENCE_KEY"]),  # inference service account key
        target_audience=os.environ["INFERENCE_CLIENT_ID"],  # OAuth client ID
    )
    credentials.refresh(google.auth.transport.requests.Request())
    return credentials.token


# parse the json response from a self-hosted model's inference service running on mlflow (default)
def parse_mlflow_response(response: requests.Response, keys: list) -> list:
    try:
        parsed_response = response.json()
    except requests.exceptions.JSONDecodeError:
        raise ValueError(
            f"could not parse the json inference response: '{response.text}'"
        )

    try:
        predictions = parsed_response["predictions"][0]["0"]
    except KeyError:
        pprint(parsed_response)
        raise ValueError(
            "could not find one of ['predictions'][0]['0'] keys in the parsed response"
        )

    values = []
    for key in keys:
        try:
            value = predictions[key]
            values.append(value)
        except KeyError:
            pprint(predictions)
            raise ValueError(f"could not find the '{key}' key in inferred results")

    return values


# build optimization: datastore.DataStore is any to remove prmx imports and limit download.py triggers
def loader(uid: str, cid: str, ds: Any, names: list[str]) -> list[Any]:
    """load, unpack and assign previous results to variables

    Parameters
    ----------
    cid : str
        creation id of work-in-progress movie
    ds : DataStore
        datastore object storing film artefacts
    names : list[str]
        names of previous results like "title", "plot" or "locations"

    Examples
    --------
    >>> from util import loader
    >>> char, loc, scenes = loader(uid, cid, ds, ["characters", "locations", "scenes"])
    """
    return [ds.load(uid, cid, name) for name in names]


# split string at the first occurrence of .,:; and return the two parts
def split_string_non_alphanumeric(string: str) -> tuple[str, str]:
    for i, char in enumerate(string):
        if char in ".,:;-":
            return string[:i].strip(), string[i + 1 :].strip()
    return string, ""


def split_newlines(item_list):
    item_list = item_list.split("\n")
    item_list = [item for item in item_list if item != ""]
    return item_list


def split_paragraphs(plot: str):
    scenes = plot.split("\n\n")
    scenes = [scene.strip() for scene in scenes if scene.strip() != ""]
    return scenes


def replace_references(string: str, char_list: list[dict], loc_list: list[dict]) -> str:
    for i, char in enumerate(char_list):
        string = string.replace(f"<Character {i}>", char["name"])
    for i, loc in enumerate(loc_list):
        string = string.replace(f"<Location {i}>", loc["name"])
    return string


# this function replaces references in a prompt with the selected image embedding id,
# because, the image generation model we have needs
# the embedding id of the selected image, not the character id
def replace_references_for_shot_image_prompting(
    string: str, char_list: list[dict], loc_list: list[dict]
) -> tuple[str, dict]:
    char_embedding_mapping = {}
    for char in char_list:
        character = char["id"]
        target = f"<Character {character}>"
        replacer = f"<Character {char['embedding_ids'][char['selected_image_index']]}>"
        string = string.replace(target, replacer)
        char_embedding_mapping[replacer] = char["id"]

    for i, loc in enumerate(loc_list):
        string = string.replace(f"<Location {i}>", loc["name"])
    return string, char_embedding_mapping


# optimized to replace one or few references of the same type
def replace_reference(string: str, placeholder: str, _list: list[dict]) -> str:
    indices = re.findall(f"<{placeholder} ([0-9]+)>", string)
    for i in indices:
        name = _list[int(i)]["name"]
        string = string.replace(f"<{placeholder} {i}>", name)
    return string


# We want the LLM to output:
# Asset 0: Description of asset 0
# but not:
# Asset 0:
# Description of asset 0
# Yet sometimes, the LLM outputs the second version. This function replaces the second version with the first.
def replace_doublepoint_newline(string: str) -> str:
    return string.replace(":\n", ": ")


# This function returns a hash value of data.
def hash(data: dict | list | str, num_digits: int = 8) -> str:
    # Convert the dictionary to a string representation
    data_str = (
        json.dumps(data, sort_keys=True) if type(data) in [dict, list] else str(data)
    )
    encoded_str = data_str.encode("utf-8")
    # Generate the hash value
    hash_value = hashlib.sha256(encoded_str, usedforsecurity=False).hexdigest()
    # Truncate the hash
    return hash_value[:num_digits]


# Given a list of dot products, return the indices of the 'n' best matches
def get_best_dot_matches(dot_prods: np.array, n: int = 1):
    # flatten dot_prods if it is not already a 1D array
    dot_prods = dot_prods.flatten()

    # Check if n is larger than the size of dot_prods
    n = min(n, len(dot_prods))

    # Get 'n' best matches
    indices = np.argpartition(dot_prods, -n)[-n:]
    # Sort these indices by their corresponding scores in descending order
    indices = indices[np.argsort(-dot_prods[indices])]
    return indices


@cache
def get_gcp_secret(name: str) -> str:
    """Get GCP secret value"""

    client = secretmanager.SecretManagerServiceClient()
    response = client.access_secret_version(
        name=f"projects/{gcp_project_id()}/secrets/{name}/versions/latest",
    )
    return response.payload.data.decode("UTF-8")


def setup_env_secrets() -> None:
    """Setup environment variables from GCP secrets.
    Required for running local scripts and tests.
    NOT required for runtime
    NOT required for test in CI
    """

    os.environ["OPENAI_API_KEY"] = get_gcp_secret("openai")
    os.environ["INFERENCE_KEY"] = get_gcp_secret("inference_key")
    os.environ["INFERENCE_CLIENT_ID"] = get_gcp_secret("inference_client_id")
