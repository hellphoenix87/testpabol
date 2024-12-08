import { useEffect, useState } from "react";
import PageContainer from "@app/pages/pageContainer";
import { useParams, useNavigate } from "react-router-dom";
import { Video as IVideo } from "@shared/types/Video";
import { getDownloadUrlForPublic } from "@app/util";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import { logger } from "@app/utils/logger";
import VideoPlayer from "./video-player/VideoPlayer";
import { VideoInfo } from "./video-info/VideoInfo";

export default function Video() {
  const [video, setVideo] = useState<IVideo | null>(null);

  const { id } = useParams() as { id: string };
  const navigate = useNavigate();

  const metaDesc =
    video && video.description && video.title ? `Watch ${video.title} on Pabolo - ${video.description}` : "";

  const thumbnailUrl = video?.thumbnail_images_url[0] ? getDownloadUrlForPublic(video?.thumbnail_images_url[0]) : "";

  const requestVideoById = async () => {
    try {
      const result = await callMicroservice<IVideo | null>(firebaseMethods.GET_VIDEO_BY_ID, { id });

      // Redirect to page not found if the video is not found, deleted or not checked by moderation and the user is not the author
      if (!result) {
        navigate("/*");
        return;
      }

      setVideo(result);
    } catch (error) {
      logger.error(error);
      navigate("/*");
    }
  };

  useEffect(() => {
    void requestVideoById();
  }, []);

  return (
    <PageContainer metaTags={{ title: video?.title, description: metaDesc, image: thumbnailUrl }}>
      <VideoPlayer video={video} />
      <VideoInfo video={video} />
    </PageContainer>
  );
}
