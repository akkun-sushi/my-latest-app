"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LearningPlan,
  LearnSettings,
  Progress,
  SenseStatus,
  UserData,
  WordWithSenses,
} from "../../../../types/WordSensesList";
import { getNDaysLater, getToday } from "@/app/hooks/dateUtils";
import {
  saveListToLocalStorage,
  updateLocalStorageObject,
} from "@/app/hooks/updateLocalStorage";
import { useUserData } from "@/app/hooks/useUserData";
import confetti from "canvas-confetti";

/**
 * @param words - 今日学習する単語の配列（WordWithSenses型）
 * @param statuses - 各単語・意味に対する学習状況（SenseStatus型）
 * @param userData - ユーザー情報
 * @param settings - 現在の学習モードや復習モード設定
 * @param setStatuses - ステータス更新関数
 * @param setIsFront - フラッシュカードの表裏制御用関数
 * @param isAutoSpeaking - 自動音声再生ON/OFF
 * @param speakWord - 単語を読み上げる関数
 */
export function useAnswerHandler(
  words: WordWithSenses[],
  statuses: SenseStatus[],
  userData: UserData,
  settings: LearnSettings,
  setStatuses: (statuses: SenseStatus[]) => void,
  setIsFront: (val: boolean) => void,
  isAutoSpeaking: boolean,
  speakWord: (text: string) => void
) {
  // ✅ Next.jsのルーター機能
  const router = useRouter();

  const { updateUserData } = useUserData();

  // ✅ 状態管理
  const [index, setIndex] = useState(0); // 現在の単語インデックス
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // 選択肢のうち選ばれたインデックス
  const [buttonPressed, setButtonPressed] = useState<
    "know" | "dontKnow" | null
  >(null); // 押されたボタンの状態

  // ✅ タイマー管理用の参照（useRef：値の保持）
  const [timeLeft, setTimeLeft] = useState(100); // プログレスバー用の残り時間（%）s
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // プログレスバー更新タイマー
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // 自動失点用タイマー

  // ✅ 学習完了の暴発防止
  const isCompletedRef = useRef(false); // 問題が完了したかどうかのフラグ

  // ==============================
  // 🔍 現在の単語・意味・学習状態の取得
  // ==============================

  // @現在の単語を取得（indexが有効な範囲内にある場合のみ）
  const currentWord =
    words.length > 0 && index < words.length ? words[index] : null;

  // @現在の単語の最初の意味を取得（なければnull）
  const currentSense = currentWord?.senses?.[0] ?? null;

  // @現在の意味に対応する学習ステータスをstatusesから探す（なければnull）
  const currentStatus =
    currentWord && currentSense
      ? statuses.find(
          (s) =>
            s.word_id === currentWord.word_id &&
            s.senses_id === currentSense.senses_id
        )
      : null;

  // @現在の意味の習熟レベル（未学習なら0）
  const currentLevel = currentStatus?.level ?? 0;

  // @現在の意味の日本語訳（なければ空文字列）
  const correctJa = currentWord?.senses[0].ja ?? "";

  // @現在の学習モード（input / output / test）
  const mode = settings.mode;

  // @復習モードかどうか（trueなら復習）
  const review = settings.review;

  // ==============================
  // 🎲 選択肢（正解 + 誤答）を生成
  // ==============================

  const options = useChoiceOptions(words, correctJa);

  // ==============================
  // 💾 インデックスの保存（再レンダリング後も同じカードにする）
  // ==============================

  // 初回レンダリング時にlocalStorageからインデックスを復元
  useEffect(() => {
    const saved = localStorage.getItem("CurrentWordIndex");
    const parsed = saved ? parseInt(saved, 10) : 0;
    setIndex(isNaN(parsed) ? 0 : parsed);
  }, []);

  // indexが変わるたびにlocalStorageに保存
  useEffect(() => {
    localStorage.setItem("CurrentWordIndex", index.toString());
  }, [index]);

  // ==============================
  // ⏳ テストモード時：制限時間付きの自動処理
  // ==============================

  useEffect(() => {
    if (mode === "test" || mode === "review") {
      // ⏱ タイマー初期化（1問ごとに）
      setTimeLeft(100); // プログレスバーを100%にリセット
      setButtonPressed(null); // ボタンの状態も初期化

      // 🕒 タイマー設定
      const start = Date.now();
      const duration = 3000; // 制限時間（ミリ秒）

      // ⏳ 進行バー更新（30msごとに）
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setTimeLeft(remaining);
      }, 30);

      // 🧨 時間切れで自動的に「わからない」扱い
      timeoutRef.current = setTimeout(() => {
        handleAnswer("dontKnow");
      }, duration);

      // 🧹 クリーンアップ：indexやcurrentStatusが変わるたびに再設定
      return () => {
        clearInterval(intervalRef.current!);
        clearTimeout(timeoutRef.current!);
      };
    }
  }, [index, currentStatus]);

  // ==============================
  // ⏳ 回答時の総合関数
  // ==============================

  const handleAnswer = (type: "know" | "dontKnow") => {
    // ================================
    // ⛔️ すでに押されていたら処理しない or 状態が不明な場合も無視
    // ================================
    if (buttonPressed !== null || !currentStatus) return;

    // ================================
    // ⏹ タイマー停止 ＋ ボタン押下状態を保存
    // ================================
    clearTimeout(timeoutRef.current!);
    clearInterval(intervalRef.current!);
    setButtonPressed(type);

    // ================================
    // 📝 回答内容を currentStatus.temp に一時保存（1: 正解, 2: 不正解）
    // ================================
    if (type === "know") {
      currentStatus.temp = 1;
    } else if (type === "dontKnow") {
      currentStatus.temp = 2;
    }

    // ================================
    // 📦 現在のstatusを更新してローカルステートに反映
    // ================================
    const updatedStatusList = statuses.map((s) =>
      s.word_id === currentStatus.word_id &&
      s.senses_id === currentStatus.senses_id
        ? currentStatus
        : s
    );

    saveListToLocalStorage("SensesStatusList", updatedStatusList);
    setStatuses(updatedStatusList);

    // ================================
    // ▶️ 次の単語がある場合：一定時間後に遷移
    // ================================
    if (index + 1 < words.length) {
      const delay = calcDelay(mode, type); // ✨ 回答に応じた表示時間の調整

      setTimeout(() => {
        const nextIndex = index + 1;
        setIndex(nextIndex);
        setButtonPressed(null);

        // 🔄 表面/裏面の切替（モードによって異なる）
        if (settings.mode === "input") {
          setIsFront(true); // フラッシュカードの表面に戻す
        } else {
          setSelectedIndex(null); // 選択肢リセット
        }

        // 🔊 自動発音（設定がONのとき）
        const nextWord = words[nextIndex];
        if (isAutoSpeaking && nextWord) {
          speakWord(nextWord.word);
        }
      }, delay);

      // ================================
      // ✅ 最後の単語まで終えた場合の処理
      // ================================
    } else {
      if (isCompletedRef.current) return; // 二重実行防止
      isCompletedRef.current = true;

      const today = getToday();

      // 🎯 今回出題された senses_id 一覧
      const targetSensesIds = words.flatMap((word) =>
        word.senses.map((s) => s.senses_id)
      );

      // 🎯 updatedStatusList から今回の対象ステータスのみ抽出
      const targetStatuses = updatedStatusList.filter((s) =>
        targetSensesIds.includes(s.senses_id)
      );

      // 📊 正答率などを算出
      const { totalCount, correctRatio, percent, isCorrectEnough } =
        calcAccuracy(targetStatuses);

      // ================================
      // 🔁 学習ステータスの最終更新処理
      // ================================
      const finalStatusList = updatedStatusList.map((s) => {
        if (!targetSensesIds.includes(s.senses_id)) return s; // 対象外は変更なし

        const isCorrect = s.temp === 1;
        const newCorrect = s.correct + (isCorrect ? 1 : 0);
        const newMistake = s.mistake + (!isCorrect ? 1 : 0);
        let newLevel = s.level;
        let learnedDate = s.learnedDate;
        let newReviewDate = s.reviewDate;

        // 条件判定
        if (
          (mode === "input" && s.level < 1) ||
          (mode === "output" && s.level < 2) ||
          (mode === "test" && isCorrectEnough && s.level < 3)
        ) {
          newLevel += 1;
          learnedDate = today;
          newReviewDate = calcReviewDate(
            userData.learningPlan,
            mode,
            isCorrect,
            newLevel
          );
        } else if (mode === "review") {
          newLevel = isCorrect
            ? Math.min(10, s.level + 1)
            : Math.max(3, s.level - 1);
          learnedDate = today;
          newReviewDate = calcReviewDate(
            userData.learningPlan,
            mode,
            isCorrect,
            newLevel
          );
        }

        return {
          ...s,
          correct: newCorrect,
          mistake: newMistake,
          ...(!review || mode === "review"
            ? { level: newLevel, reviewDate: newReviewDate, learnedDate }
            : {}),
        };
      });

      // ================================
      // 🧼 最後の処理（進捗保存、状態リセット、モード遷移）
      // ================================
      let progress: Progress;
      let learningPlan: LearningPlan | null = null; // 初期値を明示

      setTimeout(async () => {
        setButtonPressed(null); // ボタン状態リセット

        // 📈 今日の進捗を更新
        progress = addDailyProgress(
          userData.progress,
          today,
          totalCount,
          mode,
          review
        );

        // ステータス保存
        saveListToLocalStorage("SensesStatusList", finalStatusList);
        setStatuses(finalStatusList);

        if (review) {
          updateLocalStorageObject("LearnSettings", { review: false });
        }

        localStorage.removeItem("CurrentWordIndex");

        // 🎉 終了メッセージ（モードによって変える）
        if (mode === "test") {
          if (correctRatio >= 0.7) {
            learningPlan = updatelearningPlan(userData.learningPlan, review);

            setTimeout(() => {
              confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.7 },
              });
            }, 200);

            alert(
              `🎉 学習が完了しました！\n正答率は ${percent}% でした。お見事です！`
            );
          } else {
            alert(
              `💡 学習が完了しました！\n正答率は ${percent}% でした。\nあと少し、次はもっと上手くいきますよ！`
            );
          }
        } else {
          alert("🎉 学習が完了しました！");
        }

        // ✅ Supabase + localStorage に progress / learningPlan を更新
        try {
          await updateUserData(userData.userId, {
            progress,
            ...(learningPlan ? { learningPlan } : {}),
          });
        } catch (e) {
          console.error("❌ 学習データの更新に失敗しました", e);
        }

        // ✅ ページ遷移
        router.push(mode !== "review" ? "/ModeSelect" : "/MainScreen");
      }, 500);
    }
  };

  return {
    index,
    currentWord,
    currentSense,
    currentLevel,
    setIndex,
    buttonPressed,
    handleAnswer,
    getButtonLabels,
    options,
    selectedIndex,
    setSelectedIndex,
    timeLeft,
    getTimeBarColor,
  };
}

