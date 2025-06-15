"use client";

import { useEffect, useMemo, useState } from "react";
import { SenseStatus, WordWithSenses } from "../../../types/WordSensesList";
import { saveListToLocalStorage } from "../hooks/updateLocalStorage";
import { useRouter } from "next/navigation";

type Props = {
  words: WordWithSenses[];
  statuses: SenseStatus[];
  isOpen: boolean;
  onClose: () => void;
};

export const LearnSettingsModal = ({
  words,
  statuses,
  isOpen,
  onClose,
}: Props) => {
  if (!isOpen) return null;

  const router = useRouter();

  const [questionType, setQuestionType] = useState("en-ja"); //一時的にen-jaの選択可 のちのちオプション拡大
  const [order, setOrder] = useState("random");
  const [wordCount, setWordCount] = useState(100);
  const [onlyMistakes, setOnlyMistakes] = useState(false);

  const sortWords = (
    words: WordWithSenses[],
    order: string
  ): WordWithSenses[] => {
    switch (order) {
      case "alphabetical":
        return [...words].sort((a, b) => a.word.localeCompare(b.word));

      case "random":
        return [...words].sort(() => Math.random() - 0.5);

      case "level":
        return [...words].sort((a, b) => {
          const levelA = getLevel(a, statuses);
          const levelB = getLevel(b, statuses);
          return levelA - levelB;
        });

      case "reviewDate":
        return [...words].sort((a, b) => {
          const dateA = getReviewDate(a, statuses);
          const dateB = getReviewDate(b, statuses);
          return dateA.localeCompare(dateB);
        });

      default:
        return words;
    }
  };

  const selectWordsByCount = (
    words: WordWithSenses[],
    count: number
  ): WordWithSenses[] => {
    if (count === -1 || count >= words.length) {
      return [...words]; // 全件
    }

    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const filterOnlyMistakesWords = (
    words: WordWithSenses[],
    onlyMistakes: boolean
  ): WordWithSenses[] => {
    if (!onlyMistakes) return [...words];

    const mistakeWordIds = new Set(
      statuses.filter((s) => s.temp === 2).map((s) => s.word_id)
    );

    return words.filter((word) => mistakeWordIds.has(word.word_id));
  };

  const finalWords = useMemo(() => {
    const filtered = filterOnlyMistakesWords(words, onlyMistakes);
    const sorted = selectWordsByCount(filtered, wordCount);
    const final = sortWords(sorted, order);
    return final;
  }, [words, statuses, onlyMistakes, wordCount, order]);

  const handleStart = () => {
    if (finalWords.length === 0) {
      alert("該当する単語がありません。条件を見直してください。");
      return;
    }

    saveListToLocalStorage("CurrentLearningList", finalWords);
    router.push("/ModeSelect/StudyCard");
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-[90vw] max-w-lg p-6 space-y-6 relative max-h-[80dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* タイトル */}
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-2xl font-extrabold text-gray-800">
            📘 復習 学習設定
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-600">該当単語</span>
            <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full shadow-sm w-[5rem] text-center">
              {finalWords.length} 語
            </span>
          </div>
        </div>

        {/* ✅ 出題形式（モード詳細） */}
        <div className="space-y-2">
          <h3 className="text-md font-bold text-gray-700">出題スタイル</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "en-ja", label: "英語 → 日本語" },
              { value: "en-def", label: "英語 → 定義" },
              { value: "ja-en", label: "日本語 → 英語" },
              { value: "sen-en-ja", label: "例文英語 → 日本語" },
              { value: "sen-ja-en", label: "例文日本語 → 英語" },
            ].map((opt) => (
              <button
                key={opt.value}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  questionType === opt.value
                    ? "bg-blue-200 text-blue-800"
                    : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ 単語の順序 */}
        <div className="space-y-2">
          <h3 className="text-md font-bold text-gray-700">単語の順序</h3>
          <div className="flex gap-3 flex-wrap">
            {[
              { value: "alphabetical", label: "ABC順" },
              { value: "random", label: "ランダム" },
              { value: "level", label: "習熟度順" },
              { value: "reviewDate", label: "復習日が古い順" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOrder(opt.value)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                  order === opt.value
                    ? "bg-orange-200 text-orange-800"
                    : "bg-gray-200 text-gray-600 hover:bg-blue-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ 出題語数 */}
        <div className="space-y-2">
          <h3 className="text-md font-bold text-gray-700">復習語数</h3>
          <div className="flex gap-3 flex-wrap">
            {[25, 50, 100, -1].map((n) => (
              <button
                key={n}
                onClick={() => setWordCount(n)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                  wordCount === n
                    ? "bg-green-200 text-green-800"
                    : "bg-gray-200 text-gray-600 hover:bg-green-100"
                }`}
              >
                {n === -1 ? "全件" : `${n}語`}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ 前回間違えた単語のみ */}
        <div className="space-y-2">
          <h3 className="text-md font-bold text-gray-700">
            前回間違えた単語のみ出題
          </h3>
          <div className="flex gap-3">
            {[
              { value: true, label: "オン" },
              { value: false, label: "オフ" },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setOnlyMistakes(opt.value)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                  onlyMistakes === opt.value
                    ? "bg-red-200 text-red-800"
                    : "bg-gray-200 text-gray-600 hover:bg-red-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ スタートボタン */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
        >
          🚀 復習する
        </button>
      </div>
    </div>
  );
};

const getLevel = (word: WordWithSenses, statuses: SenseStatus[]): number => {
  const sense = word.senses[0]; // senseが1つだけという前提
  const status = statuses.find(
    (s) => s.word_id === word.word_id && s.senses_id === sense.senses_id
  );
  return status?.level ?? 0;
};

const getReviewDate = (
  word: WordWithSenses,
  statuses: SenseStatus[]
): string => {
  const sense = word.senses[0];
  const status = statuses.find(
    (s) => s.word_id === word.word_id && s.senses_id === sense.senses_id
  );
  return status?.reviewDate ?? "9999-12-31"; // 復習日が未設定なら極端な未来日で後回しに
};
