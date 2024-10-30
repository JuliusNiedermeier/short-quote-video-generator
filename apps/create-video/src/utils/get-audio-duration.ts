import { path as ffprobe } from 'ffprobe-static';
import { exec } from 'child_process';

export const getAudioDuration = (absolutePathToFile: string) => {
  const cmd = `${ffprobe} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${absolutePathToFile}`;
  return new Promise<number>((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(error);
      if (stderr) return reject(stderr);
      return resolve(parseFloat(stdout));
    });
  });
};
