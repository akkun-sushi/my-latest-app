import {
  LearnSettings,
  SenseStatus,
  UserData,
  WordWithSenses,
} from "../../../types/WordSensesList";

// ✅ 単語リストをチャンク分割（100語ずつ）
const chunkWordList = (
  list: WordWithSenses[],
  chunkSize: number = 100
): WordWithSenses[][] => {
  const result: WordWithSenses[][] = [];
  for (let i = 0; i < list.length; i += chunkSize) {
    result.push(list.slice(i, i + chunkSize));
  }
  return result;
};

// ✅ ステータスリストをチャンク分割された単語リストに対応させてグループ化
const chunkStatusList = (
  statuses: SenseStatus[],
  chunkedWords: WordWithSenses[][]
): SenseStatus[][] => {
  return chunkedWords.map((chunk) => {
    const wordIds = chunk.map((w) => w.word_id);
    return statuses.filter((status) => wordIds.includes(status.word_id));
  });
};

// ✅ ローカルストレージから必要なデータを一括取得・加工
export const fetchFromLocalStorage = (): {
  words: WordWithSenses[] | null;
  statuses: SenseStatus[] | null;
  chunkedWords: WordWithSenses[][] | null;
  chunkedStatuses: SenseStatus[][] | null;
  currentChunkWords: WordWithSenses[] | null;
  currentChunkStatuses: SenseStatus[] | null;
  todayLearningList: WordWithSenses[] | null;
  currentLearningList: WordWithSenses[] | null;
  learnSettings: LearnSettings | null;
  userData: UserData | null;
} => {
  try {
    // 🔹 各種データをlocalStorageから読み取り
    const wordListString = localStorage.getItem("WordWithSensesList");
    const statusListString = localStorage.getItem("SensesStatusList");
    const todayLearningListString = localStorage.getItem("TodayLearningList");
    const currentLearningListString = localStorage.getItem(
      "CurrentLearningList"
    );
    const learnSettingsString = localStorage.getItem("LearnSettings");
    const userDataString = localStorage.getItem("UserData");

    // 🔹 パースして使用可能なデータに変換（存在しなければ null）
    const words: WordWithSenses[] | null = wordListString
      ? JSON.parse(wordListString)
      : null;

    const statuses: SenseStatus[] | null = statusListString
      ? JSON.parse(statusListString)
      : null;

    const todayLearningList: WordWithSenses[] | null = todayLearningListString
      ? JSON.parse(todayLearningListString)
      : null;

    const currentLearningList: WordWithSenses[] | null =
      currentLearningListString ? JSON.parse(currentLearningListString) : null;

    const learnSettings: LearnSettings | null = learnSettingsString
      ? JSON.parse(learnSettingsString)
      : null;

    const userData: UserData | null = userDataString
      ? JSON.parse(userDataString)
      : null;

    // 🔹 単語とステータスをチャンクごとに分割
    const chunkedWords = words ? chunkWordList(words, 100) : null;
    const chunkedStatuses =
      statuses && chunkedWords ? chunkStatusList(statuses, chunkedWords) : null;

    // 🔹 現在のチャンクに対応するデータを抽出
    let currentChunkWords: WordWithSenses[] | null = null;
    let currentChunkStatuses: SenseStatus[] | null = null;

    if (userData && chunkedWords && chunkedStatuses) {
      const index = userData.learningPlan.currentChunkIndex;

      if (index >= 0 && index < chunkedWords.length) {
        currentChunkWords = chunkedWords[index];
        currentChunkStatuses = chunkedStatuses[index];
      }
    }

    // ✅ 正常時の戻り値
    return {
      words,
      statuses,
      chunkedWords,
      chunkedStatuses,
      currentChunkWords,
      currentChunkStatuses,
      todayLearningList,
      currentLearningList,
      learnSettings,
      userData,
    };
  } catch (error) {
    console.error("❌ ローカルストレージの読み込みに失敗しました:", error);

    // ❌ 失敗時の初期化された戻り値
    return {
      words: null,
      statuses: null,
      chunkedWords: null,
      chunkedStatuses: null,
      currentChunkWords: null,
      currentChunkStatuses: null,
      todayLearningList: null,
      currentLearningList: null,
      learnSettings: null,
      userData: null,
    };
  }
};
