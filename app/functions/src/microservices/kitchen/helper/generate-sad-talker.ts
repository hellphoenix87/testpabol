import { Scene } from "../../../schema/Scene.schema";
import { Shot } from "../../../schema/Shot.schema";
import { PubSubService } from "./pub-sub-invoker";
import { ShotDuration } from "../../../../../shared";
import { AnimatedShots } from "../../../schema/CreationMeta.schema";
import { setCreationData } from "../../../DB/creationRepository";

export interface SadTalkerRequestProps {
  duration: number;
  image_url: string;
  bounding_boxes?: { box: number[]; character_id: string }[];
  speech_data: { character_id: string; line_url: string; start_at: number }[];
  data_bucket: string;
  output_path: string;
}

interface ShotMappedData {
  sceneId: string;
  shotIndex: number;
  shotId: string;
  req: SadTalkerRequestProps;
}

const isMissingSadTalkerVideo = (shot: Shot) => {
  return !shot.video_url && shot.image_url && shot.dialog?.length && shot.bounding_boxes?.length;
};

const saveAnimatedShotsStatus = async (props: {
  uid: string;
  creationId: string;
  videoMapArr: ShotMappedData[];
}): Promise<void> => {
  const animatedShots: AnimatedShots = {};
  for (let i = 0; i < props.videoMapArr.length; i++) {
    const sceneId = props.videoMapArr[i].sceneId;
    const shotId = props.videoMapArr[i].shotId;
    animatedShots[`scene_${sceneId}_shot_${shotId}`] = {
      video_url: props.videoMapArr[i].req.output_path,
      duration: props.videoMapArr[i].req.duration,
      isGenerated: false,
    };
  }
  await setCreationData(props.uid, props.creationId, { animatedShots });
};

const getTargetShotMappedData = (props: {
  scenes: Scene[];
  bucket: string;
  durations: ShotDuration[];
  animatedShots: AnimatedShots;
}): ShotMappedData[] => {
  const requestData: ShotMappedData[] = [];

  props.scenes.forEach((scene: Scene, sceneIndex: number) => {
    scene.shots?.forEach((shot: Shot, shotIndex: number) => {
      const shotDurations = props.durations.find(d => d.sceneIdx === sceneIndex && d.shotIdx === shotIndex);
      if (
        isMissingSadTalkerVideo(shot) &&
        shotDurations &&
        !props.animatedShots?.[`scene_${scene.id}_shot_${shot.id}`]?.isGenerated
      ) {
        requestData.push({
          sceneId: scene.id,
          shotId: shot.id,
          shotIndex,
          req: {
            duration: Math.floor(shotDurations.duration),
            image_url: shot.image_url,
            bounding_boxes: shot.bounding_boxes.map(boundingBox => ({
              ...boundingBox,
              box: boundingBox.box.map(box => Math.round(box)),
            })),
            speech_data: shot.dialog?.map((item, i) => ({
              character_id: item.character_id,
              line_url: item.line_url as string,
              start_at: Math.floor(shotDurations.dialog[i]),
            })),
            data_bucket: props.bucket,
            output_path: shot.image_url.replace(/\..+$/, ".mp4"),
          },
        });
      }
    });
  });
  return requestData;
};

export const generateSadTalkerVideos = async (props: {
  scenes: Scene[];
  uid: string;
  creationId: string;
  durations: ShotDuration[];
  animatedShots: AnimatedShots;
}): Promise<void> => {
  const pubsub = new PubSubService();
  const BUCKET = process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE;

  if (!BUCKET) {
    return;
  }

  // get the pub/sub requests data and if no requests generated return the current scenes.
  const targetShotsData = getTargetShotMappedData({
    scenes: props.scenes,
    bucket: BUCKET,
    durations: props.durations,
    animatedShots: props.animatedShots,
  });

  if (!targetShotsData?.length) {
    return;
  }

  // save the shots that need to be animated.
  await saveAnimatedShotsStatus({ uid: props.uid, creationId: props.creationId, videoMapArr: targetShotsData });

  // publish the pub/sub messages then wait for all the videos to be generated;
  await Promise.all(
    targetShotsData.map(targetShot =>
      pubsub.publish(
        {
          dataframe_records: [targetShot.req],
        },
        {
          creation_id: props.creationId,
          user_id: props.uid,
          scene_id: targetShot.sceneId,
          shot_index: targetShot.shotIndex.toString(),
          shot_id: targetShot.shotId.toString(),
        }
      )
    )
  );
};
