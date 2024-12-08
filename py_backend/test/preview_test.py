# Test helpers, used to add some common methods used by multiple tests

import subprocess
import requests

from prmx import datastore_local
from pathlib import Path
from prmx.datastore import client
from PIL import Image
from google.cloud import firestore
import threading
from pydub import AudioSegment
from datetime import datetime

from prmx.util import gcp_project_id, load_json

ds_local = datastore_local.DatastoreLocal()
ds_remote = datastore_local.DataStore()


# Save Scenes mock to the firestore.
def saveScenesMetadata(uid, cid, remote_cid):
    scenes = ds_local.load(uid, cid, "scenes")
    for idx, scene in enumerate(scenes):
        scene["id"] = str(idx)
        (
            ds_remote.runtime_path(uid, remote_cid, "creations")
            .collection("scenes")
            .document(str(idx))
            .set(scene)
        )
    return len(scenes)


# Upload image hash to the GCP bucket
def saveImageToBucket(hash, uid, cid, remote_cid) -> str:
    image = Image.open(f"runtime/{uid}/{cid}/media/{hash}.png")
    bbox = load_json(f"runtime/{uid}/{cid}/bbox_{hash}.json")
    ds_remote.put_image(uid, remote_cid, image, hash)
    return f"{uid}/{remote_cid}/{hash}.png"


# Upload speech hash to the GCP bucket
def saveSpeechToBucket(hash, uid, cid, remote_cid) -> str:
    audio = AudioSegment.from_mp3(f"runtime/{uid}/{cid}/media/{hash}.mp3")
    ds_remote.put_speech(uid, remote_cid, audio, hash)
    return f"{uid}/{remote_cid}/{hash}.mp3"


# used to prepare the test media files so video can be generated by baker firebase function
def prepare_test_media_files(instance) -> str:
    """upload all speech (mp3) and image (png) assets under the configured cid to test video gen"""
    remote_cid = str(round(datetime.now().timestamp()))
    num_scenes = saveScenesMetadata(instance.uid, instance.cid, remote_cid)
    ds_remote.runtime_path(instance.uid, remote_cid, "creations").set(
        {"scenes_order": [str(i) for i in range(num_scenes)]}
    )
    for scene in range(num_scenes):
        shots = ds_local.load(instance.uid, instance.cid, f"shots_{scene}")
        shot_id = 0
        for shot in shots:
            shot["image_url"] = saveImageToBucket(
                shot["image_hash"], instance.uid, instance.cid, remote_cid
            )
            shot["dialog"] = [
                {
                    "line": dialog["line"],
                    "id": dialog["character_id"],
                    "line_url": saveSpeechToBucket(
                        dialog["speech_hash"], instance.uid, instance.cid, remote_cid
                    ),
                }
                for dialog in shot["dialog"]
            ]
            shot["id"] = f"shot-{str(scene)}-{str(shot_id)}"
            (
                ds_remote.runtime_path(instance.uid, remote_cid, "creations")
                .collection("scenes")
                .document(str(scene))
                .collection("shots")
                .document(str(shot_id))
                .set(shot)
            )
            shot_id = shot_id + 1

    return remote_cid


# download the preview video file from the bucket.
def downloadPreviewVideo(video_url: str) -> str:
    bucket = client("media")
    path = Path("runtime/" + video_url)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.mkdir(parents=True, exist_ok=True)
    print(f"downloading {video_url} from {bucket.name}")
    blobs = bucket.list_blobs(prefix=video_url)  # Get list of files
    for blob in blobs:
        filename = blob.name.split("/")[-1]
        blob.download_to_filename(path.as_posix() + "/" + filename)  # Download
    print(f"Download successful: open {path}/init.m3u8 and grab some popcorn.")
    return path

# Firestore listener
def on_snapshot(doc_snapshot, changes, read_time, event):
    for doc in doc_snapshot:
        print(f'Received document snapshot: {doc.id}')
        if doc.exists and doc.to_dict().get("status") == "READY":
            print(f'Document {doc.id} has been ready')
            event.set()

def preview_video(uid: str, cid: str, app_hash: str) -> object:
    """make a video from pre-generated media (image, sound) and push it to the datastore
    making a video is a superset of baking it: the frontend also requires storage

    Parameters
    ----------
    uid : str
        user id
    cid : str
        creation id

    app_hash: str
        firebase app commit hash

    Returns
    -------
    the firebase function body
    """

    project = gcp_project_id()
    REGION = "us-central1"

    url = f"https://{REGION}-{project}.cloudfunctions.net/{app_hash}_kitchen/cookVideo"
    print(url)
    print(app_hash)
    # Use the terminal GCloud command to let the developer automatically log in without configuring the json credentials file
    token = (
        subprocess.check_output("gcloud auth print-identity-token", shell=True)
        .rstrip()
        .decode("ascii")
    )

    print("Start Baking Video")
    print(cid)

    # Initialize Firestore client
    db = firestore.Client()

    # Get the document reference
    doc_ref = db.collection('videos').document(cid)
    print(doc_ref)

    # Create an event
    event = threading.Event()

    # Attach listener to the document
    doc_watch = doc_ref.on_snapshot(lambda doc_snapshot, changes, read_time: on_snapshot(doc_snapshot, changes, read_time, event))
    
    # Wait until the video is ready
    #event.wait()

    # Stop the listener
    #doc_watch.close()

    response = requests.post(
        url=url,
        json={"data": {"creationId": cid, "uid": uid}},
        headers={"x-authorization": f"Bearer {token}"},
        timeout=3600,
    )
    if response.status_code != 200:
        print("Video Baking Failed")
    else:
        print("Video Baked")
    return response.json()
