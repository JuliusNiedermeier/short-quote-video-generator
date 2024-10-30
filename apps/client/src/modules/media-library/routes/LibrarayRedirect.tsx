import { useNavigate } from '@solidjs/router';
import { Component } from 'solid-js';

export const LibrarayRedirect: Component = () => {
  useNavigate()('video');
  return null;
};
