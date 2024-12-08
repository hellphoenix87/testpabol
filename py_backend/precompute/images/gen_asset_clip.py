# This step is executed after the asset image generation
# Purpose:
# - Convert to JPG
# - Create CLIP embeddings for all images
# - filter images where CLIP is too close to a person
# - crop to remove watermark

import os
import numpy as np
from transformers import CLIPModel, CLIPImageProcessor, CLIPTokenizer
import torch
from PIL import Image
from tqdm import tqdm
import shutil
import argparse

argParser = argparse.ArgumentParser()
argParser.add_argument("--folder", help="folder to process")
argParser.add_argument("--watermark_height", help="height of the watermark", default=22)
argParser.add_argument("--debug", help="debug mode", action="store_true")

args = argParser.parse_args()

SUFFIX_CLIP_FILE = "_clip.npy"
SUFFIX = "_processed"

clip_model = CLIPModel.from_pretrained(
    "laion/CLIP-ViT-H-14-laion2B-s32B-b79K", torch_dtype=torch.float32
)
image_processor = CLIPImageProcessor.from_pretrained(
    "laion/CLIP-ViT-H-14-laion2B-s32B-b79K"
)

CUDA = True

if CUDA:
    clip_model = clip_model.cuda()

tokenizer = CLIPTokenizer.from_pretrained("laion/CLIP-ViT-H-14-laion2B-s32B-b79K")


def get_clip_vector(image):
    image = image_processor(images=image, return_tensors="pt")["pixel_values"]
    image = image.cuda()
    with torch.no_grad():
        emb = clip_model.get_image_features(image)
    return emb


def get_clip_text(text):
    with torch.no_grad():
        text = tokenizer(text, padding=True, return_tensors="pt")
        text = {k: v.cuda() if CUDA else v for k, v in text.items()}
        emb = clip_model.get_text_features(**text)
    return emb


def generate_clip(folder: str):
    clip_filename = folder + SUFFIX_CLIP_FILE

    BATCH_SIZE = 64
    filenames = []
    clip_embeds = []
    batch_buffer = []

    # Define a fixed size for all images
    FIXED_SIZE = (512, 512)

    all_filenames = [
        filename for filename in os.listdir(folder) if filename.endswith(".jpg")
    ]
    sorted_filenames = sorted(all_filenames, key=lambda x: int(x.split(".")[0]))

    for filename in tqdm(sorted_filenames[:3000]):
        image = Image.open(os.path.join(folder, filename))
        image = image.convert("RGB")

        # Resize the image to the fixed size
        image = image.resize(FIXED_SIZE)

        batch_buffer.append(image)
        filenames.append(filename)

        if len(batch_buffer) == BATCH_SIZE:
            batch_buffer = [np.array(img) for img in batch_buffer]
            batch_buffer = torch.from_numpy(np.stack(batch_buffer, axis=0))
            batch_buffer = batch_buffer.cuda()
            clip_embeds.append(get_clip_vector(batch_buffer).cpu().numpy())
            batch_buffer = []

    if len(batch_buffer) > 0:
        batch_buffer = [np.array(img) for img in batch_buffer]
        batch_buffer = torch.from_numpy(np.stack(batch_buffer, axis=0))
        batch_buffer = batch_buffer.cuda()
        clip_embeds.append(get_clip_vector(batch_buffer).cpu().numpy())

    clip_embeds = np.concatenate(clip_embeds, axis=0)
    np.save(clip_filename, clip_embeds)
    with open(folder + SUFFIX + "_clip_files.txt", "w") as f:
        f.write("\n".join(filenames))


# crop all images at the top center and save to JPG
def crop(folder):
    res = 512 - int(args.watermark_height)
    SAVE_SUFFIX = "_final"
    if not os.path.exists(folder + SAVE_SUFFIX):
        os.mkdir(folder + SAVE_SUFFIX)

    for filename in tqdm(os.listdir(folder)):
        if not filename.endswith(".png"):
            continue
        # load image
        image = Image.open(os.path.join(folder, filename))
        # convert to RGB
        image = image.convert("RGB")
        if res is not None:
            w, _ = image.size
            image = image.crop((0, 0, w, res))
        # change filename to JPG
        filename = filename[:-4] + ".jpg"
        image.save(os.path.join(folder + SAVE_SUFFIX, filename), quality=95)


