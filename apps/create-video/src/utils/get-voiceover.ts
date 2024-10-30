import { Readable } from 'stream';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

interface RequestBody {
  text: string;
  model_id: string;
  voice_settings: { stability: number; similarity_boost: number; style: number; use_speaker_boost: boolean };
}

export const textToSpeech = async (elevenLabsApiKey: string, text: string) => {
  const voiceId = 'iZ8fwdXEqGpIBTM0pLOE'; // Marcus Authorative
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const body: RequestBody = {
    text,
    model_id: 'eleven_monolingual_v1',
    voice_settings: { stability: 1, similarity_boost: 0, style: 0.5, use_speaker_boost: true },
  };

  const config: AxiosRequestConfig<RequestBody> = {
    headers: { 'xi-api-key': elevenLabsApiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    responseType: 'stream',
  };

  type Response = AxiosResponse<Readable>;

  const response = await axios.post<any, Response, RequestBody>(url, body, config);

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    response.data.on('data', (chunk: Buffer) => chunks.push(chunk));
    response.data.on('end', () => resolve(Buffer.concat(chunks)));
    response.data.on('error', reject);
  });
};
