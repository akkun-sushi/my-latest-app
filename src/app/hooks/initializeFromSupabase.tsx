/**
 * ✅ 全体の役割
 *
 * 1. ローカルストレージをクリア
 * 2. Supabase から英単語データを取得
 * 3. ローカルストレージの各キーを初期化
 * 4. データを加工・保存（単語リスト / ステータス / 学習目標）
 *
 * この関数は、タグ指定されたデータ群を用いて、
 * アプリのローカル学習環境を一から再構築する目的で使用される。
 *
 * データがアルファベット順に整理されている点に注意！
 */

"use client";

type SupabaseSenseRow = {
  id: number;
  pos: string;
  en: string;
  ja: string;
  se_en: string;
  se_ja: string;
  tags: string;
  WordList: {
    id: number;
    word: string;
  }[];
};

import { supabase } from "../../../lib/supabaseClient";
import {
  INITIAL_LEARN_SETTINGS,
  INITIAL_USER_DATA,
  LearningPlan,
  LearnSettings,
  Sense,
  SenseStatus,
  UserData,
  WordWithSenses,
} from "../../../types/WordSensesList";
import {
  saveListToLocalStorage,
  updateLocalStorageObject,
} from "./updateLocalStorage";

/**
 * @param tag - 検索対象のタグ
 */
export const initializeFromSupabase = (tag: string) => {
  (async () => {
    // 🧹 古いデータを完全削除し、空の初期値を設定
    clearLocalStorage();
    initializeLocalStorage();

    // 📡 SupabaseからSensesList + WordListのJOINデータを取得
    const { data, error } = await supabase
      .from("SensesList")
      .select(
        `
      id,
      word_id,
      pos,
      en,
      ja,
      se_en,
      se_ja,
      tags,
      WordList (
        id,
        word
      )
    `
      )
      .like("tags", `%${tag}%`);

    if (error) {
      console.error("❌ Supabase fetch error:", error);
      return;
    }

    if (!data) {
      console.warn("⚠️ データが null または空です");
      return;
    }

    // 📦 WordList単位で senses をグループ化（Mapを使用）
    const wordMap = new Map<number, { word: string; senses: Sense[] }>();

    data.forEach((sense: SupabaseSenseRow) => {
      const rawWordList = sense.WordList;
      const wordEntry = Array.isArray(rawWordList)
        ? rawWordList[0]
        : rawWordList;

      if (!wordEntry) {
        console.warn("❌ WordList が見つかりません", sense);
        return;
      }

      const wordId = wordEntry.id;
      const word = wordEntry.word;

      if (!wordMap.has(wordId)) {
        wordMap.set(wordId, {
          word,
          senses: [],
        });
      }

      // 各senseを該当単語に追加
      wordMap.get(wordId)!.senses.push({
        senses_id: sense.id,
        pos: sense.pos,
        en: sense.en,
        ja: sense.ja,
        seEn: sense.se_en,
        seJa: sense.se_ja,
        tags: sense.tags,
      });
    });

    // ✅ 単語リスト形式に整形・ソート
    const wordListForLocalStorage = Array.from(wordMap.entries()).map(
      ([word_id, { word, senses }]) => ({
        word_id,
        word,
        senses,
      })
    );

    // ✅ 各senseに対する初期ステータスを作成
    const senseStatusList = (data as SupabaseSenseRow[])
      .map((sense) => {
        const rawWordList = sense.WordList;
        const wordEntry = Array.isArray(rawWordList)
          ? rawWordList[0]
          : rawWordList;

        if (!wordEntry || wordEntry.id == null) {
          console.warn("❌ WordList が無効です:", sense);
          return null;
        }

        return {
          word_id: wordEntry.id,
          senses_id: sense.id,
          level: 0,
          learnedDate: null as string | null,
          reviewDate: null as string | null,
          correct: 0,
          mistake: 0,
          temp: 0,
        };
      })
      .filter((s): s is SenseStatus => s !== null); // null を除去

    // 🔁 senses_id -> ステータス のMapを作成（並び替え用）
    const senseStatusMap = new Map<number, (typeof senseStatusList)[0]>();
    senseStatusList.forEach((status) => {
      senseStatusMap.set(status.senses_id, status);
    });

    // 🔁 senseの順にステータスを並び替える
    const sortedSenseStatusList = wordListForLocalStorage.flatMap(
      ({ senses }) =>
        senses.map((sense: Sense) => {
          const status = senseStatusMap.get(sense.senses_id);
          if (!status) {
            return {
              word_id: -1, // fallback
              senses_id: sense.senses_id,
              level: 1,
              learnedAt: null,
              remember: 0,
              correct: 0,
              mistake: 0,
              temp: 0,
            };
          }
          return status;
        })
    );

    // 🔢 100単語ごとにチャンク分割したときのチャンク数を計算
    const chunkCount = Math.ceil(wordListForLocalStorage.length / 100);

    // 🎯 チャンク数に応じて Goal（学習計画）を生成
    const initialLearningPlan = generateInitialLearningPlan(chunkCount);

    // 💾 すべてのデータをlocalStorageに保存
    saveListToLocalStorage("WordWithSensesList", wordListForLocalStorage);
    saveListToLocalStorage("SensesStatusList", sortedSenseStatusList);
    updateLocalStorageObject("UserData", {
      learningPlan: initialLearningPlan,
    });

    console.log(
      "✅ データ保存完了:",
      "\n・WordWithSensesList",
      "\n・SensesStatusList",
      "\n・Goal"
    );
  })();
};

/**
 * 🚮 アプリで使用するローカルストレージキーをすべて削除する
 */
const clearLocalStorage = () => {
  const keysToRemove = [
    "WordWithSensesList",
    "SensesStatusList",
    "TodayLearningList",
    "CurrentLearningList",
    "LearnSettings",
    "CurrentWordIndex",
    "UserData",
  ];

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });

  console.log("🟥 このアプリに関するlocalStorageデータをすべて削除しました");
};

/**
 * 🧱 localStorageが未設定のキーに対して初期値を設定する
 */
const initializeLocalStorage = () => {
  const initializedKeys: string[] = [];

  const setIfEmpty = <T,>(key: string, value: T) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(value));
      initializedKeys.push(key);
    }
  };

  // それぞれのキーを初期化（空リストやデフォルト値）
  setIfEmpty<WordWithSenses[]>("WordWithSensesList", []);
  setIfEmpty<SenseStatus[]>("SensesStatusList", []);
  setIfEmpty<WordWithSenses[]>("TodayLearningList", []);
  setIfEmpty<WordWithSenses[]>("CurrentLearningList", []);
  setIfEmpty<LearnSettings>("LearnSettings", INITIAL_LEARN_SETTINGS);
  setIfEmpty<UserData>("UserData", INITIAL_USER_DATA);

  console.log("✅ localStorageはすでに初期化されています");
};

/**
 * 🎯 指定されたチャンク数に応じて初期Goal（学習計画）を作成
 */
const generateInitialLearningPlan = (chunkCount: number): LearningPlan => {
  const chunks: Record<
    number,
    { startDate: string; targetDate: string; completeDate: string }
  > = {};

  for (let i = 0; i < chunkCount; i++) {
    chunks[i] = {
      startDate: "",
      targetDate: "",
      completeDate: "",
    };
  }

  return {
    currentChunkIndex: 0,
    unlockedChunkIndex: 0,
    durationDays: 5,
    chunks,
  };
};
