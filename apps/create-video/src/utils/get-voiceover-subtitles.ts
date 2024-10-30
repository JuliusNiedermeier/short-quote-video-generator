import OpenAI, { toFile } from 'openai';

const parseSrtString = (srt: string) => srt.split('\n\n').filter((sequence) => sequence !== '\n');

const parseSequence = (sequence: string) => {
  const [id, timing, ...lines] = sequence.split('\n');
  return { id, timing, text: lines.join('\n') };
};

const parseTiming = (timing: string) => timing.split('-->');

const parseTime = (time: string) => {
  const [hours, minutes, secondsWithMillis] = time.split(':');
  const [seconds, millis] = secondsWithMillis.split(',').map((value) => parseInt(value));
  const hourSeconds = parseInt(hours) * 60 * 60;
  const minuteSeconds = parseInt(minutes) * 60;
  const millisSeconds = millis / 1000;
  return hourSeconds + minuteSeconds + seconds + millisSeconds;
};

const srtToJSON = (srt: string) => {
  return parseSrtString(srt).map((sequence) => {
    const { id, timing, text } = parseSequence(sequence);
    const [start, end] = parseTiming(timing).map((time) => parseTime(time));
    return { id, start, end, text };
  });
};

export const getVoiceoverSubtitles = async (ai: OpenAI, audio: Buffer) => {
  const fileLike = await toFile(audio, 'voiceover.mp3', { type: 'audio/mpeg' });
  const srt = (await ai.audio.transcriptions.create({
    file: fileLike,
    model: 'whisper-1',
    language: 'en',
    response_format: 'srt',
  })) as unknown as string;
  return srtToJSON(srt);
};
