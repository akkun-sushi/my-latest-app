export type Word = {
  id: string;
  en: string;
  ja: string;
  seEn: string;
  seJa: string;
  level: number;
  learnedAt?: string;
};

export type WordList = {
  [listName: string]: Word[];
};

export const ListNames = ["Beginner", "Intermediate", "Advanced"] as const;
export type ListName = null | (typeof ListNames)[number];
export type ListProgress = {
  listName: Exclude<ListName, null>; 
  learnedCount: number;
  progress: number;
  color: string;
};

export type LearnSettings = {
  mode: "word-en-ja" | "word-ja-en" | "sentence-en-ja" | "sentence-ja-en";
  method: "learn" | "review" | "test";
  order: "default" | "alphabetical" | "random";
  levels: {
    [level: number]: boolean;
  };
};
