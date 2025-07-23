import type { Note } from '~~/types';

// This type represents the raw note object as it is stored in the database
type DbNote = {
  id: number;
  text: string;
  created_at: string;
  updated_at: string;
  audio_urls: string | null;
  share_id: string | null;
  duration: number | null;
};

/**
 * Transforms a note object from the database (snake_case) to the format expected by the frontend API (camelCase).
 * @param dbNote The raw note object from the database.
 * @returns A note object formatted for the API.
 */
export const transformNote = (dbNote: DbNote): Note => {
  return {
    id: dbNote.id,
    text: dbNote.text,
    createdAt: dbNote.created_at,
    updatedAt: dbNote.updated_at,
    shareId: dbNote.share_id ?? undefined,
    duration: dbNote.duration ?? undefined,
    audioUrls: dbNote.audio_urls ? JSON.parse(dbNote.audio_urls) : [],
  };
};