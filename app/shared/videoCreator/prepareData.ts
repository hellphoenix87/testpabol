import { InternalOptions, MediaData, Scene } from "./interfaces";

// used to reshape the data structure so it can be easily used by the media creator.
export const getMediaData = (
  data: { original: Scene[]; targeted: Scene[] },
  options: InternalOptions
): MediaData[] => {
  return data.targeted.reduce((prev: MediaData[], curr: Scene, idx) => {
    const shotsLength = curr.shots?.length || 0;
    const sceneIdxx = options.part || idx;

    if (shotsLength === 0 && options.env === "node") {
      throw new Error(`UID: ${options.uid}, Creation: ${options.cid}, Scene: ${idx}, has no shots`);
    }

    // skip the shots without images in the preview player (browser)
    if (options.env === "browser") {
      curr.shots = curr.shots?.filter(shot => shot.image_url);
    }

    const shots =
      curr.shots?.map((shot, shotIdx) => {
        if (!shot.image_url) {
          throw new Error(
            `UID: ${options.uid}, Creation: ${options.cid}, Scene: ${sceneIdxx}, shot: ${shotIdx} missing image`
          );
        }
        const isFirstShotInScene = shotIdx === 0;
        const isLastShotInScene = shotIdx === shotsLength - 1;
        const isFirstScene = sceneIdxx === 0;
        const isLastScene = sceneIdxx === data.original.length - 1;
        const isFirstShotInFirstScene = isFirstScene && isFirstShotInScene;
        const isLastShotInLastScene = isLastScene && isLastShotInScene;
        const previousScene = data.original?.[sceneIdxx - 1];
        const previousImage =
          isFirstShotInScene && !isFirstScene && previousScene
            ? previousScene?.shots?.[previousScene.shots.length - 1]?.image_url
            : "";
        const selectedSoundIndex = shot.selected_sound_index ?? 0;
        const soundURL = shot["sound_urls"]?.[selectedSoundIndex] || "";
        const musicURL = curr.musics?.[curr.selected_music_index!]?.id || "";
        const voiceURLs =
          shot.dialog?.reduce<string[]>((p, c) => {
            c.line_url && p.push(c.line_url);
            return p;
          }, []) || [];
        return {
          sceneIdx: sceneIdxx,
          shotIdx,
          music: musicURL,
          sound: soundURL,
          voice: voiceURLs,
          acousticEnv: shot.acoustic_env,
          image: shot.image_url,
          video: shot.video_url,
          videoDuration: shot.duration,
          duration: Math.floor(options.shot_default_duration + Math.random() * 2000), // min shot duration
          fadeIn: isFirstShotInScene ? options.fade : 0,
          fadeOut: isLastShotInScene ? options.fade : 0,
          zoomStart: getRandomZoom(options),
          zoomEnd: isLastShotInScene ? 1 : getRandomZoom(options),
          hasBlackFading: isFirstShotInFirstScene || isLastShotInLastScene,
          previousImage,
        };
      }) || [];
    shots.length && prev.push(...shots);
    return prev;
  }, []);
};

export const getRandomZoom = (options: InternalOptions): number => {
  const from = 1;
  const to = 1 + options.zoomIntensity;
  return Math.random() * (to - from) + from;
};
