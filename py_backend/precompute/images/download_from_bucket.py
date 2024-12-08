import pyarrow.parquet as pa
from PIL import Image
import io, os

# This script has been used to download the generated images from the bucket for further processing.

existing_table = pa.read_table(
    "gs://prmx-stage-data/vision/models/project/movie-stable-diffusion/sd1-v-0.0/celebbasis.parquet"
)

df = existing_table.to_pandas()
images = [Image.open(io.BytesIO(img)) for img in df["image_bytes"].tolist()]

# output all images in a folder
FOLDER_NAME = "chars"
os.makedirs(FOLDER_NAME, exist_ok=True)
for i, img in enumerate(images):
    img.save(os.path.join(FOLDER_NAME, f"{i}.png"))
