import json
import os
from typing import Any
from PIL.Image import Image
from pydub import AudioSegment
from prmx.util import save_to_txt, load_json
from prmx.datastore import DataStore
import pickle


def create_dir_if_not_there(path: str) -> None:
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)


class DatastoreLocal(DataStore):
    def __init__(self) -> None:
        super().__init__()

        root = "py_backend"
        cwd = os.getcwd()
        unix_location = cwd.split("/")[-1]
        # app is the working directory of a containerized py_backend, see Dockerfile
        assert unix_location in ["app", root] or cwd.split("\\")[-1] == root, (
            "You must be in the repository root to call the local datastore. Current working directory: "
            + cwd
        )
        # create the runtime directory and the local musicdb cache in one call
        create_dir_if_not_there(self.local_folder + "musicdb")

    # reuse media_path from parent class to align with the GCS structure & nest media files
    def runtime_path(self, uid: str, cid: str, filename: str) -> str:
        full_path = self.local_folder + self.media_path(uid, cid, "")
        create_dir_if_not_there(full_path)
        return full_path + filename

    def local_media(self, uid: str, cid: str, filename: str) -> str:
        full_path = self.local_folder + self.media_path(uid, cid, "media/")
        create_dir_if_not_there(full_path)
        return full_path + filename

    def save(self, uid: str, cid: str, name: str, result: any, binary=False) -> None:
        # if result is binary, serialize as pickle
        if binary:
            pickle.dump(result, open(self.runtime_path(uid, cid, name) + ".pkl", "wb"))
        else:
            json_txt = json.dumps(result, indent=4)
            save_to_txt(json_txt, self.runtime_path(uid, cid, name) + ".json")

    def load(self, uid: str, cid: str, name: str, binary=False) -> any:
        if binary:
            return pickle.load(open(self.runtime_path(uid, cid, name) + ".pkl", "rb"))
        else:
            return load_json(self.runtime_path(uid, cid, name) + ".json")

    def put_image(self, uid: str, cid: str, image: Image, hash: str) -> None:
        image.save(self.local_media(uid, cid, f"{hash}.png"))

    def put_speech(self, uid: str, cid: str, speech: AudioSegment, hash: str) -> None:
        speech.export(self.local_media(uid, cid, f"{hash}.mp3"), format="mp3")
