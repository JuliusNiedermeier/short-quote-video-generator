import { A, useLocation } from '@solidjs/router';
import { Component } from 'solid-js';

export const Navigation: Component = () => {
  return (
    <div class="flex items-center gap-6">
      <NavigationItem label="Generate" href="/generate" />
      <NavigationItem label="Library" href="/library/video" />
    </div>
  );
};

const NavigationItem: Component<{ label: string; href: string }> = (props) => {
  const location = useLocation();

  const active = () => location.pathname === props.href;

  return (
    <A href={props.href}>
      <span class="text-gray-400 hover:text-gray-500 cursor-pointer" classList={{ 'font-medium text-black': active() }}>
        {props.label}
      </span>
      <div
        class="h-0.5 rounded-full mx-auto bg-black transition-all"
        classList={{ 'w-5': active(), 'w-0': !active() }}
      />
    </A>
  );
};
