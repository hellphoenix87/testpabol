import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import { v4 as uuid } from "uuid";
import * as os from "os";
import * as path from "path";
import { prepareDirectory, getDirFiles } from "./utils/fileControl";
import { InternalOptions, StreamInfo } from "./interfaces";
import { AUDIO_FREQUENCY, RESOLUTION, SHOT_SPEECH_SILENCE, SPEECH_SILENCE_SEPARATOR } from "./constants";
import { wait } from "./utils";
import { AudioEqualizationSettingsType } from "../constants";

ffmpegStatic && ffmpeg.setFfmpegPath(ffmpegStatic);
ffprobeStatic?.path && ffmpeg.setFfprobePath(ffprobeStatic.path);

export type AudioData = { value: string; duration: number };
export type VoiceData = { value: string[]; duration: number };

// mixing the audio with the frames to get the final video file
export function createVideo(
  images: string[],
  audioFiles: { url: string; volume: number }[],
  options: { fps: number; tempDir: string }
): Promise<string> {
  if (!images.length) {
    throw new Error("Can not render empty shots");
  }
  const output = randomName(options.tempDir) + ".mp4";
  return new Promise((resolve, reject) => {
    const path = images[0].split(options.tempDir)[0];
    // add the frames path directory
    const instance = ffmpeg().input(`${path}${options.tempDir}/frames-%08d.jpg`);
    // add the audio files
    audioFiles.forEach(audio => instance.addInput(audio.url));
    const audioKeys = Array.from(Array(audioFiles.length).keys());

    // set the audio volumes and then mix audios (music, audio and voices)
    instance.complexFilter([
      ...audioFiles.map((audio, i) => ({
        filter: "volume",
        options: [audio.volume],
        inputs: [i + 1 + ":a"],
        outputs: `[s${i}]`,
      })),
      {
        filter: "amix",
        inputs: audioKeys.map(i => `[s${i}]`),
        options: { inputs: audioFiles.length },
        outputs: "[a]",
      },
    ]);

    // map the audio and video files then copy the result audio as an output mp3 format file and compress the video
    instance.addOptions(["-map 0:v", "-map [a]", "-c:a", "aac", "-crf", "22"]);

    instance
      .on("end", () => resolve(output))
      .on("error", (e: Error) => reject(e))
      .videoCodec("libx264")
      .fps(options.fps)
      .outputFormat("mp4")
      .audioFrequency(AUDIO_FREQUENCY)
      .audioChannels(2)
      .save(output);
  });
}

// Merge all audio for each scene/shot into one.
export function mergeAudioParts(parts: string[], tempDir?: string): Promise<string> {
  const output = randomName(tempDir) + ".mp3";
  return new Promise((resolve, reject) => {
    // if we have only one audio file just return it.
    if (parts.length === 1) {
      return resolve(parts[0]);
    }
    const instance = ffmpeg();

    parts.forEach(part => instance.input(part));
    const audioKeys = Array.from(Array(parts.length).keys());

    instance.complexFilter([
      {
        filter: "concat",
        options: { n: audioKeys.length, v: 0, a: 1 },
        inputs: audioKeys.map(i => i + ":a"),
        outputs: "a",
      },
    ]);
    // map the audio then copy the result as an output mp3 format file
    instance.addOption(["-map [a]", "-async", "1", "-c:a", "mp3"]);

    instance
      .on("end", () => resolve(output))
      .on("error", (e: Error) => reject(e))
      .audioFrequency(AUDIO_FREQUENCY)
      .audioChannels(2)
      .save(output);
  });
}

