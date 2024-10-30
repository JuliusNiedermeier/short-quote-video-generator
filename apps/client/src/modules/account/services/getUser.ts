import { Firestore, doc, getDoc } from 'firebase/firestore';

interface User {
  stripe?: {
    customer?: string;
    subscription?: string;
    plan?: 'premium' | 'starter';
  };
}

export const getUser = async (firestore: Firestore, uid: string) => {
  const res = await getDoc(doc(firestore, 'users/' + uid));
  if (!res.exists()) return null;
  return res.data() as User;
};
