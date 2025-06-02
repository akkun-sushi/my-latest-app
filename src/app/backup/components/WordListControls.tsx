// // components/WordListControls.tsx
// "use client";

// import React, { useState } from "react";
// import { supabase } from "../../../lib/supabaseClient";
// import { Word } from "../../../types/WordList";

// type Props = {
//   setWords: (words: Word[]) => void;
// };

// export default function WordListControls({ setWords }: Props) {
//   const [selectedLevel, setSelectedLevel] = useState<number>(4);
//   const [storageSize, setStorageSize] = useState<string>("");

//   // 🛠️ すべての単語の level を一律で設定する関数
//   const setAllWordLevels = (newLevel: number) => {
//     const saved = localStorage.getItem("WordList");
//     if (!saved) return;
//     try {
//       const parsed: Word[] = JSON.parse(saved);
//       const updatedWords = parsed.map((word) => ({
//         ...word,
//         level: newLevel,
//       }));
//       setWords(updatedWords);
//       localStorage.setItem("WordList", JSON.stringify(updatedWords));
//     } catch {
//       console.warn("localStorageのデータが壊れています");
//     }
//   };

//   // 🎯 Supabaseから単語データを取得し、localStorageを更新する関数
//   const fetchWords = async () => {
//     const { data: supaWords, error } = await supabase
//       .from("Sample")
//       .select("*");

//     if (error || !supaWords) {
//       console.error("データ取得エラー:", error?.message);
//       return;
//     }

//     const saved = localStorage.getItem("WordList");
//     const localWords = saved ? (JSON.parse(saved) as Word[]) : [];

//     const supaIds = new Set(supaWords.map((w) => w.id));
//     const filteredLocal = localWords.filter((w) => supaIds.has(w.id));

//     const localIds = new Set(filteredLocal.map((w) => w.id));
//     const newWords = supaWords.filter((word) => !localIds.has(word.id));

//     const updatedList = [...filteredLocal, ...newWords];
//     setWords(updatedList);
//     localStorage.setItem("WordList", JSON.stringify(updatedList));
//   };

//   // 使用容量を表示（文字列長から推定）
//   const showLocalStorageSize = () => {
//     const saved = localStorage.getItem("WordList");
//     if (!saved) {
//       setStorageSize("0 KB");
//       return;
//     }
//     const bytes = new Blob([saved]).size;
//     const kb = (bytes / 1024).toFixed(2);
//     const mb = (bytes / 1024 / 1024).toFixed(2);
//     setStorageSize(`${kb} KB (${mb} MB)`);
//   };

//   // WordListをlocalStorageから削除
//   const clearLocalWordList = () => {
//     localStorage.removeItem("WordList");
//     setWords([]);
//     setStorageSize("0 KB");
//   };

//   return (
//     <div>
//       <div className="space-x-2">
//         <button
//           onClick={fetchWords}
//           className="px-4 py-2 bg-blue-600 text-white rounded"
//         >
//           Supabaseと同期
//         </button>
//         <button
//           onClick={showLocalStorageSize}
//           className="px-4 py-2 bg-green-600 text-white rounded"
//         >
//           使用容量を表示
//         </button>
//         <button
//           onClick={clearLocalWordList}
//           className="px-4 py-2 bg-red-600 text-white rounded"
//         >
//           WordListを削除
//         </button>
//       </div>

//       <div className="flex items-center gap-4 my-4">
//         <label className="font-medium">設定するレベル:</label>
//         <select
//           value={selectedLevel}
//           onChange={(e) => setSelectedLevel(Number(e.target.value))}
//           className="border border-gray-300 rounded px-2 py-1"
//         >
//           {[...Array(11)].map((_, i) => (
//             <option key={i + 1} value={i + 1}>
//               レベル{i + 1}
//             </option>
//           ))}
//         </select>

//         <button
//           onClick={() => setAllWordLevels(selectedLevel)}
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//         >
//           すべての単語をレベル{selectedLevel}に設定
//         </button>
//       </div>

//       {storageSize && (
//         <p className="text-sm text-gray-600">使用容量: {storageSize}</p>
//       )}
//     </div>
//   );
// }
