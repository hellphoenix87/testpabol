#!/usr/bin/env python3
"""
one-off processes, similarly to run_precompute.py: artifact downloads
"""

import torch
from transformers import CLIPTokenizer, CLIPTextModelWithProjection
import os
from google.cloud.storage.blob import Blob
from google.cloud.storage.bucket import Bucket
from google.cloud import storage
from pathlib import Path

CACHE_DIR = ".huggingface_cache"
CLIP_TEXT_MODEL = "laion/CLIP-ViT-H-14-laion2B-s32B-b79K"

clip_text_model_paths = {
    "local_tokenizer": f"{CACHE_DIR}/{CLIP_TEXT_MODEL}_CLIPTokenizer.pt",
    "remote_tokenizer": f"models/{CLIP_TEXT_MODEL}/CLIPTokenizer.pt",
    "local_model": f"{CACHE_DIR}/{CLIP_TEXT_MODEL}_CLIPTextModelWithProjection.pt",
    "remote_model": f"models/{CLIP_TEXT_MODEL}/CLIPTextModelWithProjection.pt",
}


def extract_clip_text_model(
    bucket: Bucket,
    paths: dict[str, str] = clip_text_model_paths,
) -> None:
    """Extract a subset of CLIP weights to use for text encoding and discard several gigabytes."""

    tokenizer = CLIPTokenizer.from_pretrained(CLIP_TEXT_MODEL, cache_dir=CACHE_DIR)
    torch.save(tokenizer, paths["local_tokenizer"])
    print(f"uploading {paths['local_tokenizer']} to {bucket.name}")
    Blob(paths["remote_tokenizer"], bucket).upload_from_filename(
        paths["local_tokenizer"]
    )

    model = CLIPTextModelWithProjection.from_pretrained(
        CLIP_TEXT_MODEL, cache_dir=CACHE_DIR
    )
    torch.save(model, paths["local_model"])
    print(f"uploading {paths['local_model']} to {bucket.name}")
    Blob(paths["remote_model"], bucket).upload_from_filename(paths["local_model"])


def download_clip_text_model(
    bucket: Bucket,
    paths: dict[str, str] = clip_text_model_paths,
) -> None:
    if (
        not os.path.exists(paths["local_model"])
        or os.path.getsize(paths["local_model"]) == 0
    ):
        # download the tokenizer first to avoid partial downloads (only checking the model path above)
        print(f"downloading {paths['local_tokenizer']} from {bucket.name}")
        Blob(paths["remote_tokenizer"], bucket).download_to_filename(
            paths["local_tokenizer"]
        )
        print(f"downloading {paths['local_model']} from {bucket.name}")
        Blob(paths["remote_model"], bucket).download_to_filename(paths["local_model"])
    else:
        print(f"found {paths['local_model']} in local cache, skipping download")


if __name__ == "__main__":
    # Create local cache with clip text model subfolder if it doesn't exist.
    Path(CACHE_DIR + "/" + CLIP_TEXT_MODEL.split("/")[0]).mkdir(
        parents=True, exist_ok=True
    )

    storage_client = storage.Client()
    asset_bucket = Bucket(storage.Client(), name=os.environ["BUCKET_ASSET"])

    # Extract CLIP text model from full CLIP model if it doesn't already exist in the data bucket.
    if not Blob(clip_text_model_paths["remote_model"], asset_bucket).exists(
        storage_client
    ):
        extract_clip_text_model(asset_bucket)
    download_clip_text_model(asset_bucket)
