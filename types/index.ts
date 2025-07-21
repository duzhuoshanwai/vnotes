export type Recording = {
  url: string;
  blob: Blob;
  id: string;
};

export type Note = {
  id: number;
  text: string;
  audioUrls?: string[] | null;
  createdAt: string;
  updatedAt: string;
  shareId?: string;
};

export type Settings = {
  transcriptionEnabled: boolean;
  postProcessingEnabled: boolean;
  postProcessingPrompt: string;
};
