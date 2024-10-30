import { FieldPath, Firestore } from 'firebase-admin/firestore';

const mediaTypeMap: Record<'video' | 'audio', string> = {
  video: 'video/mp4',
  audio: 'audio/mpeg',
};

interface BaseUpload {
  id: string;
  owner: boolean;
  fileName: string;
  fileSize: number;
  storage: string;
}

interface VideoUpload extends BaseUpload {
  fileType: 'video/mp4';
}

interface MusicUpload extends BaseUpload {
  fileType: 'audio/mpeg';
}

interface UnanalyzedMusicUpload extends MusicUpload {
  analyzed?: false;
}

interface AnalyzedMusicUpload extends MusicUpload {
  analyzed: true;
  onsets: number[];
  bpm: number;
}

export async function getRandomUpload(
  firestore: Firestore,
  type: 'audio',
): Promise<UnanalyzedMusicUpload | AnalyzedMusicUpload>;
export async function getRandomUpload(firestore: Firestore, type: 'video'): Promise<VideoUpload>;
export async function getRandomUpload(firestore: Firestore, type: 'video' | 'audio') {
  const uploads = firestore.collection('uploads');
  const randomId = uploads.doc().id;
  const baseQuery = uploads.where('fileType', '==', mediaTypeMap[type]).limit(1);
  let snap = await baseQuery.where(FieldPath.documentId(), '>=', randomId).get();
  if (snap.empty) snap = await baseQuery.where(FieldPath.documentId(), '<', randomId).get();
  if (snap.empty) return null;
  if (type === 'audio')
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as UnanalyzedMusicUpload | AnalyzedMusicUpload;
  if (type === 'video') return { id: snap.docs[0].id, ...snap.docs[0].data() } as VideoUpload;
  return;
}
