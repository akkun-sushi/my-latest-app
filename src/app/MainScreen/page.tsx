"use client";

import { useEffect, useState } from "react";
import {
  INITIAL_USER_DATA,
  SenseStatus,
  UserData,
  WordWithSenses,
} from "../../../types/WordSensesList";
import { fetchFromLocalStorage } from "../hooks/fetchFromLocalStorage";
import ProgressBar from "../components/ProgressBar";
import ChunkListModal from "../components/ChunkListModal";
import Sidebar from "../components/Sidebar";
import { getToday } from "../hooks/dateUtils";
import { LearnSettingsModal } from "../components/LearnSettingsModal";
import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { updateLocalStorageObject } from "../hooks/updateLocalStorage";
import { LearningPlanCard } from "./components/LearningPlanCard";
import { LoadingScreen } from "../components/LoadingScreen";

export default function MainScreen() {
  // 🔹 チャンク済み単語リストとステータスの状態
  const [wordLists, setWordLists] = useState<WordWithSenses[][]>([]);
  const [statuses, setStatuses] = useState<SenseStatus[]>([]);
  const [userData, setUserData] = useState<UserData>(INITIAL_USER_DATA);
  const [reviewWords, setReviewWords] = useState<WordWithSenses[]>([]);
  const [nextReviewDate, setNextReviewDate] = useState<string | null>(null);
  const [nextReviewCount, setNextReviewCount] = useState<number>(0);

  // 🔹 現在選択中のチャンクインデックスとモーダルの開閉状態
  const [selectedChunkIndex, setSelectedChunkIndex] = useState<number>(0);
  const [unlockedChunkIndex, setUnlockedChunkIndex] = useState<number>(0);
  const [chunkListModal, setChunkListModal] = useState(false);
  const [learnSettingsModal, setLearnSettingsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 初期は読み込み中
  const [isOpen, setIsOpen] = useState(false); // アコーディオンの開閉状態

  // ✅ 初回レンダリング時にローカルストレージからデータ取得
  useEffect(() => {
    const { chunkedWords, statuses, userData } = fetchFromLocalStorage();

    if (chunkedWords && statuses && userData) {
      setWordLists(chunkedWords); // チャンク済み単語リストをセット
      setStatuses(statuses);
      setUserData(userData);
      setSelectedChunkIndex(userData.learningPlan.currentChunkIndex); // 現在のチャンクを選択されたチャンクにセット
      setUnlockedChunkIndex(userData.learningPlan.unlockedChunkIndex); // 上限チャンクをセット
    } else {
      console.warn("⚠️ データが見つからないか、読み込みエラーです");
    }

    // 読み込み完了
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (wordLists.length !== 0 && statuses.length !== 0) {
      const flatWordList = wordLists.flat();
      const generated = generateReviewList(flatWordList, statuses);
      setReviewWords(generated);

      // 🔽 generated から最も早い reviewDate を持つ SenseStatus を探す
      const allMatchingStatuses: SenseStatus[] = [];

      for (const word of flatWordList) {
        for (const sense of word.senses) {
          const status = statuses.find(
            (s) =>
              s.word_id === word.word_id &&
              s.senses_id === sense.senses_id &&
              s.level >= 3
          );
          if (status) {
            allMatchingStatuses.push(status);
          }
        }
      }

      if (allMatchingStatuses.length === 0) {
        setNextReviewDate(null);
        setNextReviewCount(0);
      } else {
        const earliestDate = allMatchingStatuses
          .map((s) => s.reviewDate)
          .sort()[0];

        const formatJapaneseDate = (dateStr: string | null) => {
          if (!dateStr) return "未定";
          const parsed = new Date(dateStr);
          return format(parsed, "yyyy年M月d日", { locale: ja });
        };

        const count = allMatchingStatuses.filter(
          (s) => s.reviewDate === earliestDate
        ).length;

        setNextReviewDate(formatJapaneseDate(earliestDate));
        setNextReviewCount(count);
      }
    }
  }, [wordLists, statuses]);

  const generateReviewList = (
    words: WordWithSenses[],
    statuses: SenseStatus[]
  ): WordWithSenses[] => {
    const today = getToday();

    // 該当する単語と、その中で一番古いreviewDateをマッピング
    const result: { word: WordWithSenses; oldestReviewDate: string }[] = [];

    for (const word of words) {
      // その単語に対応するSenseStatusのうち、条件を満たすものを抽出
      const matchingStatuses = word.senses
        .map((sense) =>
          statuses.find(
            (s) =>
              s.word_id === word.word_id &&
              s.senses_id === sense.senses_id &&
              s.level >= 3 &&
              s.reviewDate <= today
          )
        )
        .filter((s): s is SenseStatus => !!s);

      if (matchingStatuses.length > 0) {
        const oldestReviewDate = matchingStatuses
          .map((s) => s.reviewDate)
          .sort()[0]; // 最も古い日付

        result.push({ word, oldestReviewDate });
      }
    }

    // reviewDateの昇順でソート
    result.sort((a, b) => a.oldestReviewDate.localeCompare(b.oldestReviewDate));

    // 単語だけ取り出して返す
    return result.map((r) => r.word);
  };

  const handleReview = () => {
    if (reviewWords.length > 0) {
      updateLocalStorageObject("LearnSettings", {
        mode: "review",
      });
      setLearnSettingsModal(true);
    } else {
      console.log("復習するべき単語がありません");
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {learnSettingsModal && (
        <LearnSettingsModal
          words={reviewWords}
          statuses={statuses}
          isOpen={learnSettingsModal}
          onClose={() => setLearnSettingsModal(false)}
        />
      )}
      {/* ⬅ サイドバー（ナビゲーション） */}
      <Sidebar isFixed={false} />

      {/* ⬆ メインコンテンツエリア */}
      <main className="flex-1 p-6 flex flex-col items-center relative">
        <h1 className="text-lg md:text-4xl font-bold mb-4 md:mb-10">
          {userData.userName}さん、
          <br />
          おかえりなさい！
        </h1>

        <LearningPlanCard
          wordLists={wordLists}
          unlockedChunkIndex={unlockedChunkIndex}
          learningPlan={userData.learningPlan}
        />

        {/* 🔁 復習カードと📚現在学習中チャンクカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mb-10">
          {/* 📚 学習中チャンクカード */}
          <div
            className="cursor-pointer rounded-2xl shadow-lg p-6 flex flex-col justify-between bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-black transition-all duration-200 hover:scale-105"
            onClick={() => {
              setSelectedChunkIndex(unlockedChunkIndex);
              setChunkListModal(true);
            }}
          >
            <div className="mb-4 text-center">
              <h2 className="text-2xl text-white font-extrabold mb-2 tracking-wide drop-shadow-sm w-full border-b-4 border-white pb-1">
                学習中チャンク
              </h2>
              <p className="text-lg font-bold text-white">
                {`${unlockedChunkIndex * 100 + 1} 〜 ${
                  (unlockedChunkIndex + 1) * 100
                }単語`}
              </p>
              <div className="mt-2">
                <ProgressBar
                  index={unlockedChunkIndex}
                  textColor="text-white"
                />
              </div>
            </div>
          </div>

          {/* 🔁 復習カード */}
          <div
            className={`cursor-pointer rounded-2xl shadow-md p-6 flex flex-col justify-between transition-all duration-200
            ${
              reviewWords.length > 0
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:scale-105"
                : "bg-gray-600 text-gray-300 cursor-not-allowed opacity-60"
            }`}
            onClick={reviewWords.length > 0 ? handleReview : undefined}
          >
            <div className="md:mb-4 text-center">
              <h2 className="text-2xl font-extrabold mb-3 tracking-wide drop-shadow-sm w-full border-b-4 border-white pb-1">
                復習する
              </h2>

              {reviewWords.length > 0 ? (
                <div className="space-y-2 text-sm">
                  <p className="md:text-lg font-bold">
                    今日の復習リストに取り組もう！
                  </p>
                  <div className="mt-3 flex justify-center">
                    <div className="text-left font-semibold rounded-lg text-sm space-y-1">
                      <p>
                        <span>今日の復習単語：</span>
                        {Math.min(reviewWords.length, 100)}語
                      </p>
                      <p>
                        <span>合計復習対象：</span>
                        {reviewWords.length}語
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="md:text-lg font-bold">
                    今日は復習単語がありません
                  </p>
                  <div className="mt-3 flex justify-center">
                    <div className="bg-white/10 text-left p-3 rounded-lg text-sm space-y-1">
                      <p>
                        <span className="font-semibold">次回の復習日：</span>
                        {nextReviewDate ? nextReviewDate : "未定"}
                      </p>
                      <p>
                        <span className="font-semibold">予定単語数：</span>
                        {nextReviewCount > 100
                          ? "100語以上"
                          : `${nextReviewCount}語`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🧱 チャンク選択用のカード一覧 */}
        <div className="w-full max-w-6xl">
          {/* アコーディオンのタイトルカード */}
          <div
            className={`cursor-pointer bg-gradient-to-br from-lime-100 via-lime-200 to-green-100
              rounded-2xl shadow-lg p-8 mb-6
              hover:scale-105 hover:shadow-2xl
              transition-transform duration-300 border border-lime-300`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 tracking-wide flex items-center justify-center gap-3">
              {isOpen ? "▼" : "▶"} 全単語リストを見る
            </h2>
          </div>
          {/* 展開されたカード群 */}
          {isOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wordLists.map((_, index) => {
                const start = index * 100 + 1;
                const end = (index + 1) * 100;
                const tagName = `${start} 〜 ${end}単語`;
                const isDisabled = index > unlockedChunkIndex;

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (isDisabled) return;
                      setSelectedChunkIndex(index);
                      setChunkListModal(true);
                    }}
                    className={`cursor-pointer rounded-2xl shadow-xl p-6 flex flex-col justify-between transition-transform duration-300
                ${
                  isDisabled
                    ? "bg-gray-700 cursor-not-allowed opacity-50"
                    : "bg-gray-800 hover:scale-105"
                }
              `}
                  >
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold mb-2">{tagName}</h2>
                      <ProgressBar index={index} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 📦 チャンク選択時に開くモーダル（詳細 & スタート） */}
        <ChunkListModal
          isOpen={chunkListModal}
          onClose={() => setChunkListModal(false)}
          index={selectedChunkIndex}
          wordList={wordLists[selectedChunkIndex]}
        />
      </main>
    </div>
  );
}
