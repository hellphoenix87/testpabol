const AudioEqualizationSettings = {
  MUSIC: [
    { frequency: 30, gain: 6 },
    { frequency: 500, gain: 2 },
    { frequency: 2000, gain: 3 },
    { frequency: 8000, gain: -3 },
  ],
  SOUND: [
    { frequency: 2000, gain: 1 },
    { frequency: 4000, gain: 1 },
    { frequency: 5000, gain: 0 },
    { frequency: 8000, gain: -1 },
    { frequency: 10000, gain: -2 },
  ],
  VOICE: [
    { frequency: 2000, gain: 3 },
    { frequency: 4000, gain: 3 },
    { frequency: 5000, gain: 2 },
    { frequency: 8000, gain: 1 },
    { frequency: 10000, gain: -3 },
  ],
  TELEPHONE: [
    { frequency: 300, gain: -6 },
    { frequency: 500, gain: -3 },
    { frequency: 800, gain: 0 },
    { frequency: 2000, gain: -6 },
    { frequency: 3000, gain: -10 },
  ],
};

export default AudioEqualizationSettings;
