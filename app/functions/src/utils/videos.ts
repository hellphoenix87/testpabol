import { QuerySnapshot } from "firebase-admin/firestore";
import { Video } from "../../../shared/types";
import { findElementBinary } from "./utils";

export enum SortTypes {
  MOST_VIEWS = "MOST_VIEWS",
  NEWEST = "NEWEST",
  BEST_RATINGS = "BEST_RATINGS",
  RELEVANCE = "RELEVANCE",
}

export const getSortFunction = (sortType: SortTypes) => {
  const mapTypeToSortFunction = {
    [SortTypes.RELEVANCE]: sortByRelevance,
    [SortTypes.MOST_VIEWS]: sortByViews,
    [SortTypes.NEWEST]: sortByDate,
    [SortTypes.BEST_RATINGS]: sortByRating,
  };

  return mapTypeToSortFunction[sortType];
};

// Calculate relevance of a video
const calculateRelevance = (video: Video): number => {
  const NOISE = Math.random() * 0.1;
  const VIEWS_WEIGHT = 0.4;
  const RATING_WEIGHT = 0.3;
  const RECENCY_WEIGHT = 0.3;
  const INVERSE_FACTOR = 1;

  const views = VIEWS_WEIGHT * video.views;
  const rating = RATING_WEIGHT * (video.likes - video.dislikes);
  const recency = RECENCY_WEIGHT * (INVERSE_FACTOR / video.created_at._seconds);

  return views + rating + recency + NOISE;
};

// Sort videos by relevance (views, rating, recency)
const sortByRelevance = (video1: Video, video2: Video): number => {
  return calculateRelevance(video2) - calculateRelevance(video1);
};

// Sort videos by most views
const sortByViews = (video1: Video, video2: Video): number => {
  return video2.views - video1.views;
};

// Sort videos by rating (rating = likes - dislikes)
const sortByRating = (video1: Video, video2: Video): number => {
  const video1Rating = video1.likes - video1.dislikes;
  const video2Rating = video2.likes - video2.dislikes;
  return video2Rating - video1Rating;
};

// Sort videos by date
export const sortByDate = (doc1: { created_at?: any }, doc2: { created_at?: any }): number => {
  if (!doc1.created_at || !doc2.created_at) {
    return 0;
  }
  return doc2.created_at._seconds - doc1.created_at._seconds;
};

/**
 Returns a video object populated with user information.
 @param {Object} usersSnapshot - The snapshot of users.
 @param {Object} video - The video object.
 @returns {Object} - The video object populated with user information.
 */
const getVideoPopulatedWithUser = (usersSnapshot: QuerySnapshot, video: Video) => {
  let user = null;
  try {
    user = findElementBinary(usersSnapshot.docs, video.author, "uid");
  } catch (error) {
    // Video authour has been deleted or not found
    console.log("Video author has been deleted or not found", error);
  }
  return { ...video, avatar_url: user?.avatar_url, author_name: user?.display_name };
};

export const getPopulatedVideosFromSnapshot = (
  snapshot: QuerySnapshot,
  usersSnapshot: QuerySnapshot,
  title: string,
  neighbors: Array<{ datapoint: { datapointId: string } }>
) => {
  const videos = [];

  if (!title || title.length === 0) {
    return snapshot.docs.map(video => getVideoPopulatedWithUser(usersSnapshot, video.data() as Video));
  }

  for (const doc of neighbors) {
    const docData = findElementBinary(snapshot.docs, doc.datapoint.datapointId, "id") as Video;

    if (!docData) {
      continue;
    }

    videos.push(getVideoPopulatedWithUser(usersSnapshot, docData));
  }

  return videos;
};

export const getSortedVideos = (videos: Video[], sortType: SortTypes, isSearch: boolean) => {
  if (!sortType || (isSearch && sortType === SortTypes.RELEVANCE)) {
    return videos;
  }

  return videos.sort(getSortFunction(sortType));
};