// Merge all videos into a single stream.
export function mergeStreamFiles(parts: string[], options: InternalOptions): Promise<StreamInfo> {
  const outputDir = `${options.tempDir}/stream`;
  const tempStreamDir = prepareDirectory(outputDir);
  const init = "init.m3u8";
  return new Promise((resolve, reject) => {
    // if we have only one video file just return it.
    const instance = ffmpeg();

    parts.forEach(part => instance.input(part));
    const videoKeys = Array.from(Array(parts.length).keys());

    instance.complexFilter([
      {
        filter: "concat",
        options: { n: videoKeys.length, v: 1, a: 1 },
        inputs: videoKeys.flatMap(i => [i + ":v", i + ":a"]),
        outputs: "[v] [a]",
      },
    ]);

    instance.addOption(["-map [v]", "-map [a]"]);

    // Dash configuration.
    instance
      .outputOptions([
        "-f hls",
        "-hls_time 2",
        "-hls_playlist_type vod",
        "-hls_flags independent_segments",
        `-hls_segment_filename ${tempStreamDir}/chunk-%08d.mp4`,
        `-master_pl_name ${tempStreamDir}/master.mp4`,
        `-s ${RESOLUTION.WIDTH}x${RESOLUTION.HEIGHT}`,
      ])
      .output(`${tempStreamDir}/${init}`);

    instance
      .on("end", () => resolve({ directory: tempStreamDir, init }))
      .on("error", (e: Error) => reject(e))
      .videoCodec("libx264")
      .audioCodec("aac")
      .audioFrequency(AUDIO_FREQUENCY)
      .audioChannels(2)
      .run();
  });
}

// Merge each shot speech into one file to be ready for the merge.
export const mergeShotVoices = (audioFiles: VoiceData, tempDir?: string): Promise<string> => {
  const output = randomName(tempDir) + ".mp3";
  return new Promise((resolve, reject) => {
    const instance = ffmpeg();

    // merge the voices into one file with the same shot duration
    if (audioFiles.value?.length) {
      audioFiles.value.forEach(voice => instance.input(voice));
      const keys = Array.from(Array(audioFiles.value.length).keys());

      // apply the mixing ffmpeg steps
      instance.complexFilter([
        // add silence separator
        `aevalsrc=0:d=${audioFiles.duration / 1000}[ss]`,
        ...keys.map(
          i => `aevalsrc=0:d=${i === 0 ? SHOT_SPEECH_SILENCE / 1000 : SPEECH_SILENCE_SEPARATOR / 1000}[s${i}]`
        ),
        // concat the files.
        ...(audioFiles.value.length > 1
          ? [
              ...keys.map(i => ({
                filter: "concat",
                options: { n: 2, v: 0, a: 1 },
                inputs: ["s" + i, i + ":a"],
                outputs: "ac" + i,
              })),
              {
                filter: "concat",
                options: { n: keys.length, v: 0, a: 1 },
                inputs: keys.map(i => `[ac${i}]`),
                outputs: "as",
              },
            ]
          : [{ filter: "concat", options: { n: 2, v: 0, a: 1 }, inputs: ["s0", "0:a"], outputs: "as" }]),
        // mix the final audio to get the final audio length.
        { filter: "amix", inputs: ["as", "ss"], outputs: "a" },
      ]);
      // map the audio then copy the result as an output mp3 format file
      instance.addOption(["-map [a]", "-async", "1", "-c:a", "mp3"]);
    } else {
      // if there is no voice return the an empty audio file
      instance
        .addInput("anullsrc=channel_layout=mono:sample_rate=22050")
        .inputOptions(["-f", "lavfi", "-t", `${audioFiles.duration / 1000}s`]);
    }

    instance
      .on("end", () => resolve(output))
      .on("error", (e: Error) => reject(e))
      .duration(audioFiles.duration / 1000)
      .outputFormat("mp3")
      .save(output)
      .run();
  });
};

// Trim audio files and change its duration to the shot/scene duration to be ready for the merge
export function trimAudio(audioFile: AudioData, tempDir?: string, fadeout?: number): Promise<string> {
  const output = randomName(tempDir) + ".mp3";
  return new Promise((resolve, reject) => {
    const instance = ffmpeg();
    const duration = audioFile.duration / 1000;
    // cut the audio with the targeted duration and volume needed
    if (audioFile.value) {
      instance
        .input(audioFile.value)
        .inputOptions("-stream_loop -1")
        .addOptions([
          `-t ${duration}`,
          // fade the audio out.
          ...(fadeout
            ? [`-af afade=type=in:st=0:d=${fadeout},afade=type=out:st=${duration - fadeout}:d=${fadeout}`]
            : []),
        ]);
    } else {
      // if this shot/scene has no sound just add an empty one
      instance
        .addInput("anullsrc=channel_layout=mono:sample_rate=22050")
        .inputOptions(["-f", "lavfi", "-t", `${duration}s`]);
    }

    instance
      .on("end", () => resolve(output))
      .on("error", (e: Error) => reject(e))
      .save(output);
  });
}

