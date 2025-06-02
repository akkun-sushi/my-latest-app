// "use client";

// import { useEffect } from "react";

// interface Word {
//   en: string;
//   ja: string;
//   seEn: string;
//   seJa: string;
// }

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   words: Word[];
//   downloaded: boolean;
//   nextReviewDate: string;
//   progress: number; // 0.6など
// }

// export default function WordModal({
//   isOpen,
//   onClose,
//   words,
//   downloaded,
//   nextReviewDate,
//   progress,
// }: Props) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [onClose]);

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-2 md:px-8 py-6 md:py-12 overflow-y-auto"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white text-black rounded-2xl w-full max-w-4xl shadow-2xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* ✖️ 閉じるボタン */}
//         <button
//           onClick={onClose}
//           className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-500 hover:text-gray-800 text-xl"
//         >
//           ✕
//         </button>

//         {/* 📚 左側：単語一覧 */}
//         <div className="flex flex-col">
//           <h3 className="text-base md:text-lg font-semibold mb-4 text-indigo-600">
//             サンプル
//           </h3>
//           <div className="flex-1 space-y-4 overflow-y-auto max-h-[50vh] md:max-h-[60vh] pr-1 md:pr-2">
//             {words.map((word, idx) => (
//               <div
//                 key={idx}
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

//         {/* 📈 右側：学習情報 */}
//         <div className="flex flex-col justify-between">
//           <div className="space-y-4">
//             {downloaded ? (
//               <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl transition text-sm md:text-base">
//                 続きから学習する
//               </button>
//             ) : (
//               <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl transition text-sm md:text-base">
//                 ダウンロード
//               </button>
//             )}
//             <p className="text-xs md:text-sm text-gray-600">
//               📅 次回復習日：{nextReviewDate}
//             </p>
//           </div>

//           <div className="mt-6">
//             <p className="text-xs md:text-sm text-gray-600 mb-1">
//               進捗：{Math.round(progress * 100)}%
//             </p>
//             <div className="w-full h-3 md:h-4 bg-gray-300 rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-indigo-500 transition-all duration-500"
//                 style={{ width: `${progress * 100}%` }}
//               ></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