// ✅ 習熟度レベルに応じたボタンのラベルを返す
const getButtonLabels = (level: number): { know: string; dontKnow: string } => {
  if (level >= 4) {
    return { know: "常識！", dontKnow: "ど忘れ？" };
  }
  switch (level) {
    case 3:
      return { know: "マスター", dontKnow: "見直そう" };
    case 2:
      return { know: "余裕！", dontKnow: "あやしい" };
    case 1:
      return { know: "覚えた", dontKnow: "もう一度" };
    case 0:
    default:
      return { know: "知ってる", dontKnow: "知らない" };
  }
};

// ✅ 残り時間（%）に応じてプログレスバーの色を返す
const getTimeBarColor = (percent: number) => {
  if (percent > 66) return "bg-green-300/70"; // 残り多い → 緑
  if (percent > 33) return "bg-yellow-300/70"; // 残り中間 → 黄
  return "bg-red-300/70"; // 残り少 → 赤
};

// ✅ 単語リストと正解の日本語訳から選択肢（4択）を生成してランダムに並べる
const useChoiceOptions = (
  words: WordWithSenses[],
  correctJa: string
): { text: string; isCorrect: boolean }[] => {
  // 🔄 配列シャッフル関数（浅いコピー→ランダムソート）
  const shuffle = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  return useMemo(() => {
    if (!correctJa) return [];

    // 全ての日本語訳から、正解を除いた誤答候補を抽出
    const mistakeJa = words
      .flatMap((w) => w.senses.map((s) => s.ja))
      .filter((ja) => ja !== correctJa);

    // 正解＋誤答（3つ）をまとめてシャッフル
    const options = [
      { text: correctJa, isCorrect: true },
      ...shuffle(mistakeJa)
        .slice(0, 3)
        .map((ja) => ({
          text: ja,
          isCorrect: false,
        })),
    ];

    return shuffle(options);
  }, [words, correctJa]);
};

