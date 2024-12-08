"""Data interface abstracting filmmaking from reads & writes in the production, cloud setting"""

import io
from functools import cache
from typing import Union, Optional
from PIL.Image import Image
from firebase_admin import firestore, storage
from google.cloud.firestore_v1.batch import WriteBatch
from google.cloud.firestore_v1.collection import CollectionReference
from google.cloud.firestore_v1.document import DocumentReference
from google.cloud.storage import Bucket
from google.cloud.storage.blob import Blob
from pydub import AudioSegment
from prmx.util import gcp_project_id


# defines a lazy variable with a result cache to only instantiate client once, if called
@cache
def client(bucket_prefix: str) -> Bucket:
    return storage.bucket(name=f"{bucket_prefix}-{gcp_project_id()}")


def build_saving_ref(
    name: str, path: DocumentReference, is_collection: bool
) -> tuple[str, Union[DocumentReference, CollectionReference]]:
    if name:
        names = name.split(".")

        while len(names) > 1:
            if type(path) is DocumentReference:
                path = path.collection(names.pop(0))
            else:
                path = path.document(names.pop(0))

        # when result_type is a list of dict, the last name is the name of a collection
        if is_collection and type(path) is DocumentReference:
            path = path.collection(names[0])
            name = ""
        else:
            name = names[0]

    # pass parameters through if name is empty
    return name, path


class DataStore:
    def __init__(self) -> None:
        # Folder where we store temporary files about the creation
        self.local_folder = "runtime/"

    def media_path(self, uid: str, cid: str, path: str) -> str:
        assert uid and cid, "uid and cid cannot be empty to build a path"
        # our Gold Standard to store files in GStorage, Firestore or locally: security rules depend on it
        return f"{uid}/{cid}/{path}"

    def put_image(self, uid: str, cid: str, image: Image, hash: str) -> str:
        mem_file = io.BytesIO()
        image.save(mem_file, format=image.format)
        mem_file.seek(0)  # upload stream must be at the beginning
        bucket = client("media")
        key = self.media_path(uid, cid, f"{hash}.png")
        print(f"uploading {key} to {bucket.name}")
        blob = Blob(key, bucket)
        blob.upload_from_file(mem_file, content_type="image/png")
        return key

    def put_speech(self, uid: str, cid: str, speech: AudioSegment, hash: str) -> str:
        mem_file = io.BytesIO()
        speech.export(mem_file, format="mp3")
        mem_file.seek(0)
        bucket = client("media")
        key = self.media_path(uid, cid, f"{hash}.mp3")
        print(f"uploading {key} to {bucket.name}")
        Blob(key, bucket).upload_from_file(mem_file, content_type="audio/mpeg")
        return key

    def runtime_path(self, uid: str, cid: str, name: str) -> DocumentReference:
        return (
            firestore.client()
            .collection("creators")
            .document(uid)
            .collection(name)
            .document(cid)
        )

    # recursively map a data structure to Firestore documents and save in a single batch
    def save(
        self,
        uid: str,
        cid: str,
        name: str,
        result: Union[str, int, float, dict, list],
        batch: Optional[WriteBatch] = None,
        path: Optional[DocumentReference] = None,
    ) -> None:
        result_type = type(result)
        assert result_type in [
            str,
            int,
            float,
            dict,
            list,
        ], f"unsupported type {result_type} for {result}"
        assert (
            name != "" or result_type is dict
        ), f"empty name for {result_type} {result}: can only be empty with a dict."

        # dialogs, dicts with keys 'emotion', 'id' and 'line', should not be stored as a collection
        # dict with name voices should also not be stored as a collection
        is_collection = (
            result_type is list
            and len(result) > 0
            and "voices" not in name
            and type(result[0]) is dict
            and sorted(list(result[0])) != ["character_id", "emotion", "line"]
        )

        if batch is None:
            batch = firestore.client().batch()
        if path is None:
            path = self.runtime_path(uid, cid, "creations")

        name, path = build_saving_ref(name, path, is_collection)

        if is_collection:
            for i, item in enumerate(result):
                # saving list items as ordered and indexed documents in the last collection
                self.save(uid, cid, "", item, batch=batch, path=path.document(str(i)))

        elif result_type is dict:
            for key, value in result.items():
                self.save(uid, cid, key, value, batch=batch, path=path)

        else:
            if name:
                result = {name: result}
            batch.set(path, result, merge=True)

        batch.commit()

    def load(
        self,
        uid: str,
        cid: str,
        name: Union[str, list[str]],
        path: Optional[DocumentReference] = None,
    ) -> dict:
        """load references from Firestore

        Parameters
        ----------
        uid : str
            user id
        cid : str
            creation id
        name : Union[str, list[str]]
            name of the reference to load, can be:
            - a simple string to load a top-level field in the creation document like 'title'
            - a simple string to load a top-level subcollection like 'scenes'
            - a list of strings combining the two aforementioned cases
            - a dot-separated string to load a nested field or collection like 'scenes.0.shots':
            this notation is targeted, it is not supported in a list
        """
        if path is None:
            path = self.runtime_path(uid, cid, "creations")
        name_type = type(name)

        if name_type is str and "." in name:
            names = name.split(".")
            while len(names) > 1:
                if type(path) is DocumentReference:
                    path = path.collection(names.pop(0))
                else:
                    path = path.document(names.pop(0))
            name = names[0]

        subcollections = [collection.id for collection in path.collections()]
        keys = name if name_type is list else [name]
        doc = path.get(
            keys
        )  # only fields in keys are retrieved, subcollections are not

        data = {}
        for key in keys:
            if key in subcollections:
                docs = path.collection(key).get()
                docs_dict = [
                    (doc.id, doc.to_dict()) for doc in docs
                ]  # Creating a list of tuples
                # Sort the documents based on document id/path
                sorted_docs_dict = sorted(docs_dict, key=lambda x: int(x[0]))

                # Get the sorted list of documents
                sorted_docs = [doc[1] for doc in sorted_docs_dict]

                data[key] = sorted_docs

        if doc.exists:
            data.update(doc.to_dict())
        elif not data:
            print(
                f"reference 'creators/{uid}/creations/{cid}/<path>/{name}' not found in database"
            )

        return data
