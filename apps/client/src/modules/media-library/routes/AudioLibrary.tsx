import { and, collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { Component, For, Show, createSignal, onCleanup, onMount } from 'solid-js';
import { Container } from '~/common/components/Container';
import { auth, firestore } from '~/common/lib/firesbase';
import { Badge } from '~/common/components/ui/badge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '~/common/components/ui/context-menu';

const formatSeconds = (totalSeconds) => `${Math.floor(totalSeconds / 60)}:${Math.floor(totalSeconds % 60)}`;

export const AudioLibrary: Component = () => {
  const [videos, setVideos] = createSignal<Record<any, any>[]>([]);

  onMount(() => {
    const uploadsCollection = collection(firestore, 'uploads');

    const unsubscribe = onSnapshot(
      query(uploadsCollection, and(where('owner', '==', auth.currentUser.uid), where('fileType', '==', 'audio/mpeg'))),
      (snap) => setVideos(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
    );

    onCleanup(unsubscribe);
  });

  const handleDelete = (id: string) => {
    return deleteDoc(doc(firestore, `uploads/${id}`));
  };

  return (
    <>
      <Container class="grid gap-4 grid-cols-2">
        <For each={videos()}>
          {(item) => (
            <ContextMenu>
              <ContextMenuTrigger>
                <div class="w-full bg-muted py-4 px-8 overflow-hidden rounded-md">
                  <span class="font-medium block whitespace-nowrap text-ellipsis">{item.fileName}</span>
                  <div class="flex items-center gap-2 mt-1">
                    <Show when={item.analyzed} fallback={<Badge>Analyzing audio</Badge>}>
                      <Badge variant="outline">Ready</Badge>
                    </Show>
                    <small class="text-gray-500 text-sm">~{Math.round(item.fileSize / 1000 / 1000)}MB</small>
                    <Show when={item.analyzed}>
                      <small>{Math.round(item.bpm)}bpm</small>
                      <small>Drop: {formatSeconds(item.maxChange)}</small>
                    </Show>
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem class="text-destructive" onClick={() => handleDelete(item.id)}>
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          )}
        </For>
      </Container>
    </>
  );
};
