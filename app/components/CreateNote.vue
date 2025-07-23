<template>
  <div class="flex flex-col gap-y-5">
    <div
      class="flex flex-col h-full md:flex-row gap-y-4 md:gap-x-6 overflow-hidden p-px"
    >
      <UCard
        :ui="{
          base: 'h-full flex flex-col flex-1',
          body: { base: 'flex-grow' },
          header: { base: 'md:h-[72px]' },
        }"
      >
        <template #header>
          <h3
            class="text-base md:text-lg font-medium text-gray-600 dark:text-gray-300"
          >
            Note transcript
          </h3>
        </template>
        <UTextarea
          v-model="note"
          placeholder="Type your note or use voice recording..."
          size="lg"
          autofocus
          :disabled="loading || isTranscribing || state.isRecording"
          :rows="10"
          resize
          class="resize-y"
        />
      </UCard>

      <UCard
        class="md:h-full md:flex md:flex-col md:w-96 shrink-0 order-first md:order-none"
        :ui="{
          body: { base: 'max-h-36 md:max-h-none md:flex-grow overflow-y-auto' },
        }"
      >
        <template #header>
          <div class="flex items-center justify-between w-full">
            <h3
              class="text-base md:text-lg font-medium text-gray-600 dark:text-gray-300"
            >
              Note recordings
            </h3>

            <div class="flex items-center gap-x-4">
              <span
                v-if="state.isRecording"
                class="font-mono tabular-nums text-gray-500 dark:text-gray-400"
              >
                {{ formatDuration(state.recordingDuration) }}
              </span>
              <UTooltip text="Enable transcription">
                <UToggle v-model="settings.transcriptionEnabled" />
              </UTooltip>
              <UTooltip
                :text="state.isRecording ? 'Stop Recording' : 'Start Recording'"
              >
                <UButton
                  :icon="
                    state.isRecording
                      ? 'i-heroicons-stop-circle'
                      : 'i-heroicons-microphone'
                  "
                  :color="state.isRecording ? 'red' : 'primary'"
                  :loading="isTranscribing"
                  @click="toggleRecording"
                />
              </UTooltip>
            </div>
          </div>
        </template>

        <AudioVisualizer
          v-if="state.isRecording"
          class="w-full h-14 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2"
          :audio-data="state.audioData"
          :data-update-trigger="state.updateTrigger"
        />

        <div
          v-else-if="isTranscribing"
          class="flex items-center justify-center h-14 gap-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2 text-gray-500 dark:text-gray-400"
        >
          <UIcon
            name="i-heroicons-arrow-path-20-solid"
            class="w-6 h-6 animate-spin"
          />
          Transcribing...
        </div>

        <RecordingsList :recordings="recordings" @delete="deleteRecording" />

        <div
          v-if="!recordings.length && !state.isRecording && !isTranscribing"
          class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400"
        >
          No recordings...
        </div>
      </UCard>
    </div>

    <UDivider />

    <div class="flex justify-end gap-x-4">
      <UButton
        icon="i-heroicons-trash"
        color="gray"
        size="lg"
        variant="ghost"
        :disabled="loading"
        @click="clearNote"
      >
        Clear
      </UButton>
      <UButton
        icon="i-heroicons-cloud-arrow-up"
        size="lg"
        :loading="loading"
        :disabled="!note.trim() && !state.isRecording"
        @click="saveNote"
      >
        Save
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStorageAsync } from '@vueuse/core';
import type { Recording, Settings } from '~~/types';

const emit = defineEmits<{
  (e: 'created'): void;
}>();

const note = ref('');
const loading = ref(false);
const isTranscribing = ref(false);
const { state, startRecording, stopRecording } = useMediaRecorder();
const recordings = ref<(Recording & { duration: number })[]>([]);

const handleRecordingStart = async () => {
  try {
    await startRecording();
  } catch (err) {
    console.error('Error accessing microphone:', err);
    useToast().add({
      title: 'Error',
      description: 'Could not access microphone. Please check permissions.',
      color: 'red',
    });
  }
};

const handleRecordingStop = async () => {
  const duration = state.value.recordingDuration;
  let blob: Blob | undefined;

  try {
    blob = await stopRecording();
  } catch (err) {
    console.error('Error stopping recording:', err);
    useToast().add({
      title: 'Error',
      description: 'Failed to record audio. Please try again.',
      color: 'red',
    });
  }

  if (blob) {
    if (settings.value.transcriptionEnabled) {
      try {
        const transcription = await transcribeAudio(blob);

        console.log('transcription:', transcription);

        note.value += note.value ? '\n\n' : '';
        note.value += transcription ?? '';
      } catch (err) {
        console.error('Error transcribing audio:', err);
        useToast().add({
          title: 'Error',
          description: 'Failed to transcribe audio. Please try again.',
          color: 'red',
        });
      }
    }

    recordings.value.push({
      url: URL.createObjectURL(blob),
      blob,
      id: `${Date.now()}`,
      duration,
    });
  }
};

const toggleRecording = () => {
  if (state.value.isRecording) {
    handleRecordingStop();
  } else {
    handleRecordingStart();
  }
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

const settings = useStorageAsync<Settings>('vNotesSettings', {
  transcriptionEnabled: false,
  postProcessingEnabled: false,
  postProcessingPrompt: '',
});

const transcribeAudio = async (blob: Blob) => {
  try {
    isTranscribing.value = true;
    const formData = new FormData();
    formData.append('audio', blob);

    if (
      settings.value.postProcessingEnabled &&
      settings.value.postProcessingPrompt
    ) {
      formData.append('prompt', settings.value.postProcessingPrompt);
    }

    return await $fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });
  } finally {
    isTranscribing.value = false;
  }
};

const clearNote = () => {
  note.value = '';
  recordings.value = [];
};

const saveNote = async () => {
  if (!note.value.trim()) return;

  loading.value = true;

  const noteToSave: { text: string; audioUrls?: string[]; duration?: number } = {
    text: note.value.trim(),
  };

  if (recordings.value.length) {
    noteToSave.duration = recordings.value.reduce((acc, r) => acc + r.duration, 0);
  }

  try {
    if (recordings.value.length) {
      noteToSave.audioUrls = await uploadRecordings();
    }

    await $fetch('/api/notes', {
      method: 'POST',
      body: noteToSave,
    });

    useToast().add({
      title: 'Success',
      description: 'Note saved successfully',
      color: 'green',
    });

    note.value = '';
    recordings.value = [];

    emit('created');
  } catch (err) {
    console.error('Error saving note:', err);
    useToast().add({
      title: 'Error',
      description: 'Failed to save note',
      color: 'red',
    });
  }
  finally {
    loading.value = false;
  }
};

const deleteRecording = (recording: Recording) => {
  recordings.value = recordings.value.filter((r) => r.id !== recording.id);
};

const uploadRecordings = async () => {
  if (!recordings.value.length) return;

  const formData = new FormData();
  recordings.value.forEach((recording) => {
    console.log('blob type:', recording.blob.type);
    formData.append('files', recording.blob, recording.id + '.webm');
  });

  const uploadKeys = await $fetch('/api/upload', {
    method: 'PUT',
    body: formData,
  });

  return uploadKeys;
};
</script>
