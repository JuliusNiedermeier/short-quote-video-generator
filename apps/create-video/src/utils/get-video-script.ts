import { Text, Audio, Source, Video, VideoProperties, Keyframe } from 'creatomate';
import { getVoiceoverSubtitles } from './get-voiceover-subtitles.js';

const tracks = {
  music: 1,
  voice: 2,
  video: 3,
  text: 4,
};

type Subtitles = Awaited<ReturnType<typeof getVoiceoverSubtitles>>;

const createSubtitleElement = (text: string, start: number, end: number) => {
  return new Text({
    text,
    track: tracks.text,
    time: `${start} s`,
    duration: `${end - start} s`,
    y: '35%',
    width: '70%',
    height: '25%',
    xAlignment: '50%',
    yAlignment: '50%',
    fillColor: '#ffffff',
    fontFamily: 'Oxanium',
  });
};

const createSubtitles = (subtitles: Subtitles, timeOffset: number) => {
  return subtitles.map((subtitle) =>
    createSubtitleElement(subtitle.text, subtitle.start + timeOffset, subtitle.end + timeOffset),
  );
};

const createVoiceoverElement = (fileUrl: string, timeOffset: number) => {
  return new Audio({ track: tracks.voice, source: fileUrl, time: `${timeOffset} s` });
};

const createMusicElement = (fileUrl: string, duration: number) => {
  return new Audio({ track: tracks.music, source: fileUrl, volume: 40, loop: true, duration });
};

type VideoFlashAnimationConfig = Required<Pick<VideoProperties, 'colorFilter' | 'colorFilterValue'>>;

const createVideoElement = (fileUrl: string, duration: number, flashAnimation?: VideoFlashAnimationConfig) => {
  return new Video({ track: tracks.video, source: fileUrl, volume: 0, loop: true, duration, ...flashAnimation });
};

const createFlashAnimationKeyframes = (start: number, duration: number, brightness: number): Keyframe<number>[] => {
  return [
    new Keyframe(0, start),
    new Keyframe(brightness * 15, start + duration / 2),
    new Keyframe(0, start + duration),
  ];
};

const createFlashAnimation = (onsets: number[]): VideoFlashAnimationConfig => {
  return {
    colorFilter: 'brighten',
    colorFilterValue: onsets.map((onset) => createFlashAnimationKeyframes(onset, 0.25, 0.5)).flat(),
  };
};

interface VideoConfig {
  voiceUrl: string;
  musicUrl: string;
  musicOnsets: number[];
  videoUrl: string;
  subtitles: Subtitles;
  voiceDuration: number;
}

export const createVideoScript = (options: VideoConfig) => {
  const timePadding = 1;
  const totalVideoDuration = options.voiceDuration + 2 * timePadding;

  const onsetCutoff = options.musicOnsets.findIndex((onset) => onset > totalVideoDuration);
  const flashAnimation = createFlashAnimation(options.musicOnsets.slice(0, onsetCutoff));

  return new Source({
    outputFormat: 'mp4',
    width: 720,
    height: 1280,
    frameRate: 60,
    duration: totalVideoDuration,
    elements: [
      ...createSubtitles(options.subtitles, timePadding),
      createVoiceoverElement(options.voiceUrl, timePadding),
      createMusicElement(options.musicUrl, totalVideoDuration),
      createVideoElement(options.videoUrl, totalVideoDuration, flashAnimation),
    ],
  });
};
