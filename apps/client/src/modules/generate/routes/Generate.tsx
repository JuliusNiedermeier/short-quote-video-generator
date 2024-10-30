import {
  Component,
  For,
  Match,
  Show,
  Switch as SolidSwitch,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import { Container } from '@/common/components/Container';
import { TextField, TextFieldInput } from '~/common/components/ui/textfield';
import { Button } from '~/common/components/ui/button';
import { HiSolidSparkles } from 'solid-icons/hi';
import { VideoGallery, VideoItem, VideoItemThumbnail } from '@/common/components/VideoGallery';
import { Switch, SwitchControl, SwitchLabel, SwitchThumb } from '~/common/components/ui/switch';
import { generateVideo } from '../services/generateVideo';
import { AiOutlineArrowUp } from 'solid-icons/ai';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { firestore, storage } from '~/common/lib/firesbase';
import { getDownloadURL, ref } from 'firebase/storage';
import { A } from '@solidjs/router';
import { DefaultLayout } from '~/common/layouts/DefaultLayout';
import { toaster } from '@kobalte/core';
import { Toast, ToastContent, ToastDescription, ToastTitle } from '~/common/components/ui/toast';
import { Badge } from '~/common/components/ui/badge';

export const Generate: Component = () => {
  const [saveQuota, setSaveQuota] = createSignal(true);
  const [videos, setVideos] = createSignal<Record<any, any>[]>([]);
  const [prompt, setPrompt] = createSignal('');

  onMount(() => {
    const videoCollection = collection(firestore, 'videos');

    const unsubscribe = onSnapshot(
      query(videoCollection /*, where('owner', '==', auth.currentUser.uid)*/),
      async (snap) =>
        setVideos(
          await Promise.all(
            snap.docs.map(async (doc) => {
              const data = doc.data();
              const thumbnailURL = data.thumbnail ? await getDownloadURL(ref(storage, data.thumbnail)) : null;
              return { ...data, id: doc.id, thumbnailURL };
            }),
          ),
        ),
    );

    onCleanup(unsubscribe);
  });

  const handleGenerate = async (topic: string) => {
    const promise = generateVideo({ saveQuota: saveQuota(), topic });
    toaster.promise(promise, (props) => {
      createEffect(() => props.state !== 'pending' && setTimeout(() => toaster.dismiss(props.toastId), 5000));
      return (
        <Toast toastId={props.toastId} class="flex-col gap-2" persistent>
          <ToastContent class="flex items-center gap-4">
            <Show when={props.state === 'pending'}>
              <HiSolidSparkles size={24} class="animate-pulse" />
            </Show>
            <div>
              <ToastTitle>Video generation</ToastTitle>
              <ToastDescription>{topic}</ToastDescription>
            </div>
            <SolidSwitch>
              <Match when={props.state === 'pending'}>
                <Badge variant="outline">Generating...</Badge>
              </Match>
              <Match when={props.state === 'rejected'}>
                <Badge variant="destructive">Error</Badge>
              </Match>
              <Match when={props.state === 'fulfilled'}>
                <Badge variant="default">Complete</Badge>
              </Match>
            </SolidSwitch>
          </ToastContent>
        </Toast>
      );
    });
  };

  return (
    <DefaultLayout>
      <Container>
        <p></p>
        <TextField class="relative my-36">
          <TextFieldInput
            type="text"
            placeholder="Financial freedom..."
            class="p-8 rounded-xl text-md font-medium focus-visible:ring-0 bg-muted"
            autofocus
            onInput={({ currentTarget: { value } }) => setPrompt(value)}
          />
          <Button class="absolute top-2 bottom-2 right-2 h-auto" onClick={() => handleGenerate(prompt())}>
            <span class="mr-4">Generate</span> <HiSolidSparkles />
          </Button>
          <div class="absolute right-36 top-0 bottom-0 grid place-content-center">
            <Switch class="flex items-center space-x-2" checked={saveQuota()} onChange={setSaveQuota}>
              <SwitchControl>
                <SwitchThumb />
              </SwitchControl>
              <SwitchLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Save quota
              </SwitchLabel>
            </Switch>
          </div>
        </TextField>

        <div class="flex items-center mt-16 mb-8 mx-8 gap-2">
          <h1 class="mr-auto text-xl font-medium text-muted-foreground">Latest creations</h1>
          <AiOutlineArrowUp />
        </div>
        <VideoGallery>
          <For each={videos()}>
            {(video) => (
              <A href={video.id}>
                <VideoItem>
                  <VideoItemThumbnail src={video.thumbnailURL} />
                </VideoItem>
              </A>
            )}
          </For>
        </VideoGallery>
      </Container>
    </DefaultLayout>
  );
};
