import {
  SenseStatus,
  WordRow,
  WordWithSenses,
} from "../../../../../types/WordSensesList";

export function convertToWordRows(
  chunkedWords: WordWithSenses[][],
  chunkedStatuses: SenseStatus[][]
): WordRow[] {
  const flattened: WordRow[] = chunkedWords.flatMap((words, chunkIndex) => {
    const statuses = chunkedStatuses[chunkIndex] || [];

    return words
      .map((word) => {
        const mainSense = word.senses[0]; // 単語と意味が一対一を想定　// 後で変更
        if (!mainSense) return null; // 万が一sensesが空の場合の安全対策

        const status = statuses.find(
          (s) => s.senses_id === mainSense.senses_id
        );

        const correct = status?.correct ?? 0;
        const mistake = status?.mistake ?? 0;
        const level = status?.level ?? 0;

        const accuracy =
          correct + mistake === 0
            ? null
            : Math.round((correct / (correct + mistake)) * 100);

        const learnedDate = status?.learnedDate ?? null;
        const reviewDate = status?.reviewDate ?? null;

        const statusLabel = determineStatus(level);

        return {
          word_id: word.word_id,
          word: word.word,
          tags: mainSense.tags || "",
          chunkIndex: chunkIndex,
          status: statusLabel,
          level,
          accuracy,
          learnedDate,
          reviewDate,
        };
      })
      .filter((row): row is WordRow => row !== null); // null を除去
  });

  return flattened;
}

function determineStatus(level: number): WordRow["status"] {
  if (level === 0) return "未学習";
  if (level === 1) return "インプット中";
  if (level === 2) return "アウトプット中";
  if (level === 10) return "完了";
  if (level >= 3) return "復習中";
  return "未学習";
}

export function formatTagWithChunk(tags: string, chunkIndex: number): string {
  const index = chunkIndex + 1; // 表示用に1始まりに
  if (!tags) return `チャンク (${index})`; // タグが空ならフォールバック
  return `${tags} (${index})`;
}

export function formatLevel(level: number): string {
  return level === 0 ? "--" : `Lv${level}`;
}

export function formatAccuracy(accuracy: number | null): string {
  if (accuracy === null) return "--";
  return `${accuracy}%`;
}

export function formatJapaneseDate(dateStr: string | null): string {
  if (!dateStr) return "--";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return "--";

  const [year, month, day] = parts;
  return `${Number(year)}年${Number(month)}月${Number(day)}日`;
}
