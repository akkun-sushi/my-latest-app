// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "../../lib/supabaseClient";
// import { LearnSettings, Word } from "../../types/WordList";
// import { useRouter } from "next/navigation";

// const LEVEL_RANGES = [
//   { label: "初級（習熟度1〜3）", range: [1, 2, 3] },
//   { label: "中級（習熟度4〜6）", range: [4, 5, 6] },
//   { label: "上級（習熟度7〜8）", range: [7, 8] },
//   { label: "マスター（習熟度9〜10）", range: [9, 10] },
//   { label: "神（習熟度11）", range: [11] },
// ];

// export default function Home() {
//  const [selectedLevel, setSelectedLevel] = useState<number>(4);

//   // 🛠️ すべての単語の level を一律で設定する関数
//   const setAllWordLevels = (newLevel: number) => {
//     const updatedWords = localWords.map((word) => ({
//       ...word,
//       level: newLevel,
//     }));

//     setLocalWords(updatedWords);
//     localStorage.setItem("WordList", JSON.stringify(updatedWords));
//   };

//   // Next.js のルーターを使用
//   const router = useRouter();

//   // ローカルステートの定義
//   const [localWords, setLocalWords] = useState<Word[]>([]); // 単語リスト（localStorage用）
//   const [showSettings, setShowSettings] = useState(false); // 設定モーダル表示
//   const [selectedMinLevel, setSelectedMinLevel] = useState<number | null>(null);

//   const [mode, setMode] = useState<
//     "word-en-ja" | "word-ja-en" | "sentence-en-ja" | "sentence-ja-en"
//   >("word-en-ja");
//   const [reviewMode, setReviewMode] = useState(false); // 復習モードの選択
//   const [testMode, setTestMode] = useState(false); // テストモードのオン/オフ
//   const [order, setOrder] = useState<"default" | "alphabetical" | "random">(
//     "default"
//   ); // 単語の並び順
//   const [levels, setLevels] = useState<{ [key: number]: boolean }>({
//     1: true,
//     2: true,
//     3: true,
//     4: true,
//     5: true,
//     6: true,
//     7: true,
//     8: true,
//     9: true,
//     10: true,
//     11: true,
//   }); // ✅ 習熟度ごとの有効状態を管理

//   // localStorageの使用量
//   const [storageSize, setStorageSize] = useState<string>("");

//   // 🎯 初回マウント時：localStorageから単語データを読み込む
//   useEffect(() => {
//     const saved = localStorage.getItem("WordList");
//     if (saved) {
//       try {
//         const parsed: Word[] = JSON.parse(saved);
//         setLocalWords(parsed);
//       } catch {
//         console.warn("localStorageのデータが壊れています");
//         localStorage.removeItem("WordList");
//       }
//     }
//   }, []);

//   // 🎯 Supabaseから単語データを取得し、localStorageを更新する関数
//   const fetchWords = async () => {
//     const { data: supaWords, error } = await supabase
//       .from("WordList")
//       .select("*");

//     if (error || !supaWords) {
//       console.error("データ取得エラー:", error?.message);
//       return;
//     }

//     // ① Supabaseに存在しない local の単語を除外
//     const supaIds = new Set(supaWords.map((w) => w.id));
//     const filteredLocal = localWords.filter((w) => supaIds.has(w.id));

//     // ② Supabaseの新規単語を追加（localに存在しないもの）
//     const localIds = new Set(filteredLocal.map((w) => w.id));
//     const newWords = supaWords.filter((word) => !localIds.has(word.id));

//     // ③ マージして更新
//     const updatedList = [...filteredLocal, ...newWords];
//     setLocalWords(updatedList);
//     localStorage.setItem("WordList", JSON.stringify(updatedList));
//   };

