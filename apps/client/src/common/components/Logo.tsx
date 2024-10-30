import { Component } from 'solid-js';
import logo from '@/assets/logo.svg';

export const Logo: Component = () => {
  return (
    <div class="flex items-center gap-4">
      <img src={logo} alt="AI Shorts Logo" />
      <small class="font-medium text-accent-foreground">AI Shorts</small>
    </div>
  );
};