// ✅ モードと回答結果に応じて、次の単語表示までの遅延時間を決定
const calcDelay = (mode: string, type: "know" | "dontKnow") => {
  if (mode === "input") return 300;
  return type === "know" ? 500 : 1000; // 正解なら短く、不正解ならやや長めに
};

// ✅ モードと学習プランに応じて、次回復習日を算出
const calcReviewDate = (
  learningPlan: LearningPlan,
  mode: string,
  isCorrect: boolean,
  level: number
) => {
  if (mode === "review") {
    if (!isCorrect) {
      return getNDaysLater(1); // ❌ 誤答 → 明日
    }

    const spacingDays: Record<number, number> = {
      3: 4,
      4: 7,
      5: 14,
      6: 30,
      7: 60,
      8: 90,
      9: 180,
      10: 365 * 100, // 復習日なし
    };

    const offset = spacingDays[level] ?? 1;
    return getNDaysLater(offset);
  }

  const offsetDays = { 3: 1, 5: 2, 9: 4 }[learningPlan.durationDays] ?? 2;
  return mode === "test" ? getNDaysLater(4) : getNDaysLater(offsetDays);
};

// ✅ tempに基づいて、正答率や合格判定を算出する
const calcAccuracy = (statuses: SenseStatus[]) => {
  const answered = statuses.filter((s) => s.temp === 1 || s.temp === 2);
  const correct = answered.filter((s) => s.temp === 1).length;
  const total = answered.length;
  const ratio = correct / total;

  return {
    totalCount: total,
    correctRatio: ratio,
    percent: (ratio * 100).toFixed(0),
    isCorrectEnough: ratio >= 0.7, // 合格基準：正答率70%以上
  };
};

