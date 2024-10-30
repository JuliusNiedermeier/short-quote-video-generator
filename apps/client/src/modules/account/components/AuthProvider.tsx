import { Accessor, Component, ParentComponent, Show, createContext, createSignal, useContext } from 'solid-js';
import { auth } from '~/common/lib/firesbase';
import { User } from 'firebase/auth';
import { Logo } from '~/common/components/Logo';

const Context = createContext<Accessor<User | null>>();

export const useAuth = () => {
  const context = useContext(Context);
  if (!context) throw 'useAuth must be wrapped inside a AuthProvider';
  return context;
};

export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<User | null>();

  auth.onAuthStateChanged(setUser);

  return (
    <Context.Provider value={user}>
      <Show when={typeof user() !== 'undefined'} fallback={<LoaderScreen />}>
        {props.children}
      </Show>
    </Context.Provider>
  );
};

const LoaderScreen: Component = () => {
  return (
    <div class="h-screen w-screen bg-background grid place-content-center">
      <Logo />
    </div>
  );
};
