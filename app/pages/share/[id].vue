<template>
  <div class="p-4">
    <UCard v-if="note">
      <template #header>
        <h1 class="text-2xl font-bold">Shared Note</h1>
      </template>
      <p class="text-gray-700 dark:text-gray-300">{{ note.text }}</p>
      <div
        v-if="note.audioUrls && note.audioUrls.length > 0"
        class="mt-6 flex gap-x-2 overflow-x-auto"
      >
        <audio
          v-for="url in note.audioUrls"
          :key="url"
          :src="url"
          controls
          class="w-60 shrink-0 h-10"
        />
      </div>
      <template #footer>
        <p class="text-sm text-gray-500">
          Created on: {{ new Date(note.created_at).toLocaleString() }}
        </p>
        <p v-if="note.duration" class="text-sm text-gray-500 mt-2">
          Duration: {{ formatDuration(note.duration) }}
        </p>
      </template>
    </UCard>
    <div v-else-if="error" class="text-center text-red-500">
      <p>{{ error }}</p>
    </div>
    <div v-else class="text-center">
      <p>Loading note...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const note = ref(null);
const error = ref<string | null>(null);

const formatDuration = (seconds: number) => {
  if (!seconds) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

onMounted(async () => {
  const shareId = route.params.id;
  if (typeof shareId === 'string') {
    try {
      const fetchedNote = await $fetch(`/api/notes/share/${shareId}`);
      note.value = fetchedNote;
    } catch (e) {
      error.value = 'Failed to load the note. It might not exist or the link is incorrect.';
      console.error(e);
    }
  }
});

</script>
