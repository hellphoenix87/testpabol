const AcousticEnvironments = {
  SMALL_ROOM: "small_room",
  LARGE_ROOM: "large_room",
  HALL: "hall",
  OUTSIDE: "outside",
  STADIUM: "stadium",
  TELEPHONE: "telephone",
};

const REVERB_FILES_DIRECTORY = "assets/reverbFiles";

export const ReverbsFiles: Record<string, { path: string; dryLevel: number }> = {
  [AcousticEnvironments.HALL]: {
    path: `${REVERB_FILES_DIRECTORY}/hall.wav`,
    dryLevel: 0.84,
  },
  [AcousticEnvironments.LARGE_ROOM]: {
    path: `${REVERB_FILES_DIRECTORY}/large_room.wav`,
    dryLevel: 0.93,
  },
  [AcousticEnvironments.SMALL_ROOM]: {
    path: `${REVERB_FILES_DIRECTORY}/small_room.wav`,
    dryLevel: 0.95,
  },
  [AcousticEnvironments.OUTSIDE]: {
    path: `${REVERB_FILES_DIRECTORY}/outside.wav`,
    dryLevel: 0.97,
  },
  [AcousticEnvironments.STADIUM]: {
    path: `${REVERB_FILES_DIRECTORY}/stadium.wav`,
    dryLevel: 0.91,
  },
  [AcousticEnvironments.TELEPHONE]: {
    path: `${REVERB_FILES_DIRECTORY}/telephone.wav`,
    dryLevel: 0.7,
  },
};

export type AudioEqualizationSettingsType = { frequency: number; gain: number };

export default AcousticEnvironments;