def filter_imgs(
    folder, negative_prompt, thresh, remove_from_disk=False, min_saturation=None
):
    excluded_filenames = []
    filtered_filenames = []
    filtered_dist = []
    binary_list = []

    # filter images
    with open(folder + SUFFIX + "_clip_files.txt", "r") as f:
        filenames = f.read().split("\n")

    print("Loaded filenames:", len(filenames))

    # replace ending to jpg
    filenames = [filename[:-4] + ".jpg" for filename in filenames]

    # create clip for negative prompt
    clip_neg = get_clip_text(negative_prompt)
    clip_neg = clip_neg.cpu().numpy()

    # load clip vectors
    clip_filename = folder + SUFFIX_CLIP_FILE
    clip_embeds = np.load(clip_filename)

    assert len(filenames) == len(clip_embeds), f"{len(filenames)} != {len(clip_embeds)}"

    # normalize lengths of vectors
    clip_embeds /= np.linalg.norm(clip_embeds, axis=1, keepdims=True)
    clip_neg /= np.linalg.norm(clip_neg, axis=1, keepdims=True)

    # compute dot prods
    dist = np.squeeze(np.dot(clip_embeds, clip_neg.T))

    # print common statistics about distances
    print("Mean distance:", np.mean(dist))
    print("Median distance:", np.median(dist))
    print("Min distance:", np.min(dist))
    print("Max distance:", np.max(dist))

    assert len(filenames) == len(dist), f"{len(filenames)} != {len(dist)}"

    for filename, d in zip(filenames, dist):
        if min_saturation is not None:
            image = Image.open(os.path.join(folder + "_final", filename))
            # convert to RGB
            image = image.convert("RGB")
            # convert to HSV
            image = image.convert("HSV")
            # compute saturation
            saturation = np.array(image)[:, :, 1].mean()

        if d < thresh and (min_saturation is None or saturation > min_saturation):
            filtered_filenames.append(filename)
            binary_list.append(1)
        else:
            excluded_filenames.append(filename)
            filtered_dist.append(d)
            binary_list.append(0)

    print("Filtered images:", len(excluded_filenames))

    if args.debug:
        # copy filtered images into a new folder folder_negative_prompt
        folder_neg = folder + "_" + negative_prompt
        if not os.path.exists(folder_neg):
            os.mkdir(folder_neg)
        for id, filename in tqdm(enumerate(excluded_filenames)):
            # copy the file and prepend it's position in the list, padded to 4 digits. append it's distance
            shutil.copyfile(
                os.path.join(folder + "_final", filename),
                os.path.join(folder_neg, f"{filtered_dist[id]:.2f}_{filename}.jpg"),
            )

    if remove_from_disk:
        binary_list = np.array(binary_list)
        clip_embeds = clip_embeds[binary_list == 1]
        assert len(filtered_filenames) == len(
            clip_embeds
        ), f"{len(filtered_filenames)} != {len(clip_embeds)}"
        # remove filtered images from disk
        for filename in tqdm(excluded_filenames):
            os.remove(os.path.join(folder + "_final", filename))
        # save the np array of embeddings WITHOUT the excluded ones
        np.save(clip_filename, clip_embeds)
        # save the filenames list into _clip_files.txt WITHOUT the excluded ones
        with open(folder + SUFFIX + "_clip_files.txt", "w") as f:
            f.write("\n".join(filtered_filenames))


def main(folder):
    generate_clip(folder)
    crop(
        folder
    )  # this function is not needed to be run every time, if you are working on cropped images already, just skip it

    # workflow: To test a filter, first set remove_from_disk=False and a low thresh, like 0.15. Then check folder for the right threshold. Then set remove_from_disk=True and a higher thresh, like 0.2
    if folder == "loc":
        filter_imgs("loc", "photo of a person. portrait photography.", 0.18, True)
        filter_imgs("loc", "person looking into the camera.", 0.15, True)
        filter_imgs("loc", "naked person", 0.17, True)
        filter_imgs("loc", "tits and nudity. nsfw.", 0.15, True)
        filter_imgs("loc", "close up photo of a woman.", 0.16, True)
    elif folder == "chars":
        filter_imgs("chars", "nipples. tits.", 0.25, True)
        filter_imgs("chars", "naked tits with nipples. photo.", 0.2, True)
        filter_imgs("chars", "photo of two persons.", 0.22, True)
        filter_imgs("chars", "photo of a group of people.", 0.19, True)
        filter_imgs("chars", "collage of two people.", 0.16, True)
        filter_imgs("chars", "black and white photography", 0.16, True, 10.0)


if __name__ == "__main__":
    main(args.folder)
