import { getScenesSnapshot, getShotData, getShotListSnapshot } from "../../../DB/collectionGetters";

const MAX_RETRIES = 3;

type RetryFunction = (...args: any[]) => Promise<any>;

const retryOnFail = async (fn: RetryFunction, args: any[], retries = MAX_RETRIES): Promise<any> => {
  try {
    return await fn(...args);
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... Attempts left: ${retries - 1}`);
      return retryOnFail(fn, args, retries - 1);
    }
    throw error;
  }
};

const getThumbnailImagesUrlsInternal = async (creatorId: string, videoId: string) => {
  const scenesSnapshot = await getScenesSnapshot(creatorId, videoId);

  if (scenesSnapshot.empty) {
    throw new Error("No scenes found");
  }

  const numberOfScenes = scenesSnapshot.size;

  const secondSceneId = scenesSnapshot.docs[1 % numberOfScenes]?.id;
  const thirdSceneId = scenesSnapshot.docs[2 % numberOfScenes]?.id;

  const [secondSceneShot, thirdSceneShot] = await Promise.all([
    getRandomShotInScene(creatorId, videoId, secondSceneId),
    getRandomShotInScene(creatorId, videoId, thirdSceneId),
  ]);

  let imagesIds = [];
  if (numberOfScenes > 2) {
    imagesIds = [
      { sceneId: scenesSnapshot.docs[0]?.id, shotId: "0" },
      { sceneId: secondSceneId, shotId: secondSceneShot?.id },
      { sceneId: thirdSceneId, shotId: thirdSceneShot?.id },
    ];
  } else {
    imagesIds = [
      { sceneId: scenesSnapshot.docs[0]?.id, shotId: "0" },
      ...scenesSnapshot.docs
        .filter(scene => scene.id !== scenesSnapshot.docs[0]?.id)
        .map(async scene => {
          const selectedShot = await getRandomShotInScene(creatorId, videoId, scene.id);
          return {
            sceneId: scene.id,
            shotId: selectedShot?.id,
          };
        }),
    ];
  }

  const shotsImagesUrls = [];
  for (const image of imagesIds) {
    const { sceneId, shotId } = await image;
    if (sceneId && shotId) {
      const shotImageUrl = await getShotImageUrl(creatorId, videoId, sceneId, shotId);
      shotsImagesUrls.push(shotImageUrl);
    }
  }

  return shotsImagesUrls;
};

const getRandomShotInScene = async (creatorId: string, videoId: string, sceneId: string) => {
  return retryOnFail(getRandomShotInSceneInternal, [creatorId, videoId, sceneId]);
};

const getRandomShotInSceneInternal = async (creatorId: string, videoId: string, sceneId: string) => {
  const shotsSnapshot = await getShotListSnapshot(creatorId, videoId, sceneId);

  if (shotsSnapshot.empty) {
    throw new Error("No shots found in scene");
  }

  const numberOfShots = shotsSnapshot.size;
  const randomShotIndex = Math.floor(Math.random() * numberOfShots);

  const shot = shotsSnapshot.docs[randomShotIndex];

  return shot.data();
};

const getShotImageUrl = async (creatorId: string, videoId: string, sceneId: string, shotId: string) => {
  return retryOnFail(getShotImageUrlInternal, [creatorId, videoId, sceneId, shotId]);
};

const getShotImageUrlInternal = async (creatorId: string, videoId: string, sceneId: string, shotId: string) => {
  const imageData = await getShotData(creatorId, videoId, sceneId, shotId);

  if (!imageData) {
    throw new Error("No image data found for shot");
  }

  const imageUrl = imageData.image_url?.replace("prmx-stage-media/", "");
  return imageUrl;
};

export const getThumbnailImagesUrls = async (creatorId: string, videoId: string) => {
  return retryOnFail(getThumbnailImagesUrlsInternal, [creatorId, videoId]);
};
