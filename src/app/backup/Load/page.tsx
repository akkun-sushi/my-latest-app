// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "../../../../lib/supabaseClient";
// import { Word } from "../../../../types/WordList";
// import { useRouter } from "next/navigation";

// function ListModal({
//   isOpen,
//   onClose,
//   nextReviewDate,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   downloaded: boolean;
//   nextReviewDate: string;
//   progress: number;
// }) {
//   const router = useRouter();
//   const [words, setWords] = useState<Word[]>([]);

//   useEffect(() => {
//     const fetchWords = async () => {
//       const cached = localStorage.getItem("WordList");

//       if (cached) {
//         // ✅ localStorage から復元
//         try {
//           const parsed = JSON.parse(cached);
//           setWords(parsed);
//           console.log("📦 localStorage から単語を読み込みました");
//           return;
//         } catch (e) {
//           console.warn("localStorage の JSON パースに失敗しました");
//         }
//       }

//       // ✅ なければ Supabase から取得
//       const { data: supaWords, error } = await supabase
//         .from("WordList")
//         .select("*")
//         .limit(10);

//       if (error || !supaWords) {
//         console.error("データ取得エラー:", error?.message);
//         return;
//       }

//       // ✅ ステートに保存
//       setWords(supaWords);
//     };

//     fetchWords();
//   }, []);

//   useEffect(() => {
//     if (isOpen) {
//       // モーダル表示中はスクロール禁止
//       document.body.style.overflow = "hidden";
//     } else {
//       // モーダル非表示なら復元
//       document.body.style.overflow = "";
//     }

//     // クリーンアップ（モーダルが unmount されたとき）
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isOpen]);

//   // ✅ 学習済みの単語数をカウント
//   const learnedCount = words.filter((word) => word.learnedAt).length;

//   // ✅ プログレスバー（最大100で丸める）
//   const progress = (Math.min(learnedCount, 100) / 100) * 100;

//   const getProgressBarColor = (words: Word[]): string => {
//     if (words.length === 0) return "from-gray-300 to-gray-400";

//     const levels = words.map((w) => w.level);
//     const minLevel = Math.min(...levels);

//     if (minLevel >= 9) return "from-yellow-500 to-orange-400";
//     if (minLevel >= 7) return "from-emerald-500 to-teal-400";
//     if (minLevel >= 4) return "from-pink-500 to-rose-400";

//     return "from-indigo-500 to-sky-400";
//   };

//   const handleStartLearning = () => {
//     if (learnedCount === 0) {
//       localStorage.setItem("WordList", JSON.stringify(words));
//       router.push("/");
//     } else {
//       router.push("/");
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 md:p-8">
//       <div
//         className="bg-white text-black rounded-2xl p-4 md:p-6 w-full max-w-4xl shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-6 relative max-h-[90vh] overflow-y-auto"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* 左：単語一覧 */}
//         <div className="flex flex-col">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-base md:text-lg font-semibold text-indigo-600">
//               初級 100単語リスト
//             </h3>
//             <div
//               className="cursor-pointer p-2 rounded-full hover:bg-gray-200 transition"
//               onClick={onClose}
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth={2}
//                 stroke="currentColor"
//                 className="w-6 h-6 text-gray-600"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </div>
//           </div>

//           <div className="space-y-4 overflow-y-auto max-h-[40vh] md:max-h-[60vh] pr-1 md:pr-2">
//             {words.map((word) => (
//               <div
//                 key={word.id}
//                 className="border rounded-xl p-3 md:p-4 shadow-sm bg-gray-50 text-sm md:text-base"
//               >
//                 <p className="font-bold text-indigo-700">{word.en}</p>
//                 <p className="text-gray-700 mb-1">{word.ja}</p>
//                 <p className="text-gray-600 italic">{word.seEn}</p>
//                 <p className="text-gray-600 italic">{word.seJa}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* 右：学習情報 */}
//         <div className="flex flex-col justify-between">
//           <div className="space-y-6">
//             <button
//               onClick={handleStartLearning}
//               className={`mt-6 w-full ${
//                 learnedCount === 0
//                   ? "bg-blue-500 hover:bg-blue-600"
//                   : "bg-indigo-600 hover:bg-indigo-700"
//               } text-white font-bold py-2 px-4 rounded-xl transition text-md md:text-lg`}
//             >
//               {learnedCount === 0 ? "ダウンロード" : "続きから学習する"}
//             </button>
//           </div>

//           {/* 📅 次回学習日 */}
//           {words.every((w) => w.level === 11) && (
//             <div className="bg-indigo-50 p-3 md:p-4 rounded-xl shadow-inner flex items-center gap-3 mt-4">
//               <span className="text-indigo-600 text-xl md:text-2xl">📅</span>
//               <div className="text-left">
//                 <p className="text-xs md:text-sm text-gray-500">次回復習日</p>
//                 <p className="text-base md:text-lg font-bold text-indigo-700">
//                   {nextReviewDate}
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* 🗣️ 偉人の言葉 */}
//           <div className="hidden md:block mt-4 p-4 md:p-6 rounded-xl bg-gradient-to-br from-gray-100 to-white text-center shadow-md animate-fade-in text-base">
//             <p className="italic mb-2">
//               “Success is not final, failure is not fatal: it is the courage to
//               continue that counts.”
//             </p>
//             <p className="italic text-gray-600">
//               「成功は最終目的ではなく、失敗も致命的ではない。大切なのは続ける勇気だ」
//               ― Winston Churchill
//             </p>
//           </div>

