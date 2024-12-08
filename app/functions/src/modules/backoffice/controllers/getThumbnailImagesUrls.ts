import { getVideoData } from "../../../DB/videosCollection";

export const getThumbnailImagesUrls = async (videoId: string) => {
  const videoSnapShot = await getVideoData(videoId);

  return videoSnapShot?.thumbnail_images_url;
};
