# Download the images from the bucket
python download_from_bucket.py
# Generate clip vectors and the text file with the mapping. Also deletes faulty images.
python gen_asset_clip.py --folder="chars" --watermark_height=0

# The same needs to be done for the locations
# ...