import { Component, createSignal, onCleanup, onMount } from 'solid-js';
import { Logo } from '~/common/components/Logo';
import { Image, ImageFallback, ImageRoot } from '~/common/components/ui/image';
import { Navigation } from './Navigation';
import { Container } from '~/common/components/Container';

export const Header: Component = () => {
  const [collapsed, setCollapsed] = createSignal(false);
  const [ref, setRef] = createSignal<HTMLDivElement>();

  onMount(() => {
    const handler = () => {
      if (ref().getBoundingClientRect().top === 0 && !collapsed()) setCollapsed(true);
      if (ref().getBoundingClientRect().top !== 0 && collapsed()) setCollapsed(false);
      // console.log();
    };

    window.addEventListener('scroll', handler);

    onCleanup(() => window.removeEventListener('scroll', handler));
  });

  return (
    <div class="sticky top-0 z-10 mt-10 bg-white " classList={{ 'border-b shadow': collapsed() }} ref={setRef}>
      <Container class="flex items-center justify-between gap-10 py-3">
        <div class="mr-auto">
          <Logo />
        </div>
        <Navigation />
        <ImageRoot>
          <Image src="https://github.com/hngngn.png" alt="hngngn" />
          <ImageFallback>HN</ImageFallback>
        </ImageRoot>
      </Container>
    </div>
  );
};
