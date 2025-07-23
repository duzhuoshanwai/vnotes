<template>
  <UCard>
    <div class="space-y-2">
      <p
        ref="text"
        :class="['whitespace-pre-wrap', !showFullText && 'line-clamp-3']"
      >
        {{ note.text }}
      </p>
      <UButton
        v-if="shouldShowExpandBtn"
        variant="link"
        :padded="false"
        @click="showFullText = !showFullText"
      >
        {{ showFullText ? 'Show less' : 'Show more' }}
      </UButton>

      <div class="flex items-center gap-x-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Created: {{ formatDate(note.createdAt) }}
        </p>
        <p v-if="note.duration" class="text-sm text-gray-500 dark:text-gray-400">
          Duration: {{ formatDuration(note.duration) }}
        </p>
        <UButton
          v-if="note.shareId"
          icon="i-heroicons-share"
          variant="link"
          :padded="false"
          @click="copyShareLink"
        >
          Copy Share Link
        </UButton>
      </div>
    </div>

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
  </UCard>
</template>

<script setup lang="ts">
import type { Note } from '~~/types';

const props = defineProps<{ note: Note }>();

const copyShareLink = () => {
  if (props.note.shareId) {
    const shareUrl = `${window.location.origin}/share/${props.note.shareId}`;
    navigator.clipboard.writeText(shareUrl);
    useToast().add({
      title: 'Success',
      description: 'Share link copied to clipboard!',
      color: 'green',
    });
  }
};

const showFullText = ref(false);

const formatDuration = (seconds: number) => {
  if (!seconds) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

const formatDate = (time: string) => {
  const date = new Date(time);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

const noteText = useTemplateRef('text');
const shouldShowExpandBtn = ref(false);
onMounted(() => {
  if (
    noteText.value &&
    noteText.value.scrollHeight > noteText.value.clientHeight
  ) {
    shouldShowExpandBtn.value = true;
  }
});
</script>