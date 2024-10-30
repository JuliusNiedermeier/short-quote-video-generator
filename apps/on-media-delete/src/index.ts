import { initializeApp, cert } from 'firebase-admin/app';
import { ServiceAccount } from 'firebase-admin';
import serviceAccount from './service-account.json' assert { type: 'json' };
import { getStorage } from 'firebase-admin/storage';
import { onDocumentDeleted } from 'firebase-functions/v2/firestore';

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
  projectId: 'stoic-sage',
  storageBucket: 'stoic-sage.appspot.com',
});

export const on_media_delete = onDocumentDeleted('uploads/{docId}', async (event) => {
  if (!event.data) return;

  const storage = getStorage();

  const storageName = event.data.get('storage');
  if (storageName) storage.bucket().file(storageName).delete();

  const thumbnailStorageName = event.data.get('thumbnail');
  if (thumbnailStorageName) storage.bucket().file(thumbnailStorageName).delete();
});