//   // 🎯 指定レベル内にすべての単語が収まっているかを判定
//   const canAccess = (
//     minLevel: number,
//     words: Word[],
//     maxLevel?: number // ← オプション引数
//   ): boolean => {
//     if (!words || words.length === 0) return false;
//     return words.every((w) => {
//       if (maxLevel !== undefined) {
//         return w.level >= minLevel && w.level <= maxLevel;
//       }
//       return w.level >= minLevel;
//     });
//   };

//   // 🎯 学習を開始するときの処理
//   const handleStart = () => {
//     try {
//       // ✅ 現在の設定をオブジェクトにまとめる
//       const settings: LearnSettings = {
//         mode,
//         reviewMode,
//         testMode,
//         order,
//         levels,
//       };

//       // ✅ 有効なレベル一覧を取得（例: [1, 3]）
//       const allowedLevels = Object.entries(levels)
//         .filter(([_, val]) => val)
//         .map(([key]) => Number(key));

//       // ✅ 有効レベルに該当する単語だけを抽出
//       const matchingWords = localWords.filter((word) =>
//         allowedLevels.includes(word.level)
//       );

//       // ✅ 該当する単語がなければアラート
//       if (matchingWords.length === 0) {
//         alert("選択されたレベルに該当する単語が見つかりません。");
//         return;
//       }

//       // ✅ 学習モードと単語レベルの整合性チェック
//       const hasHighLevel = matchingWords.some((w) => {
//         if (mode === "word-en-ja") return w.level >= 4;
//         if (mode === "word-ja-en") return w.level >= 7;
//         if (mode === "sentence-en-ja") return w.level >= 9;
//         if (mode === "sentence-ja-en") return w.level >= 11;
//         return false;
//       });

//       if (hasHighLevel && !reviewMode && !testMode) {
//         alert(
//           "このモードでは復習モードまたはテストモードのいずれかを有効にする必要があります。"
//         );
//         return;
//       }

//       // ✅ 設定をlocalStorageに保存
//       localStorage.setItem("LearnSettings", JSON.stringify(settings));

//       // ✅ モーダルを閉じる
//       setShowSettings(false);

//       // ✅ 学習ページへ遷移
//       router.push("/Learn");
//     } catch (err) {
//       console.error("設定の保存に失敗しました:", err);
//       alert("設定の保存に失敗しました。もう一度お試しください。");
//     }
//   };

//   // ユーザーが設定を開いた瞬間に実行（たとえばボタンのonClick）
//   const warmUpAudio = () => {
//     const audio = new Audio();
//     audio.src =
//       "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=";
//     audio.volume = 0;
//     audio.play().catch(() => {});
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
//     setLocalWords([]);
//     setStorageSize("0 KB");
//   };

//   const isTestModeAvailable =
//     selectedMinLevel !== null && canAccess(selectedMinLevel, localWords);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-100 to-white py-10 px-4">
//       <div className="max-w-4xl mx-auto">
//         {/* タイトル＆進捗 */}
//         <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-tight drop-shadow">
//               <span className="inline-block align-middle mr-2">📚</span>
//               英単語学習アプリ
//             </h1>
//             <p className="mt-2 text-lg text-gray-500 font-medium">
//               かっこよく、賢く、効率的に語彙力アップしよう！
//             </p>
//           </div>
//           {/* 進捗バー */}
//           <div className="w-full md:w-64 flex flex-col items-center">
//             <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner mb-1">
//               <div
//                 className="bg-gradient-to-r from-indigo-500 to-sky-400 h-4 rounded-full transition-all"
//                 style={{
//                   width: `${(Math.min(localWords.length, 100) / 100) * 100}%`,
//                 }}
//               ></div>
//             </div>
//             <span className="text-sm text-gray-600">
//               現在 {localWords.length} / 100 単語
//             </span>
//           </div>
//         </header>

