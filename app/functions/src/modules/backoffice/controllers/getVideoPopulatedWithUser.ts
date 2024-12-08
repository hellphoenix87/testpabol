import { QuerySnapshot } from "firebase-admin/firestore";
import { Video } from "../../../../../shared/types/Video";
import { findElementBinary } from "../../../utils/utils";

export const getVideoPopulatedWithUser = (usersSnapshot: QuerySnapshot, video: Video) => {
  const user = findElementBinary(usersSnapshot.docs, video.author, "uid");
  return { ...video, author_name: user?.display_name };
};
