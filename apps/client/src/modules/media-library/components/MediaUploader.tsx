import { Component, JSX, Match, Show, createEffect, createSignal, Switch } from 'solid-js';
import { auth, storage } from '~/common/lib/firesbase';
import { ref, uploadBytes } from 'firebase/storage';
import { Button } from '~/common/components/ui/button';
import { AiOutlineCloudUpload } from 'solid-icons/ai';
import { Toast, ToastContent, ToastDescription, ToastTitle } from '~/common/components/ui/toast';
import { HiSolidSparkles } from 'solid-icons/hi';
import { Badge } from '~/common/components/ui/badge';
import { toaster } from '@kobalte/core';

export const MediaUploader: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [file, setFile] = createSignal<File>();

  const handleChange: JSX.CustomEventHandlersCamelCase<HTMLInputElement>['onChange'] = (event) => {
    setFile(() => event.currentTarget.files.item(0));
    event.currentTarget.value = null;
  };

  createEffect(async () => {
    if (!file()) return;
    handleGenerate(file());
  });

  const handleGenerate = async (file: File) => {
    const storageRef = ref(storage, `uploads/${crypto.randomUUID()}`);
    const promise = uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: { owner: auth.currentUser.uid, fileName: file.name },
    });

    toaster.promise(promise, (props) => {
      createEffect(() => props.state !== 'pending' && setTimeout(() => toaster.dismiss(props.toastId), 5000));
      return (
        <Toast toastId={props.toastId} class="flex-col gap-2" persistent>
          <ToastContent class="flex items-center gap-4">
            <Show when={props.state === 'pending'}>
              <AiOutlineCloudUpload size={24} class="animate-pulse" />
            </Show>
            <div>
              <ToastTitle>File upload</ToastTitle>
              <ToastDescription>{file.name}</ToastDescription>
            </div>
            <Switch>
              <Match when={props.state === 'pending'}>
                <Badge variant="outline">Uploading...</Badge>
              </Match>
              <Match when={props.state === 'rejected'}>
                <Badge variant="destructive">Error</Badge>
              </Match>
              <Match when={props.state === 'fulfilled'}>
                <Badge variant="default">Complete</Badge>
              </Match>
            </Switch>
          </ToastContent>
        </Toast>
      );
    });
  };

  return (
    <Button class="px-0 py-0">
      <label class="cursor-pointer px-4 py-2 flex gap-2 items-center" for="media-uploader-input">
        <AiOutlineCloudUpload class="text-white" />
        Upload
      </label>
      <input type="file" accept="video/*, audio/*" id="media-uploader-input" class="hidden" onChange={handleChange} />
    </Button>
  );
};
