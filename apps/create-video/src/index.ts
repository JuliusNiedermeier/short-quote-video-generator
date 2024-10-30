// Env config
import { defineString } from 'firebase-functions/params';
import { initializeApp, cert } from 'firebase-admin/app';
import { ServiceAccount } from 'firebase-admin';
import serviceAccount from './service-account.json' assert { type: 'json' };

// Function infrastructure
import { HttpsError, onCall } from 'firebase-functions/v2/https';

// Client libraries
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import { PubSub } from '@google-cloud/pubsub';
import { OpenAI } from 'openai';
// import { Client } from 'creatomate';

// File system
import { writeFile, readFile, rm } from 'fs/promises';
import { resolve } from 'path';

// Utils
import { getTextFromTopic } from './utils/get-text-from-topic.js';
import { textToSpeech } from './utils/get-voiceover.js';
import { getVoiceoverSubtitles } from './utils/get-voiceover-subtitles.js';
import { getAudioDuration } from './utils/get-audio-duration.js';
import { getRandomUpload } from './utils/get-random-upload.js';
import { createVideoScript } from './utils/get-video-script.js';
import { getVideoDescription } from './utils/get-video-description.js';

const elevenLabsApiKey = defineString('ELEVEN_LABS_API_KEY');
const openAIApiKey = defineString('OPENAI_API_KEY');
// const creatomateApiKey = defineString('CREATOMATE_API_KEY');

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
  projectId: 'stoic-sage',
  storageBucket: 'stoic-sage.appspot.com',
});

export const create_video = onCall<{ useGeneratedText: boolean; topic: string }>(async (data) => {
  if (!data.auth) throw new HttpsError('unauthenticated', 'Unauthenticated');

  const firestore = getFirestore();
  const storage = getStorage();
  const pubsub = new PubSub();

  const openAIClient = new OpenAI({ apiKey: openAIApiKey.value() });
  //   const creatomateClient = new Client(creatomateApiKey.value());

  const videoDoc = firestore.collection('videos').doc();

  // Call generative APIs
  const generatedText = await getTextFromTopic(openAIClient, data.data.topic);
  const text = data.data.useGeneratedText
    ? generatedText
    : 'This may seem too simple. But beware of the power that lies in it.';
  const generatedVoice = await textToSpeech(elevenLabsApiKey.value(), text);
  const subtitles = await getVoiceoverSubtitles(openAIClient, generatedVoice);

  // Save generated voice to disk for audio analysis and upload
  const voiceLocalFilePath = resolve(`./${videoDoc.id}.mp3`);
  await writeFile(voiceLocalFilePath, generatedVoice);

  // Make voice file publicly accessible
  const voiceStorageFile = storage.bucket().file(`generated/voiceovers/${videoDoc.id}`);
  await voiceStorageFile.save(await readFile(voiceLocalFilePath), { contentType: 'audio/mpeg' });
  const [signedVoiceUrl] = await voiceStorageFile.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60,
  });
  const voiceStorageUrl = voiceStorageFile.cloudStorageURI.href;

  // Get voiceover duration
  const voiceDuration = await getAudioDuration(voiceLocalFilePath);

  await rm(voiceLocalFilePath);

  // Make music file publicly available
  const musicUploadDoc = await getRandomUpload(firestore, 'audio');
  if (!musicUploadDoc.analyzed) throw new HttpsError('aborted', 'Selected music has not been analyzed yet.');
  const [signedMusicMediaUrl] = await storage
    .bucket()
    .file(musicUploadDoc.storage)
    .getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60, // 1h,
    });

  // Make video file publicly available
  const videoUploadDoc = await getRandomUpload(firestore, 'video');
  const videoMediaFile = storage.bucket().file(videoUploadDoc.storage);
  const [signedVideoMediaUrl] = await videoMediaFile.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60, // 1h,
  });

  // Create video script
  const videoConfig = createVideoScript({
    voiceDuration,
    voiceUrl: signedVoiceUrl,
    subtitles,
    musicUrl: signedMusicMediaUrl,
    videoUrl: signedVideoMediaUrl,
    musicOnsets: musicUploadDoc.onsets,
  });

  const description = await getVideoDescription(openAIClient, generatedText);

  await videoDoc.create({
    generatedText,
    voiceDuration,
    subtitles: JSON.stringify(subtitles),
    voiceStorageUrl,
    musicUpload: musicUploadDoc.id,
    videoUpload: videoUploadDoc.id,
    script: JSON.stringify(videoConfig.toMap()),
    description,
  });

  await pubsub
    .topic('video-uploaded')
    .publishMessage({ json: { documentPath: videoDoc.path, storage: videoMediaFile.name } });

  return videoConfig.toMap();
});

// starboy media id ZQk7H95Ujdw5QOEnjPtI
