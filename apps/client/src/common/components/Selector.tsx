import {
  Accessor,
  Component,
  ParentComponent,
  Setter,
  createContext,
  createEffect,
  createSignal,
  useContext,
} from 'solid-js';

interface Context {
  selected: Accessor<string>;
  setSelected: Setter<string>;
}

const Context = createContext<Context>();

const useSelector = () => {
  const ctx = useContext(Context);
  if (!ctx) console.warn('useSelector must be used inside a Selector parent component');
  return ctx;
};

export const Selector: ParentComponent<{ initial: string; onChange: (value: string) => void }> = (props) => {
  const [selected, setSelected] = createSignal<string>(props.initial);

  createEffect(() => props.onChange(selected()));

  return (
    <Context.Provider value={{ selected, setSelected }}>
      <div class="flex items-center gap-1 rounded-xl border p-1">{props.children}</div>
    </Context.Provider>
  );
};

export const SelectorOption: ParentComponent<{ id: string }> = (props) => {
  const { selected, setSelected } = useSelector();
  return (
    <div
      class="rounded-md py-1 px-5 hover:bg-gray-100 cursor-pointer"
      classList={{ 'bg-gray-200': selected() === props.id }}
      onClick={() => setSelected(props.id)}
    >
      {props.children}
    </div>
  );
};
