import { ParentComponent, Resource, createContext, createResource, useContext } from 'solid-js';
import { firestore } from '~/common/lib/firesbase';
import { getUser } from '../services/getUser';
import { useAuth } from './AuthProvider';

const Context = createContext<Resource<Awaited<ReturnType<typeof getUser>>>>();

export const useAccount = () => {
  const context = useContext(Context);
  if (!context) throw 'useAccount must be wrapped inside a AccountProvider';
  return context;
};

export const AccountProvider: ParentComponent = (props) => {
  const auth = useAuth();
  const [user] = createResource(() => getUser(firestore, auth().uid));
  return <Context.Provider value={user} children={props.children} />;
};