//           {/* 📊 進捗バー */}
//           <div className="mt-6">
//             <p className="text-xs md:text-sm text-gray-600 mb-1">
//               進捗： {learnedCount} / 100 単語
//             </p>
//             <div className="w-full h-3 md:h-4 bg-gray-300 rounded-full overflow-hidden">
//               <div
//                 className={`h-full rounded-full transition-all bg-gradient-to-r ${getProgressBarColor(
//                   words
//                 )}`}
//                 style={{ width: `${progress}%` }}
//               ></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function Home() {
//   const levels = [
//     { name: "初級", words: 100, progress: 0.6 },
//     { name: "中級", words: 100, progress: 0.35 },
//     { name: "上級", words: 100, progress: 0.1 },
//   ];

//   const daysStudied = 45;
//   const streak = 12;
//   const [calendar, setCalendar] = useState<
//     { date: number; studied: boolean }[]
//   >([]);
//   const [showModal, setShowModal] = useState(false);
//   const [downloaded, setDownloaded] = useState(false);

//   useEffect(() => {
//     const today = new Date();
//     const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//     const days = [];
//     for (let d = 1; d <= end.getDate(); d++) {
//       const studied = [1, 2, 4, 5, 7, 10, 13, 18, 22, 24, 27].includes(d);
//       days.push({ date: d, studied });
//     }
//     setCalendar(days);
//   }, []);

//   const CircleChart = () => {
//     const learned = 180;
//     const total = 300;
//     const percentage = learned / total;
//     const radius = 60;
//     const circumference = 2 * Math.PI * radius;
//     const offset = circumference * (1 - percentage);

//     return (
//       <svg width="150" height="150" className="mx-auto">
//         <circle
//           cx="75"
//           cy="75"
//           r={radius}
//           fill="none"
//           stroke="#4b5563"
//           strokeWidth="15"
//         />
//         <circle
//           cx="75"
//           cy="75"
//           r={radius}
//           fill="none"
//           stroke="#6366f1"
//           strokeWidth="15"
//           strokeDasharray={circumference}
//           strokeDashoffset={offset}
//           strokeLinecap="round"
//           transform="rotate(-90 75 75)"
//         />
//         <text
//           x="50%"
//           y="50%"
//           dominantBaseline="middle"
//           textAnchor="middle"
//           className="text-white text-xl"
//         >
//           {Math.round(percentage * 100)}%
//         </text>
//       </svg>
//     );
//   };

//   return (
//     <main className="min-h-screen bg-gray-950 text-white p-6 flex flex-col items-center relative">
//       <h1 className="text-4xl font-bold mb-10">英語学習サイト</h1>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mb-10">
//         {levels.map((level) => (
//           <div
//             key={level.name}
//             onClick={() => level.name === "初級" && setShowModal(true)}
//             className="bg-gray-900 cursor-pointer rounded-2xl shadow-xl p-6 flex flex-col justify-between hover:scale-105 transition-transform duration-300"
//           >
//             <div className="mb-4">
//               <h2 className="text-2xl font-semibold mb-2">
//                 {level.name} {level.words}単語
//               </h2>
//               <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-indigo-500 transition-all duration-500"
//                   style={{ width: `${level.progress * 100}%` }}
//                 ></div>
//               </div>
//               <p className="text-sm text-gray-300 mt-2">
//                 達成率：{Math.round(level.progress * 100)}%
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl">
//         <div className="bg-gray-900 rounded-2xl shadow-xl p-6">
//           <h2 className="text-2xl font-semibold mb-4">📊 学習統計</h2>
//           <p className="mb-2">📅 勉強日数：{daysStudied}日</p>
//           <p className="mb-6">🔥 継続記録：{streak}日連続</p>
//           <div className="w-full h-64 flex items-center justify-center">
//             <CircleChart />
//           </div>
//         </div>

//         <div className="bg-gray-900 rounded-2xl shadow-xl p-6">
//           <h2 className="text-2xl font-semibold mb-4">📆 学習カレンダー</h2>
//           <div className="grid grid-cols-7 gap-2 text-center text-sm">
//             {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
//               <div key={day} className="font-semibold text-indigo-400">
//                 {day}
//               </div>
//             ))}
//             {calendar.map((day) => (
//               <div
//                 key={day.date}
//                 className={`h-10 w-10 flex items-center justify-center rounded-full ${
//                   day.studied ? "bg-indigo-500 text-white" : "text-gray-400"
//                 }`}
//               >
//                 {day.studied ? "🌸" : day.date}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ←← ② モーダル呼び出し（統合されたやつ） */}
//       <ListModal
//         isOpen={showModal}
//         onClose={() => setShowModal(false)}
//         downloaded={downloaded}
//         nextReviewDate={"2025-06-05"}
//         progress={0.6}
//       />
//     </main>
//   );
// }