// ✅ 学習・復習数を ProgressList に反映して保存
const addDailyProgress = (
  progress: Progress,
  date: string,
  totalCount: number,
  mode: string,
  review: boolean
): Progress => {
  const isReview = review || mode === "review";
  const learnDelta = isReview ? 0 : totalCount;
  const reviewDelta = isReview ? totalCount : 0;

  // 既存の値を取り出し（なければ初期値）
  const current = progress[date] ?? { learnCount: 0, reviewCount: 0 };

  // 更新後の Progress を作成（イミュータブルに）
  const updated: Progress = {
    ...progress,
    [date]: {
      learnCount: current.learnCount + learnDelta,
      reviewCount: current.reviewCount + reviewDelta,
    },
  };

  return updated;
};

// ✅ 現在のチャンクを完了扱いにして、次のチャンクを解禁する
const updatelearningPlan = (
  learningPlan: LearningPlan,
  review: boolean
): LearningPlan | null => {
  if (review) return null;
  const today = getToday();
  const current = learningPlan.currentChunkIndex;

  // 🔒 既存のチャンクに対してのみ completeDate を更新
  const updatedChunks = {
    ...learningPlan.chunks,
    [current]: {
      ...learningPlan.chunks[current],
      completeDate: today,
    },
  };

  // 🧠 解禁チャンク数の最大値チェック
  const maxChunkIndex = Object.keys(learningPlan.chunks).length - 1;
  const canUnlockNext = learningPlan.unlockedChunkIndex < maxChunkIndex;

  // 🆕 新しい learningPlan オブジェクト
  const updatedlearningPlan: LearningPlan = {
    ...learningPlan,
    unlockedChunkIndex: canUnlockNext
      ? learningPlan.unlockedChunkIndex + 1
      : learningPlan.unlockedChunkIndex,
    chunks: updatedChunks,
  };

  return updatedlearningPlan;
};
