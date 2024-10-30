import { ComponentProps, ParentComponent, splitProps } from 'solid-js';
import { twMerge } from 'tailwind-merge';

export const Container: ParentComponent<ComponentProps<'div'>> = (props) => {
  const [localProps, restProps] = splitProps(props, ['class']);
  return <div class={twMerge('max-w-4xl mx-auto px-4', localProps.class)} {...restProps} />;
};
