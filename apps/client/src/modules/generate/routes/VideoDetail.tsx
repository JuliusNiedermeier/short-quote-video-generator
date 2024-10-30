import { Component, Show, createEffect, createResource, createSignal, onMount } from 'solid-js';
import { Container } from '~/common/components/Container';
import { VsArrowLeft } from 'solid-icons/vs';
import { Button } from '~/common/components/ui/button';
import { A, useParams } from '@solidjs/router';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/common/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/common/components/ui/dialog';
import { BsClipboard, BsClipboardCheckFill } from 'solid-icons/bs';
import { getVideo } from '../services/generateVideo';
import { DefaultLayout } from '~/common/layouts/DefaultLayout';

export const VideoDetail: Component = () => {
  const params = useParams();
  const [copied, setCopied] = createSignal(false);
  const [video] = createResource(() => getVideo(params.id));

  createEffect(() => console.log(video()));

  const scriptToClipboard = async () => {
    await navigator.clipboard.writeText(video().script);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  return (
    <DefaultLayout>
      <Container class="flex gap-12 pt-16">
        <Dialog>
          <DialogTrigger>
            <div class="shrink-0 cursor-pointer rounded overflow-hidden relative h-[70vh] aspect-[0.6] bg-gray-100 hover:brightness-90 transition">
              <Show when={video()}>
                <img src={video().thumbnailUrl} alt="Video" class="object-cover h-full w-full" />
              </Show>
            </div>
          </DialogTrigger>
          <DialogContent class="max-w-[60rem]">
            <div class="flex items-end">
              <DialogHeader>
                <DialogTitle>Video script</DialogTitle>
                <DialogDescription>
                  You can paste this code inside the Creatomate code editor to render the generated video
                </DialogDescription>
              </DialogHeader>
              <Button type="submit" variant="outline" class="ml-auto mr-4 gap-3" onClick={scriptToClipboard}>
                <Show
                  when={!copied()}
                  fallback={
                    <>
                      <BsClipboardCheckFill />
                      <span>Copied!</span>
                    </>
                  }
                >
                  <BsClipboard />
                  <span>Copy to clipboard</span>
                </Show>
              </Button>
            </div>
            <div class="overflow-y-auto h-96 bg-muted rounded px-4">
              <pre class="py-4 text-sm">
                {video() ? JSON.stringify(JSON.parse(video().script), null, 2) : 'Loading...'}
              </pre>
            </div>
          </DialogContent>
        </Dialog>

        <div class="flex-1">
          <A href="/generate">
            <Button class="gap-2" variant="ghost">
              <VsArrowLeft />
              <span class="font-medium">Back</span>
            </Button>
          </A>
          <h1 class="text-xl font-medium mt-8">{video() ? video().generatedText.slice(0, 30) : '...'}</h1>
          <small>29. Juli 2023</small>

          <Accordion collapsible class="w-full mt-8">
            <AccordionItem value="transcript">
              <AccordionTrigger>Transcript</AccordionTrigger>
              <AccordionContent>
                <Show when={video()}>{video().generatedText}</Show>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent>
                <Show when={video()}>{video().description}</Show>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Container>
    </DefaultLayout>
  );
};
