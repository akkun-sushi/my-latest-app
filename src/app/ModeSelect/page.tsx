"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchFromLocalStorage } from "../hooks/fetchFromLocalStorage";
import {
  INITIAL_LEARN_SETTINGS,
  INITIAL_USER_DATA,
  LearningPlan,
  SenseStatus,
  UserData,
  WordWithSenses,
} from "../../../types/WordSensesList";
import { getToday } from "../hooks/dateUtils";
import { DeveloperTool } from "../components/DeveloperTool";
import Sidebar from "../components/Sidebar";
import {
  saveListToLocalStorage,
  updateLocalStorageObject,
} from "../hooks/updateLocalStorage";
import { LearnSettingsModal } from "../components/LearnSettingsModal";
import LearningPlanInfo from "./components/LearningPlanInfo";
import { useAutoReloadOnDateChange } from "../hooks/useAutoReloadOnDateChange";

export default function Page() {
  // ✅ ルーター取得
  const router = useRouter();

  // ✅ 各種ステートの初期化
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wordList, setWordList] = useState<WordWithSenses[]>([]);
  const [todayWordList, setTodayWordList] = useState<WordWithSenses[]>([]);
  const [currentList, setCurrentList] = useState<WordWithSenses[]>([]);
  const [senseStatuses, setSenseStatuses] = useState<SenseStatus[]>([]);
  const [userData, setUserData] = useState<UserData>(INITIAL_USER_DATA);
  const [showAll, setShowAll] = useState(false);

  const displayedWords = showAll ? wordList : wordList.slice(0, 10);

  // ==========================
  // ✅ 初期マウント処理
  // ==========================

  // 📅 日付変化を検知して自動リロード
  useAutoReloadOnDateChange();

  // ✅ 初期マウント時に localStorage からデータ取得しステート更新
  useEffect(() => {
    const {
      currentChunkWords: wordList,
      todayLearningList: todayWordList,
      currentChunkStatuses: senseStatuses,
      userData,
      learnSettings: settings,
    } = fetchFromLocalStorage();

    if (wordList && todayWordList && senseStatuses && userData && settings) {
      setWordList(wordList);
      setTodayWordList(todayWordList);
      setSenseStatuses(senseStatuses);
      setUserData(userData);

      // ✅ 今日の学習リストを必要に応じて作成
      makeTodayListIfNeeded(
        wordList,
        todayWordList,
        senseStatuses,
        userData.learningPlan
      );

      // ✅ フラグをリセット
      if (settings.review === true) {
        updateLocalStorageObject("LearnSettings", INITIAL_LEARN_SETTINGS);
      }
    } else {
      console.warn("⚠️ データが見つからないか、読み込みエラーです");
    }
  }, []);

  // 新規作成（本日未学習）なら true を返す
  function makeTodayListIfNeeded(
    wordList: WordWithSenses[],
    todayWordList: WordWithSenses[],
    senseStatuses: SenseStatus[],
    learningPlan: LearningPlan
  ): boolean {
    if (learningPlan.currentChunkIndex !== learningPlan.unlockedChunkIndex)
      return false;

    const dailyWordCount = (() => {
      switch (learningPlan.durationDays) {
        case 3:
          return 100;
        case 5:
          return 50;
        case 9:
          return 25;
        default:
          return 50;
      }
    })();

    const today = getToday();

    const alreadyLearnedToday = todayWordList.some((word) =>
      word.senses.some((sense) => {
        const status = senseStatuses.find(
          (s) => s.senses_id === sense.senses_id
        );
        return status?.learnedDate === today;
      })
    );

    if (alreadyLearnedToday) {
      console.log("✅ 今日の学習リストはすでに作成済み");
      return false;
    }

    // リストを新規作成
    const newWords = wordList.filter((w) =>
      w.senses.some((sense) => {
        const status = senseStatuses.find(
          (s) => s.senses_id === sense.senses_id
        );
        return !status?.learnedDate;
      })
    );

    const overdueReview = wordList.filter((w) =>
      w.senses.some((sense) => {
        const status = senseStatuses.find(
          (s) => s.senses_id === sense.senses_id
        );
        return status?.reviewDate && status.reviewDate < today;
      })
    );

    const todayReview = wordList.filter((w) =>
      w.senses.some((sense) => {
        const status = senseStatuses.find(
          (s) => s.senses_id === sense.senses_id
        );
        return status?.reviewDate === today;
      })
    );

    // 🔍 全ての単語の全sensesがlevel >= 3かどうかをチェック
    const allWordsAboveLevel3 = wordList.every((word) =>
      word.senses.every((sense) => {
        const status = senseStatuses.find(
          (s) => s.senses_id === sense.senses_id
        );
        return status !== undefined && status.level >= 3;
      })
    );

    // 📋 リスト生成
    const rawList = [...newWords, ...overdueReview, ...todayReview];

    // 🔃 並び替え: learnedDate が null のものを先頭にし、次に learnedDate 昇順
    const sortedList = rawList.sort((a, b) => {
      const getEarliestDate = (word: WordWithSenses): string => {
        const dates = word.senses.map((sense) => {
          const status = senseStatuses.find(
            (s) => s.senses_id === sense.senses_id
          );
          return status?.learnedDate || "0000-00-00"; // ★ nullや未学習なら最優先
        });
        return dates.sort()[0]; // 最も早い日付を基準に
      };

      return getEarliestDate(a).localeCompare(getEarliestDate(b));
    });

    const learningList = allWordsAboveLevel3
      ? wordList
      : sortedList.slice(0, dailyWordCount);

    console.log(
      `📊 今日の学習リストを新規生成:\n` +
        `🆕 新規: ${newWords.length} 件\n` +
        `🔁 復習遅れ: ${overdueReview.length} 件\n` +
        `📌 今日の復習: ${todayReview.length} 件`
    );

    setTodayWordList(learningList);
    saveListToLocalStorage("TodayLearningList", learningList);
    saveListToLocalStorage("CurrentLearningList", learningList);

    return true;
  }

  const checkModeUnlock = (
    todayWordList: WordWithSenses[],
    senseStatuses: SenseStatus[],
    learningPlan: LearningPlan
  ): {
    isOutputUnlocked: boolean;
    isTestUnlocked: boolean;
    isLearningCompleted: boolean;
  } => {
    if (learningPlan.currentChunkIndex !== learningPlan.unlockedChunkIndex) {
      return {
        isOutputUnlocked: true,
        isTestUnlocked: true,
        isLearningCompleted: true,
      };
    }
    // 1. todayLearningList の sense_id をすべて抽出
    const todaySenseIds = todayWordList.flatMap((word) =>
      word.senses.map((sense) => sense.senses_id)
    );

    // 2. senseStatuses から todaySenseIds に一致するものだけ抽出
    const todayStatuses = senseStatuses.filter((s) =>
      todaySenseIds.includes(s.senses_id)
    );

    // 3. モード解禁判定
    const today = getToday();

    const isOutputUnlocked =
      todayStatuses.length > 0 &&
      todayStatuses.every(
        (s) =>
          (s.level >= 1 && s.learnedDate < today) ||
          (s.level >= 2 && s.learnedDate === today)
      );

    const isTestUnlocked =
      todayStatuses.length > 0 &&
      todayStatuses.every(
        (s) =>
          (s.level >= 2 && s.learnedDate < today) ||
          (s.level >= 3 && s.learnedDate === today)
      );

    const isLearningCompleted =
      todayStatuses.length > 0 && todayStatuses.every((s) => s.level >= 3);

    return { isOutputUnlocked, isTestUnlocked, isLearningCompleted };
  };

  const { isOutputUnlocked, isTestUnlocked, isLearningCompleted } =
    checkModeUnlock(todayWordList, senseStatuses, userData.learningPlan);

  const goToStudyOrOpenModal = (
    mode: "input" | "output" | "test",
    isUnlocked: boolean,
    isTodayUnlearned: boolean
  ) => {
    updateLocalStorageObject("LearnSettings", { mode });
    if (mode !== "test") {
      if (isUnlocked) {
        saveListToLocalStorage("CurrentLearningList", wordList);
        updateLocalStorageObject("LearnSettings", {
          mode,
          review: true,
        });
        setCurrentList(wordList);
        setIsModalOpen(true);
      } else {
        if (isTodayUnlearned) {
          updateLocalStorageObject("LearnSettings", {
            mode,
            review: false,
          });
          router.push("/ModeSelect/StudyCard");
        } else {
          saveListToLocalStorage("CurrentLearningList", todayWordList);
          updateLocalStorageObject("LearnSettings", {
            mode,
            review: true,
          });
          setCurrentList(todayWordList);
          setIsModalOpen(true);
        }
      }
    } else {
      saveListToLocalStorage("CurrentLearningList", wordList);
      setCurrentList(wordList);
      if (isUnlocked) {
        updateLocalStorageObject("LearnSettings", {
          mode,
          review: true,
        });
        setIsModalOpen(true);
      } else {
        updateLocalStorageObject("LearnSettings", {
          mode,
          review: false,
        });
        router.push("/ModeSelect/StudyCard");
      }
    }
  };

  return (
    <div className="min-h-screen max-w-[100dvw] flex overflow-x-hidden">
      {/* Sidebar: 固定幅 */}
      <div className="md:w-64 flex-shrink-0">
        <Sidebar isFixed={false} toggleButtonColor="text-gray-800" />
      </div>

      {/* Main: 残り全部 */}
      <div className="flex-1 bg-gradient-to-br from-sky-50 via-indigo-100 to-white py-4 px-4">
        <div className="w-full max-w-5xl mx-auto">
          {/* タイトル＆進捗 */}
          <header className="py-4 md:py-8 border-b-2">
            <h1 className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 text-xl is:text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              <span className="font-sans text-2xl md:text-3xl">英単語学習</span>
              <p className="mt-2 md:mt-0 md:ml-10 text-sm md:text-xl text-gray-700 font-bold">
                楽しく、効率よく、 言葉の力を伸ばそう！
              </p>
            </h1>
          </header>

          <LearningPlanInfo learningPlan={userData.learningPlan} />

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              {
                label: "インプット",
                desc: "学習プランに沿って単語を覚えるモード",
                color: "from-indigo-500 to-sky-400",
                onClick: () => {
                  const isTodayUnlearned = makeTodayListIfNeeded(
                    wordList,
                    todayWordList,
                    senseStatuses,
                    userData.learningPlan
                  );
                  goToStudyOrOpenModal(
                    "input",
                    isOutputUnlocked,
                    isTodayUnlearned
                  );
                },
                disabled: false, // 常に有効
              },
              {
                label: "アウトプット",
                desc: "覚えた単語を何度も使ってしっかり定着",
                color: "from-pink-500 to-rose-400",
                onClick: () => {
                  const isTodayUnlearned = makeTodayListIfNeeded(
                    wordList,
                    todayWordList,
                    senseStatuses,
                    userData.learningPlan
                  );
                  goToStudyOrOpenModal(
                    "output",
                    isTestUnlocked,
                    isTodayUnlearned
                  );
                },
                disabled: !isOutputUnlocked, // level 1 未満の単語があれば非活性
              },
              {
                label: "テスト",
                desc: "制限時間内に単語を答える集中チャレンジ",
                color: "from-orange-500 to-yellow-400",
                onClick: () => {
                  goToStudyOrOpenModal("test", isLearningCompleted, false);
                },
                disabled: !isTestUnlocked, // level 2 未満の単語があれば非活性
              },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                disabled={btn.disabled}
                className={`w-full p-6 rounded-2xl shadow-xl transition-transform duration-200
                text-left flex flex-col gap-2 ${
                  btn.disabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : `bg-gradient-to-br ${btn.color} text-white hover:scale-105 hover:shadow-2xl`
                }`}
              >
                <span className="text-xl is:text-2xl font-bold">
                  {btn.label}
                </span>
                <span className="text-xs is:text-base">{btn.desc}</span>
              </button>
            ))}
          </section>

          {/* モード選択の下に冒頭10単語リストを表示 */}
          <div className="bg-white rounded-xl p-2 md:p-6 shadow-md max-h-[70vh] overflow-y-auto space-y-6">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 md:mb-8 text-center mt-2">
              単語リスト
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedWords.map((word) => (
                <div
                  key={word.word_id}
                  className="mx-2 md:mx-0 p-4 space-y-4 border border-gray-200 rounded-xl shadow-sm bg-white"
                >
                  {/* 単語の見出し */}
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-bold text-indigo-700">
                      {word.word}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {word.senses[0]?.pos}
                    </span>
                  </div>

                  {/* 各意味を表示 */}
                  {word.senses.map((sense) => (
                    <div
                      key={sense.senses_id}
                      className="text-xs md:text-base border-l-4 border-indigo-300 pl-4 space-y-2"
                    >
                      <p className="text-red-500 font-bold italic">
                        <span>定義:</span> {sense.en}
                      </p>
                      <p className="text-gray-800 font-bold italic">
                        <span>和訳:</span> {sense.ja}
                      </p>
                      <p className="text-gray-700">📘 {sense.seEn}</p>
                      <p className="text-gray-700">📙 {sense.seJa}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* 切り替えボタン */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-indigo-600 hover:underline focus:outline-none"
              >
                {showAll ? "一部のみ表示する" : "すべて表示する"}
              </button>
            </div>
          </div>
        </div>

        <DeveloperTool />
      </div>
      {isModalOpen && (
        <LearnSettingsModal
          words={currentList}
          statuses={senseStatuses}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
