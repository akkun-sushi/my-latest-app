"use client";

import { useRouter } from "next/navigation";
import { WordWithSenses } from "../../../types/WordSensesList";
import { fetchFromLocalStorage } from "../hooks/fetchFromLocalStorage";
import { getNDaysLater, getToday } from "../hooks/dateUtils";
import { useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useUserData } from "../hooks/useUserData";

// 🧩 Props の型定義：モーダルに必要な情報を渡す
type ListModalProps = {
  isOpen: boolean; // モーダルを表示するかどうか
  onClose: () => void; // モーダルを閉じる関数
  index: number; // 対象チャンク番号
  wordList: WordWithSenses[]; // 表示用の単語リスト
};

export default function ChunkListModal({
  isOpen,
  onClose,
  index,
  wordList,
}: ListModalProps) {
  const router = useRouter();
  const { updateUserData } = useUserData();

  // 🔹 localStorageからlearningPlan（学習進捗）を取得
  const { userData } = fetchFromLocalStorage();
  if (!userData) return null; // learningPlanが未定義なら描画しない

  const learningPlan = userData.learningPlan;

  const chunk = learningPlan.chunks[index];

  // 🔍 チャンクが未初期化（＝学習未開始）かどうかを判定
  const isChunkUninitialized = (): boolean => {
    return chunk.startDate === "" && chunk.targetDate === "";
  };

  // 🟢 「スタート／続きから」ボタンを押したときの処理
  const handleStart = () => {
    // 未初期化なら startDate と targetDate を設定
    if (isChunkUninitialized()) {
      chunk.startDate = getToday();
      chunk.targetDate = getNDaysLater(learningPlan.durationDays - 1); // 学習開始日も含めるため -1
    }

    // 現在のチャンク番号を更新
    learningPlan.currentChunkIndex = index;

    // learningPlanをsupabaseとlocalStorageに保存
    updateUserData(userData.userId, { learningPlan });

    // 学習モード選択ページへ遷移
    router.push("/ModeSelect");
  };

  // ✋ モーダル表示中は背景スクロールを止める
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null; // 非表示なら描画しない

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={() => onClose()} // 背景クリックで閉じる
    >
      <div
        className="bg-white text-black rounded-2xl p-4 md:p-6 w-full max-w-4xl shadow-2xl max-h-[80dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // モーダル内クリックで閉じない
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* ⬅ 左側：単語リスト表示 */}
          <div className="flex flex-col">
            <div className="flex items-center justify-center mb-4">
              <h3 className="text-base md:text-xl font-semibold">単語リスト</h3>
            </div>

            <div className="space-y-6 overflow-y-auto max-h-[50dvh] md:max-h-[70vh] pr-1 md:pr-2">
              {wordList.slice(0, 10).map((word) => (
                <div
                  key={word.word_id}
                  className="border rounded-xl p-4 shadow-sm bg-white space-y-4"
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-bold text-indigo-700">
                      {word.word}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {word.senses[0]?.pos}
                    </span>
                  </div>

                  {word.senses.map((sense) => (
                    <div
                      key={sense.senses_id}
                      className="border-l-4 border-indigo-300 pl-4 space-y-2"
                    >
                      <p className="text-gray-800 font-bold italic">
                        <span className="text-red-500">定義:</span> {sense.en}
                      </p>
                      <p className="text-gray-800 font-bold italic">
                        <span>和訳:</span> {sense.ja}
                      </p>
                      <p className="text-gray-700 text-sm">📘 {sense.seEn}</p>
                      <p className="text-gray-700 text-sm">📙 {sense.seJa}</p>
                    </div>
                  ))}
                </div>
              ))}
              <p className="mt-4 text-right text-xs text-gray-400">
                ※冒頭10単語のみ表示
              </p>
            </div>
          </div>

          {/* ➡ 右側：操作・メッセージ・進捗 */}
          <div className="flex flex-col justify-between">
            <div className="md:mt-24">
              <div className="space-y-6">
                {/* 🔸 モチベーションメッセージ */}
                <h2 className="text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-extrabold text-xl md:text-2xl">
                  {isChunkUninitialized()
                    ? "最初の一歩を踏み出しましょう！"
                    : "継続は力なり！"}
                </h2>

                {/* 🔸 スタートボタン */}
                <button
                  onClick={handleStart}
                  className={`md:mt-8 mb-8 md:mb-0 w-full ${
                    isChunkUninitialized()
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white font-bold py-4 md:py-6 px-4 rounded-xl transition text-xl md:text-2xl`}
                >
                  {isChunkUninitialized() ? "スタート" : "続きから"}
                </button>
              </div>

              {/* 🔸 名言（デスクトップのみ表示） */}
              <div className="hidden md:block mt-12 py-10 px-6 rounded-xl bg-gray-100 text-center shadow-md animate-fade-in text-lg font-semibold">
                <p className="italic mb-2">
                  “Success is not final, failure is not fatal: it is the courage
                  to continue that counts.”
                </p>
                <p className="italic text-gray-600">
                  「成功は最終目的ではなく、失敗も致命的ではない。大切なのは続ける勇気だ」
                  ― Winston Churchill
                </p>
              </div>
            </div>

            {/* 🔸 進捗バー（右下） */}
            <ProgressBar index={index} textColor="text-gray-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
