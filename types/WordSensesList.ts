// Supabaseから取得するデータの型
export type Sense = {
  senses_id: number;
  pos: string;
  en: string;
  ja: string;
  seEn: string;
  seJa: string;
  tags: string;
};

export type WordWithSenses = {
  word_id: number;
  word: string;
  senses: Sense[];
};

export type SenseStatus = {
  word_id: number;
  senses_id: number;
  level: number; // 初期値: 0
  learnedDate: string; // 初期値: null（まだ学習していない場合）
  reviewDate: string;
  correct: number; // 初期値: 0
  mistake: number; // 初期値: 0
  temp: number; // 初期値: 0
};

// UserData -------------------------------------------------
export type UserData = {
  userId: string;
  userName: string;
  createdAt: string;
  tag: string;
  learningPlan: LearningPlan;
  progress: Progress;
};

export type ChunkProgress = {
  startDate: string; // 学習開始日
  targetDate: string; // 学習予定終了日
  completeDate: string; // 完了日（未完了なら空文字）
};

export type LearningPlan = {
  currentChunkIndex: number;
  unlockedChunkIndex: number;
  durationDays: 3 | 5 | 9;
  chunks: Record<number, ChunkProgress>;
};

export type Progress = Record<
  string,
  {
    learnCount: number;
    reviewCount: number;
  }
>;

export const INITIAL_USER_DATA: UserData = {
  userId: "", // ログイン後に付与されるUUID
  userName: "",
  createdAt: "",
  tag: "",
  learningPlan: {
    currentChunkIndex: 0,
    unlockedChunkIndex: 0,
    durationDays: 5,
    chunks: {},
  },
  progress: {},
};

// ---------------------------------------------------------

// LearnSettings ---------------------------------------
export type LearnSettings = {
  mode: "input" | "output" | "test" | "review";
  review: boolean;
};

// 初期値
export const INITIAL_LEARN_SETTINGS: LearnSettings = {
  mode: "input",
  review: false,
};
// ---------------------------------------------------------

export type WordRow = {
  word_id: number;
  word: string;
  tags: string;
  chunkIndex: number;
  status: "未学習" | "インプット中" | "アウトプット中" | "復習中" | "完了";
  level: number;
  accuracy: number | null;
  learnedDate: string | null;
  reviewDate: string | null;
};
