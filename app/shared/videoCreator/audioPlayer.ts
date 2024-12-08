interface Play {
  audio?: AudioBuffer | null;
  volume?: number;
  startingTime?: number;
  delay?: number;
  loop?: boolean;
  reset?: boolean;
  type: AudioType;
  handleAudioEnded?: () => void;
}

type AudioType = "AMBIENT" | "MUSIC" | "DIALOG";
export type AudioTracksType = Record<AudioType, AudioBuffer | null>;

const AudioContexts: { [x: string]: AudioContext } = {};

const regenerateAudioContext = (type: AudioType): void => {
  if (AudioContexts[type]) {
    void AudioContexts[type].close();
  }
  AudioContexts[type] = new AudioContext();
};

export interface AudioParams {
  audio?: AudioBuffer | null;
  tracks: AudioTracksType;
  type: AudioType;
  volume?: number;
  startingTime?: number;
  delay?: number;
  reset?: boolean;
  loop?: boolean;
  add?: boolean;
}

const playingSources = new Map<AudioBuffer, { source: AudioBufferSourceNode; handleEndSource: () => void }>();

// get all the resources running now.
export const getPlayingSource = (audio: AudioBuffer) => {
  return playingSources.get(audio)?.source;
};

// play audio on a context.
export const play = ({
  audio,
  volume = 1.0,
  startingTime = 0.0,
  delay = 0.0,
  type,
  reset = true,
  loop = false,
  handleAudioEnded,
}: Play) => {
  if (!audio || getPlayingSource(audio)) {
    return;
  }

  if (reset) {
    regenerateAudioContext(type);
  }

  const audioContext = AudioContexts[type];

  const source = audioContext.createBufferSource();
  const volumeNode = audioContext.createGain();

  const handleEndSource = () => {
    handleAudioEnded?.();
    source.removeEventListener("ended", handleEndSource);
    playingSources.delete(audio);
  };

  volumeNode.gain.value = volume;
  volumeNode.connect(audioContext.destination);

  playingSources.set(audio, { source, handleEndSource });

  source.buffer = audio;
  source.loop = loop;
  source.connect(volumeNode);
  source.start(
    delay, // used to apply a delay (used to apply waiting)
    startingTime, // start audio from specific time (used to cut audio file)
    loop ? undefined : audio.duration // do not apply the audio duration if looping applied.
  );

  if (!loop) {
    source.addEventListener("ended", handleEndSource);
  }
};

// stop specific context.
export const stop = (audio: AudioBuffer) => {
  const player = playingSources.get(audio);
  if (player) {
    player.source.stop(0);
    player.handleEndSource();
  }
};

// stop all contexts
export const stopAll = () => {
  for (const [audio] of playingSources) {
    stop(audio);
  }
};
