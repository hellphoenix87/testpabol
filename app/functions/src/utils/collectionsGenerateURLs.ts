import { Video } from "../../../shared/types";
import { generateSignedURL } from "./generateURL";

export const generateVideoUrls = async (video: Partial<Video>): Promise<Partial<Video>> => {
  const bucket = video.accepted ? process.env.PABOLO_BUCKET_PUBLIC_CDN : process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE;
  if (video.url && (video.accepted || /.*\.mp4$/.test(video.url))) {
    const url = /.*\/stream$/.test(video.url) ? `${video.url}/init.m3u8` : video.url;
    const videoURL = await generateSignedURL(bucket!, url);
    video.url = videoURL.url;
  }

  const thumbnailImageURLs = await Promise.all(
    video.thumbnail_images_url?.map(url => generateSignedURL(bucket!, url)) || []
  );
  video.thumbnail_images_url = thumbnailImageURLs.map(url => url.url);

  return video;
};