//         {/* モード選択ボタン */}
//         <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           {/* 各モードボタンをカード風に */}
//           {[
//             {
//               label: "単語（英→日）",
//               desc: "英単語から日本語訳を選ぶ練習モード",
//               color: "from-indigo-500 to-sky-400",
//               available: canAccess(1, localWords),
//               onClick: () => {
//                 setMode("word-en-ja");
//                 setSelectedMinLevel(3);
//                 canAccess(1, localWords) && setShowSettings(true);
//               },
//             },
//             {
//               label: "単語（日→英）",
//               desc: "日本語から英単語を思い出す応用モード",
//               color: "from-pink-500 to-rose-400",
//               available: canAccess(4, localWords),
//               onClick: () => {
//                 setMode("word-ja-en");
//                 setSelectedMinLevel(6);
//                 canAccess(4, localWords) && setShowSettings(true);
//               },
//             },
//             {
//               label: "例文（英→日）",
//               desc: "英文例から日本語訳を考える実践モード",
//               color: "from-emerald-500 to-teal-400",
//               available: canAccess(7, localWords),
//               onClick: () => {
//                 setMode("sentence-en-ja");
//                 setSelectedMinLevel(8);
//                 canAccess(7, localWords) && setShowSettings(true);
//               },
//             },
//             {
//               label: "例文（日→英）",
//               desc: "日本語例文から英訳を練習する上級モード",
//               color: "from-yellow-500 to-orange-400",
//               available: canAccess(9, localWords),
//               onClick: () => {
//                 setMode("sentence-ja-en");
//                 setSelectedMinLevel(10);
//                 canAccess(9, localWords) && setShowSettings(true);
//               },
//             },
//           ].map((btn, i) => (
//             <button
//               key={btn.label}
//               disabled={!btn.available}
//               onClick={btn.onClick}
//               className={`w-full p-6 rounded-2xl shadow-xl transition-transform duration-200
//             text-left flex flex-col gap-2 hover:scale-105
//             ${
//               btn.available
//                 ? `bg-gradient-to-br ${btn.color} text-white hover:shadow-2xl`
//                 : "bg-gray-200 text-gray-400 cursor-not-allowed"
//             }
//           `}
//             >
//               <span className="text-2xl font-bold">{btn.label}</span>
//               <span className="text-base">{btn.desc}</span>
//             </button>
//           ))}
//         </section>

//         {/* 単語リスト */}
//         <section className="bg-white/80 rounded-2xl shadow-lg p-6 mb-8 max-h-[350px] overflow-y-auto">
//           <h2 className="text-lg font-semibold text-indigo-700 mb-4">
//             単語リスト
//           </h2>
//           <ul className="grid md:grid-cols-2 gap-4">
//             {localWords.slice(0, 20).map((word) => (
//               <li
//                 key={word.id}
//                 className="border border-indigo-100 rounded-xl p-3 shadow-sm bg-indigo-50/50 hover:bg-indigo-100 transition"
//               >
//                 <div className="flex justify-between items-center mb-1">
//                   <span className="font-bold text-indigo-600 text-lg">
//                     {word.en}
//                   </span>
//                   <span className="bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded text-xs">
//                     {word.ja}
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-700 italic">{word.seEn}</p>
//                 <p className="text-sm text-gray-500">{word.seJa}</p>
//               </li>
//             ))}
//           </ul>
//           <p className="mt-2 text-right text-xs text-gray-400">
//             ※最新20単語のみ表示
//           </p>
//         </section>

//         {/* モーダル（学習設定） */}
//         {showSettings && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <div className="bg-white p-6 rounded-xl shadow-xl w-[90vw] max-w-md space-y-4">
//               <h2 className="text-xl font-bold">学習設定</h2>

//               {/* ✅ 復習モード */}
//               <div className="flex justify-between items-center">
//                 <span>復習モード（習熟度は上昇しません）</span>
//                 <input
//                   type="checkbox"
//                   checked={reviewMode}
//                   onChange={(e) => setReviewMode(e.target.checked)}
//                   disabled={testMode}
//                 />
//               </div>

