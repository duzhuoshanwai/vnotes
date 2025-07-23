<template>
  <div class="p-4">
    <NoteDetail v-if="note" :note="note" />
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
import type { Note } from '~~/types';
import NoteDetail from '~/components/NoteDetail.vue';

const route = useRoute();
const note = ref<Note | null>(null);
const error = ref<string | null>(null);

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
