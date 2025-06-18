import { supabase } from "../../../lib/supabaseClient";
import {
  WordWithSenses,
  Sense,
  SenseStatus,
} from "../../../types/WordSensesList";
import { fetchFromLocalStorage } from "./fetchFromLocalStorage";
import { saveListToLocalStorage } from "./updateLocalStorage";

// SupabaseRow定義（省略可能）
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

/**
 * 📦 Supabaseからデータを取得し、WordListとStatusListを上書き・マージする
 */
export const refreshWordListFromSupabase = async () => {
  const { statuses: prevStatusList, userData } = fetchFromLocalStorage();

  if (!userData) return;

  const tag = userData.tag;

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

  if (error || !data) {
    console.error("❌ Supabase fetch error:", error);
    return;
  }

  // 🔁 Mapに変換して整形
  const wordMap = new Map<number, { word: string; senses: Sense[] }>();

  data.forEach((sense: SupabaseSenseRow) => {
    const wordEntry = Array.isArray(sense.WordList)
      ? sense.WordList[0]
      : sense.WordList;
    if (!wordEntry) return;

    const wordId = wordEntry.id;
    if (!wordMap.has(wordId)) {
      wordMap.set(wordId, {
        word: wordEntry.word,
        senses: [],
      });
    }

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

  // ✅ 新しいWordList作成
  const updatedWordList: WordWithSenses[] = Array.from(wordMap.entries()).map(
    ([word_id, { word, senses }]) => ({
      word_id,
      word,
      senses,
    })
  );

  // ✅ 新しいstatusを作成（まだ存在しないsenses_idに対してのみ）
  const prevStatusMap = new Map<number, SenseStatus>(
    prevStatusList?.map((s) => [s.senses_id, s]) ?? []
  );

  const newStatuses: SenseStatus[] = [];
  updatedWordList.forEach(({ word_id, senses }) => {
    senses.forEach((sense) => {
      if (!prevStatusMap.has(sense.senses_id)) {
        newStatuses.push({
          word_id,
          senses_id: sense.senses_id,
          level: 0,
          learnedDate: "",
          reviewDate: "",
          correct: 0,
          mistake: 0,
          temp: 0,
        });
      }
    });
  });

  const updatedStatusList: SenseStatus[] = [
    ...(prevStatusList ?? []),
    ...newStatuses,
  ];

  // 💾 保存
  saveListToLocalStorage("WordWithSensesList", updatedWordList);
  saveListToLocalStorage("SensesStatusList", updatedStatusList);

  // 💬 ログ出力（追加の有無をチェック）
  if (newStatuses.length === 0) {
    console.log("ℹ️ 追加された新しい単語はありませんでした。");
  } else {
    console.log(`✅ ${newStatuses.length} 件の新しい単語が追加されました。`);
  }
};
