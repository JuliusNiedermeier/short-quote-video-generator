import { doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { httpsCallableFromURL } from 'firebase/functions';
import { firestore, functions, storage } from '~/common/lib/firesbase';

interface GenerateVideoOptions {
  saveQuota: boolean;
  topic: string;
}

const generateVideoCallable = httpsCallableFromURL(functions, 'https://create-video-7jjimiuc4a-uc.a.run.app');

export const generateVideo = async (options: GenerateVideoOptions) => {
  const { data } = await generateVideoCallable({ useGeneratedText: options.saveQuota === false, topic: options.topic });
  return data;
};

export const getVideo = async (id: string) => {
  const snap = await getDoc(doc(firestore, `videos/${id}`));
  if (!snap.exists()) return null;
  const data = snap.data();
  const thumbnail = await getDownloadURL(ref(storage, data.thumbnail));
  return { ...data, id, thumbnailUrl: thumbnail };
};
