import { copyFile } from "./copyFile";
import { getThumbnailImagesUrls } from "./getThumbnailImagesUrls";

export const copyThumbnailImages = async (videoId: string) => {
  const privateThumbnailImagesUrls = await getThumbnailImagesUrls(videoId);

  if (!privateThumbnailImagesUrls) {
    return [];
  }

  const publicThumbnailImagesUrls = [];

  // Copy thumbnail images to public bucket
  for (let i = 0; i < privateThumbnailImagesUrls.length; i++) {
    const thumbnailImageUrl = privateThumbnailImagesUrls[i];
    const publicThumbnailImageUrl = `thumbnails/${videoId}/thumbnail_${i}.png`;
    await copyFile({
      srcBucket: process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE!,
      srcPath: thumbnailImageUrl,
      destBucket: process.env.PABOLO_BUCKET_NAME_PUBLIC_STORAGE!,
      destPath: publicThumbnailImageUrl,
    });
    publicThumbnailImagesUrls.push(publicThumbnailImageUrl);
  }
  return publicThumbnailImagesUrls;
};