//               {/* ✅ テストモード */}
//               {isTestModeAvailable && (
//                 <div className="flex justify-between items-center">
//                   <span>
//                     テストモード（音声なし・順序はランダム・3秒以内に回答）
//                   </span>
//                   <input
//                     type="checkbox"
//                     checked={testMode}
//                     onChange={(e) => {
//                       setTestMode(e.target.checked);
//                       if (e.target.checked) setReviewMode(false); // ✅ テストモードにしたら復習モードは強制OFF
//                       setOrder("random");
//                     }}
//                   />
//                 </div>
//               )}

//               {/* ✅ 並び順設定 */}
//               <div className="flex justify-between items-center">
//                 <span>単語の順序</span>
//                 <select
//                   value={order}
//                   onChange={(e) =>
//                     setOrder(
//                       e.target.value as "default" | "alphabetical" | "random"
//                     )
//                   }
//                   disabled={testMode}
//                   className="border rounded px-2 py-1"
//                 >
//                   <option value="default">デフォルト</option>
//                   <option value="alphabetical">アルファベット順</option>
//                   <option value="random">ランダム</option>
//                 </select>
//               </div>

//               {/* ✅ 習熟度（レベル）選択セクション */}
//               <div className="space-y-4">
//                 {LEVEL_RANGES.map(({ label, range }) => {
//                   const minLevel = Math.min(...range);
//                   const maxLevel = Math.max(...range);

//                   // 🎯 この範囲に単語がすべて収まっているときだけ表示
//                   if (!canAccess(minLevel, localWords, maxLevel)) return null;

//                   return (
//                     <div key={label}>
//                       <span className="block mb-1 font-semibold">{label}</span>
//                       <div className="flex space-x-3">
//                         {range.map((lv) => (
//                           <label
//                             key={lv}
//                             className="flex items-center space-x-1"
//                           >
//                             <input
//                               type="checkbox"
//                               checked={!!levels[lv]}
//                               onChange={() =>
//                                 setLevels((prev) => ({
//                                   ...prev,
//                                   [lv]: !prev[lv],
//                                 }))
//                               }
//                               disabled={testMode || reviewMode}
//                             />
//                             <span>習熟度{lv}</span>
//                           </label>
//                         ))}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* ✅ スタートボタン */}
//               <button
//                 onClick={handleStart}
//                 className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
//               >
//                 スタート
//               </button>
//               {/* ❌ キャンセルボタン */}
//               <button
//                 onClick={() => setShowSettings(false)}
//                 className="w-full mt-2 py-2 px-4 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
//               >
//                 キャンセル
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//       <div>
//         <div className="space-x-2">
//           <button
//             onClick={fetchWords}
//             className="px-4 py-2 bg-blue-600 text-white rounded"
//           >
//             Supabaseと同期
//           </button>
//           <button
//             onClick={showLocalStorageSize}
//             className="px-4 py-2 bg-green-600 text-white rounded"
//           >
//             使用容量を表示
//           </button>
//           <button
//             onClick={clearLocalWordList}
//             className="px-4 py-2 bg-red-600 text-white rounded"
//           >
//             WordListを削除
//           </button>
//         </div>

//         <div className="flex items-center gap-4 my-4">
//           <label className="font-medium">設定するレベル:</label>
//           <select
//             value={selectedLevel}
//             onChange={(e) => setSelectedLevel(Number(e.target.value))}
//             className="border border-gray-300 rounded px-2 py-1"
//           >
//             {[...Array(11)].map((_, i) => (
//               <option key={i + 1} value={i + 1}>
//                 レベル{i + 1}
//               </option>
//             ))}
//           </select>

//           <button
//             onClick={() => setAllWordLevels(selectedLevel)}
//             className="bg-blue-500 text-white px-4 py-2 rounded"
//           >
//             すべての単語をレベル{selectedLevel}に設定
//           </button>
//         </div>

//         {storageSize && (
//           <p className="text-sm text-gray-600">使用容量: {storageSize}</p>
//         )}
//       </div>
//       )
//     </div>
//   );
// }
