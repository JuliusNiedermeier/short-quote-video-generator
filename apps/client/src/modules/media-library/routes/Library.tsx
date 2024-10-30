import { Outlet, useLocation, useNavigate } from '@solidjs/router';
import { Component } from 'solid-js';
import { Container } from '~/common/components/Container';
import { Tabs, TabsList, TabsTrigger } from '~/common/components/ui/tabs';
import { DefaultLayout } from '~/common/layouts/DefaultLayout';
import { MediaUploader } from '~/modules/media-library/components/MediaUploader';

export const Library: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mediaType = () => {
    const path = location.pathname.split('/');
    return path[path.length - 1];
  };

  const heading = () => {
    return `${mediaType().charAt(0).toUpperCase()}${mediaType().slice(1)} library`;
  };

  return (
    <DefaultLayout>
      <Container class="py-8 flex items-center justify-between gap-4">
        <h1 class="text-xl font-medium mr-auto">{heading()}</h1>
        <Tabs defaultValue="account" class="w-[400px]" value={mediaType()} onChange={(value) => navigate(value)}>
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>
        </Tabs>
        <MediaUploader />
      </Container>
      <Outlet />
    </DefaultLayout>
  );
};