// Apply Dynamic Range Compression on the audio files
export function applyDynamicRangeCompression(audioFile: string, tempDir?: string): Promise<string> {
  const output = randomName(tempDir) + "-compressed.ogg";

  return new Promise((resolve, reject) => {
    const instance = ffmpeg();

    instance.input(audioFile).audioFilters("compand=0|0:1|1:-90/-60|-60/-40|-40/-30|-20/-20:6:0:-90:0.2");

    instance
      .on("end", () => resolve(output))
      .on("error", (e: Error) => reject(e))
      .save(output);
  });
}

// Apply Equalization on audio file
export function applyEqualization(
  audioFile: string,
  equalizationSettings: AudioEqualizationSettingsType[],
  tempDir?: string
): Promise<string> {
  const output = randomName(tempDir) + "-equalized.ogg";

  const filterString = equalizationSettings
    .map((setting: AudioEqualizationSettingsType) => `equalizer=f=${setting.frequency}:g=${setting.gain}`)
    .join(",");

  return new Promise((resolve, reject) => {
    const instance = ffmpeg();

    instance.input(audioFile).audioFilters(filterString);

    instance
      .on("end", () => resolve(output))
      .on("error", (e: Error) => reject(e))
      .save(output);
  });
}

// used to get the video/audio duration with retry functionality
export const getFileDurationWithRetry = async (file: string, times = 1): Promise<number | void> => {
  if (times < 1) {
    throw new Error("Bad argument: 'times' must be greater than 0");
  }
  let attemptCount = 0;
  while (attemptCount <= times) {
    try {
      const result = await getFileDuration(file);
      return result;
    } catch (error) {
      if (++attemptCount >= times) {
        throw error;
      }
    }
    await wait(100);
  }
};

// used to get the video/audio duration with retry functionality
export const getFileDuration = async (file: string): Promise<number | undefined> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(file, function (err, metadata) {
      if (err) {
        return reject(err);
      }
      resolve(metadata.format.duration);
    });
  });
};

// extract the frames from a video file
export const convertVideoToImages = async (props: {
  video: string;
  fps: number;
  tempDir: string;
}): Promise<string[]> => {
  const outputDir = `${props.tempDir}/${uuid()}`;
  const tempFramesDir = prepareDirectory(outputDir);

  return new Promise((resolve, reject) => {
    ffmpeg(props.video)
      .inputFps(25)
      .size(`${RESOLUTION.WIDTH}x${RESOLUTION.HEIGHT}`)
      .outputOptions(["-qscale:v 1"])
      .on("end", () => resolve(getDirFiles(tempFramesDir).map(file => path.join(tempFramesDir, file))))
      .on("error", (e: Error) => reject(e))
      .save(`${tempFramesDir}/frames-%08d.jpg`);
  });
};

// generate random ffmpeg file name (will be cleaned after it is done)
const randomName = (dir?: string): string => {
  return path.join(os.tmpdir(), dir || "", uuid());
};

// Apply reverb effect on the audio file
export async function applyReverb(params: {
  audioFile: string;
  duration: number;
  reverbFile: string;
  dryLevel: number;
  equalizationSettings?: AudioEqualizationSettingsType[];
  tempDir?: string;
}): Promise<string> {
  const output = randomName(params.tempDir) + "-reverb.ogg";
  const SILENCE_DURATION = 0.5;
  const CROSS_FADE_OUT_DURATION = 0.5;

  let inputFile = params.audioFile;

  if (params.equalizationSettings) {
    inputFile = await applyEqualization(params.audioFile, params.equalizationSettings, params.tempDir);
  }

  return new Promise((resolve, reject) => {
    const instance = ffmpeg();

    // apply the reverb effect on the audio file
    instance
      .input(inputFile)
      .input(params.reverbFile)
      .complexFilter([
        `[0]apad=pad_dur=${SILENCE_DURATION}[a]`, // Adds 0.5 second silence to the end of the audio file
        "[a][1]afir=dry=10:wet=10[reverb]",
        `[a][reverb]amix=inputs=2:weights=${params.dryLevel} ${(1 - params.dryLevel).toFixed(2)}[effect]`,
        `[effect]afade=t=out:st=${params.duration - CROSS_FADE_OUT_DURATION}:d=${
          SILENCE_DURATION + CROSS_FADE_OUT_DURATION
        }`,
      ]);

    instance
      .on("end", () => resolve(output))
      .on("error", (e: Error) => reject(e))
      .save(output);
  });
}
