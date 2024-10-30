import { initializeApp, cert } from 'firebase-admin/app';
import { ServiceAccount } from 'firebase-admin';
import serviceAccount from './service-account.json' assert { type: 'json' };
import { PubSub } from '@google-cloud/pubsub';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { onObjectFinalized } from 'firebase-functions/v2/storage';

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
  projectId: 'stoic-sage',
  storageBucket: 'stoic-sage.appspot.com',
});

export const on_media_upload = onObjectFinalized({ region: 'europe-west3' }, async (event) => {
  console.log('Object finalized', event.data.name);
  if (!event.data.name.startsWith('uploads/')) return;

  const firestore = getFirestore();
  const storage = getStorage();
  const pubsub = new PubSub();

  if (!event.data.metadata?.owner || !event.data.metadata?.fileName) {
    await storage.bucket().file(event.data.name).delete();
    return;
  }

  const { path } = await firestore.collection('uploads').add({
    owner: event.data.metadata.owner,
    fileName: event.data.metadata.fileName,
    fileType: event.data.contentType,
    fileSize: event.data.size,
    storage: event.data.name,
  });

  if (event.data.contentType === 'video/mp4') {
    await pubsub.topic('video-uploaded').publishMessage({ json: { documentPath: path, storage: event.data.name } });
  }

  if (event.data.contentType === 'audio/mpeg') {
    await pubsub.topic('music-uploaded').publishMessage({ json: { documentPath: path, storage: event.data.name } });
  }

  return;
});
