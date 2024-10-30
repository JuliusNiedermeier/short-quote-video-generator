import { initializeApp, cert } from 'firebase-admin/app';
import { ServiceAccount } from 'firebase-admin';
import serviceAccount from './service-account.json' assert { type: 'json' };

import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile, rm } from 'fs/promises';
import { exec } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import crypto from 'crypto';

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
  projectId: 'stoic-sage',
  storageBucket: 'stoic-sage.appspot.com',
});

interface Payload {
  documentPath: string;
  storage: string;
}

export const create_video_thumb = onMessagePublished<Payload>(
  { topic: 'video-uploaded', memory: '512MiB' },
  async (event) => {
    const firestore = getFirestore();
    const storage = getStorage();

    const videoName = `video-${event.id}`;
    const thumbName = `thumb-${event.id}.png`;

    const file = fileURLToPath(import.meta.url);
    const videoPath = resolve(dirname(file), videoName);
    const thumbPath = resolve(dirname(file), thumbName);

    const message = event.data.message.json;
    console.log(message);

    await storage.bucket().file(message.storage).download({ destination: videoPath });
    console.log('Video size on disk', (await readFile(videoPath)).byteLength);

    const cmd = `${ffmpeg} -y -ss 00:00:01 -i ${videoPath} -frames:v 1 -q:v 2 -vf "scale=500:500:force_original_aspect_ratio=increase,crop=500:500" ${thumbPath}`;

    await new Promise<void>((resolve, reject) => {
      exec(cmd, (error) => (error ? reject(error) : resolve()));
    });

    console.log('Generated thumbnail:', thumbPath);
    console.log('Thumbnail space on disk:', (await readFile(thumbPath)).byteLength);

    const thumbStoragePath = `generated/thumbnails/${crypto.randomUUID()}`;
    const [storageUpload] = await storage
      .bucket()
      .upload(thumbPath, { destination: thumbStoragePath, contentType: 'image/png' });
    console.log('Thumbnail exist in storage?', await storageUpload.exists());

    const docUpdate = await firestore.doc(message.documentPath).update({ thumbnail: thumbStoragePath });
    console.log('Doc updated at', docUpdate.writeTime);

    rm(thumbPath);
  },
);
