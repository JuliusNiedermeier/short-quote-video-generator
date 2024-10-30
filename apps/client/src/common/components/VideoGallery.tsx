import { Component, ParentComponent, Show } from 'solid-js';

interface VideoItemProps {
  thumbnail?: string;
  footerText?: string;
  class?: string;
}

export const VideoItem: ParentComponent<VideoItemProps> = (props) => {
  return (
    <div
      class={`${props.class} cursor-pointer rounded overflow-hidden relative w-full aspect-[0.6] bg-muted hover:brightness-90 transition`}
    >
      <Show when={props.footerText}>
        <div class="absolute bottom-0 w-full px-2 py-1 pt-24 bg-gradient-to-t from-black/25 to-transparent">
          <span class="text-white">235 Aufrufe</span>
        </div>
      </Show>
      {props.children}
    </div>
  );
};

export const VideoItemThumbnail: Component<{ src?: string }> = (props) => {
  return (
    <Show when={props.src}>
      <img src={props.src} class="w-full h-full object-cover" />
    </Show>
  );
};

export const VideoGallery: ParentComponent = (props) => {
  return <div class="grid gap-2 grid-cols-4">{props.children}</div>;
};
