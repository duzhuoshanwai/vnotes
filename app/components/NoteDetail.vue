<template>
  <UCard v-if="note">
    <template #header>
      <h1 class="text-2xl font-bold">Shared Note</h1>
    </template>
    <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ note.text }}</p>
    <div
      v-if="note.audioUrls && note.audioUrls.length > 0"
      class="mt-6 flex flex-col gap-y-2"
    >
      <audio
        v-for="url in note.audioUrls"
        :key="url"
        :src="url"
        controls
        class="w-full h-10"
      />
    </div>
    <template #footer>
      <p class="text-sm text-gray-500">
        Created on: {{ new Date(note.createdAt).toLocaleString() }}
      </p>
      <p v-if="note.duration" class="text-sm text-gray-500 mt-2">
        Duration: {{ formatDuration(note.duration) }}
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { Note } from '~~/types';

defineProps<{
  note: Note;
}>();

const formatDuration = (seconds: number) => {
  if (!seconds) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};
</script>
