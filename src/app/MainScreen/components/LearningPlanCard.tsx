"use client";

import { addDays, format, parseISO } from "date-fns";
import { LearningPlan, WordWithSenses } from "../../../../types/WordSensesList";
import { getToday } from "@/app/hooks/dateUtils";
import { formatJapaneseDate } from "../WordList/hooks/convertToWordRows";
import { useEffect, useState } from "react";

type Props = {
  wordLists: WordWithSenses[][];
  unlockedChunkIndex: number;
  learningPlan: LearningPlan;
};

export const LearningPlanCard = ({
  wordLists,
  unlockedChunkIndex,
  learningPlan,
}: Props) => {
  const [today, setToday] = useState<string>("");

  // 日付のフォーマット関数内で例外処理を追加
  const getPlannedEndDate = (): string => {
    try {
      const { chunks, durationDays } = learningPlan;
      const sortedChunkIndexes = Object.keys(chunks)
        .map(Number)
        .sort((a, b) => a - b);

      const firstStartDate = chunks[sortedChunkIndexes[0]]?.startDate;
      if (!firstStartDate) return "未定";

      let currentDate = parseISO(firstStartDate);

      for (const index of sortedChunkIndexes) {
        const chunk = chunks[index];
        if (chunk.targetDate && chunk.targetDate.trim() !== "") {
          currentDate = parseISO(chunk.targetDate);
        } else {
          currentDate = addDays(currentDate, durationDays);
        }
      }

      return format(currentDate, "yyyy年M月d日");
    } catch {
      return "未定";
    }
  };

  useEffect(() => {
    const current = format(new Date(getToday()), "yyyy年M月d日");
    setToday(current);
  }, []);

  // 各項目に条件付き表示
  const goalStartDate =
    learningPlan.chunks[0]?.startDate &&
    learningPlan.chunks[0].startDate.trim() !== ""
      ? formatJapaneseDate(learningPlan.chunks[0].startDate)
      : "未定";

  const pace = learningPlan.durationDays;

  const totalChunks = wordLists.length || 0;
  const completedChunks = unlockedChunkIndex + 1 || 0;

  const progressRatio = totalChunks > 0 ? completedChunks / totalChunks : null;

  // 完了済みチャンク一覧を取得
  const completedChunkDates = Object.values(learningPlan.chunks)
    .map((chunk) => chunk.completeDate)
    .filter((date) => date && date.trim() !== "");

  // 🔍 全チャンク完了判定
  const isAllCompleted = completedChunkDates.length === wordLists.length;

  // 🎓 最終完了日を取得（ソートして最後のもの）
  const finalCompleteDate = isAllCompleted
    ? formatJapaneseDate(
        completedChunkDates.sort((a, b) =>
          parseISO(a) > parseISO(b) ? 1 : -1
        )[completedChunkDates.length - 1]
      )
    : null;

  // 🎯 日付表示
  const plannedOrCompletedDate = isAllCompleted
    ? finalCompleteDate
    : getPlannedEndDate();

  // 💬 メッセージ切り替え
  const message = isAllCompleted
    ? "🎉 全チャンクを学習し終えました！\n本当にお疲れさまでした！\nこれからも継続して語彙力を磨いていきましょう！"
    : progressRatio === null
    ? "現在の進捗状況はまだ設定されていません。"
    : progressRatio >= 0.7
    ? "かなり順調です！このまま完走しましょう！"
    : progressRatio >= 0.3
    ? "いいペースですね！この調子で進めましょう！"
    : "まだ始まったばかり。コツコツ進めていきましょう！";

  if (!wordLists || !learningPlan) return null;

  return (
    <div className="w-full max-w-6xl mb-8 px-4 py-6 sm:px-6 bg-gradient-to-r from-indigo-800 to-purple-800 text-white rounded-2xl shadow-xl space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-2">
        <h2 className="text-lg im:text-xl sm:text-2xl font-bold tracking-wide flex items-center gap-2">
          学習プラン
        </h2>
        <span className="bg-white/20 text-white/90 text-sm im:text-base sm:text-lg font-bold px-3 py-1 rounded-full shadow-sm">
          今日の日付：{today}
        </span>
      </div>

      {/* メイン情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 im:gap-4 sm:gap-6 text-sm sm:text-base">
        <div className="bg-white/10 p-3 im:p-4 rounded-xl space-y-1 shadow-sm text-center">
          <p className="font-semibold text-white/90">📆 学習開始日</p>
          <p className="text-sm im:text-lg font-bold">{goalStartDate}</p>
        </div>
        <div className="bg-white/10 p-3 im:p-4 rounded-xl space-y-1 shadow-sm text-center">
          <p className="font-semibold text-white/90">
            {isAllCompleted ? "🎓 学習完了日" : "🎯 学習完了予定日"}
          </p>
          <p className="text-sm im:text-lg font-bold">
            {plannedOrCompletedDate}
          </p>
        </div>
      </div>

      {/* 補足情報 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 im:gap-4 text-sm">
        <div className="bg-white/10 p-3 rounded-lg text-center">
          <p className="font-semibold text-white/80">📦 現在の進捗</p>
          <p className="text-sm im:text-lg font-bold">
            {completedChunks} / {totalChunks} チャンク
          </p>
        </div>
        <div className="bg-white/10 p-3 rounded-lg text-center">
          <p className="font-semibold text-white/80">⚡ ペース</p>
          <p className="text-sm im:text-lg font-bold">{`1チャンク / ${pace}日`}</p>
        </div>

        <div
          className={`${
            isAllCompleted
              ? "bg-gradient-to-r from-yellow-400 to-pink-500"
              : "bg-white/10"
          } sm:col-span-2 md:col-span-2 p-4 rounded-lg text-center`}
        >
          <p className="font-semibold text-white/80">💬 メッセージ</p>
          <p className="mt-2 text-sm im:text-base font-semibold leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
