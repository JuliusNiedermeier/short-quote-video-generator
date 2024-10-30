import { Button } from '@/common/components/ui/button';
import { and, collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { AiOutlineDelete } from 'solid-icons/ai';
import { Component, For, createSignal, onCleanup, onMount } from 'solid-js';
import { Container } from '~/common/components/Container';
import { VideoGallery, VideoItem, VideoItemThumbnail } from '~/common/components/VideoGallery';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '~/common/components/ui/context-menu';
import { auth, firestore, storage } from '~/common/lib/firesbase';

export const VideoLibrary: Component = () => {
  const [videos, setVideos] = createSignal<Record<any, any>[]>([]);

  onMount(() => {
    const uploadsCollection = collection(firestore, 'uploads');

    const unsubscribe = onSnapshot(
      query(uploadsCollection, and(where('owner', '==', auth.currentUser.uid), where('fileType', '==', 'video/mp4'))),
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

  const handleDelete = (id: string) => {
    return deleteDoc(doc(firestore, `uploads/${id}`));
  };

  return (
    <Container>
      <VideoGallery>
        <For each={videos()}>
          {(item) => (
            <ContextMenu>
              <ContextMenuTrigger>
                <VideoItem class="cursor-auto">
                  <VideoItemThumbnail src={item.thumbnailURL} />
                </VideoItem>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => handleDelete(item.id)} class="text-destructive">
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          )}
        </For>
      </VideoGallery>
    </Container>
  );
};
