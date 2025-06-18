"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import { refreshWordListFromSupabase } from "@/app/hooks/refreshWordListFromSupabase";
import { WordWithSenses } from "../../../../types/WordSensesList";

import { fetchFromLocalStorage } from "@/app/hooks/fetchFromLocalStorage";
import { downloadCSV, generateCSV } from "@/app/hooks/exportToCSV";

export default function Settings() {
  const [isUpdated, setIsUpdated] = useState(false);
  const [chunkedWords, setChunkedWords] = useState<WordWithSenses[][]>([]);
  const [selectedChunks, setSelectedChunks] = useState<number[]>([]);
  const [isChunkMenuOpen, setIsChunkMenuOpen] = useState(false);
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>([]);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isOptionMenuOpen, setIsOptionMenuOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<
    "デフォルト" | "アルファベット順" | "ランダム"
  >("デフォルト");
  const [addRowNumber, setAddRowNumber] = useState(false);
  const [preview, setPreview] = useState<string[] | null>(null);

  useEffect(() => {
    const { chunkedWords } = fetchFromLocalStorage();
    if (!chunkedWords) return;
    setChunkedWords(chunkedWords);
  }, []);

  const handleUpdateList = async () => {
    setIsUpdated(true);
    await refreshWordListFromSupabase();
    setTimeout(() => setIsUpdated(false), 500);
  };

  const toggleChunk = (index: number) => {
    setSelectedChunks((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleHeader = (header: string) => {
    setSelectedHeaders((prev) =>
      prev.includes(header)
        ? prev.filter((h) => h !== header)
        : [...prev, header]
    );
  };

  const sortWords = (
    words: WordWithSenses[],
    order: "デフォルト" | "アルファベット順" | "ランダム"
  ): WordWithSenses[] => {
    if (order === "アルファベット順") {
      return [...words].sort((a, b) => a.word.localeCompare(b.word));
    }
    if (order === "ランダム") {
      return [...words].sort(() => Math.random() - 0.5);
    }
    return words; // デフォルト
  };

  const handlePreview = () => {
    let selectedWords = chunkedWords
      .filter((_, idx) => selectedChunks.includes(idx))
      .flat();

    selectedWords = sortWords(selectedWords, selectedOrder); // 🔸 並び替え追加

    const { previewRows } = generateCSV(selectedWords, selectedHeaders, {
      addRowNumber,
    });

    setPreview(previewRows);
  };
  
  const handleExport = () => {
    let selectedWords = chunkedWords
      .filter((_, idx) => selectedChunks.includes(idx))
      .flat();

    selectedWords = sortWords(selectedWords, selectedOrder); // 🔸 並び替え追加

    const { csvContent } = generateCSV(selectedWords, selectedHeaders, {
      addRowNumber,
    });

    downloadCSV(csvContent, "word_list.csv");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-white">
      <Sidebar isFixed={false} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">
              設定画面
            </h1>
            <span className="text-sm text-white/70">
              学習リストや表示設定の管理
            </span>
          </header>

          {/* 更新セクション */}
          <section className="bg-slate-800 rounded-xl p-6 space-y-4 shadow-md">
            <h2 className="text-xl font-semibold">📥 リストの更新</h2>
            <p className="text-sm im:text-base text-white/80">
              現在学習中の単語リストを最新の内容に反映します。
            </p>
            <button
              onClick={handleUpdateList}
              className={`px-5 py-2 rounded-lg font-semibold transition ${
                isUpdated
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isUpdated ? "✅ 更新完了！" : "リストを更新"}
            </button>
          </section>

          {/* ⬇️ 出力 */}
          <section className="bg-slate-800 rounded-xl p-6 space-y-4 shadow-md">
            <h2 className="text-xl font-semibold">📤 CSV出力</h2>
            <p className="text-sm im:text-base text-white/80">
              出力したいチャンクと項目を選んでから、CSVをダウンロードできます。
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* チャンク選択ボタン */}
              <div className="relative">
                {/* トグルボタン */}
                <button
                  onClick={() => setIsChunkMenuOpen((prev) => !prev)}
                  className={`w-52 px-4 py-2 rounded-lg font-semibold transition
                    ${
                      selectedChunks.length > 0
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-indigo-500 hover:bg-indigo-600"
                    }
                    text-white
                  `}
                >
                  {selectedChunks.length > 0
                    ? `チャンクを選択済み (${selectedChunks.length})`
                    : "チャンクを選ぶ"}
                </button>

                {/* トグルで開く選択リスト */}
                {isChunkMenuOpen && (
                  <div className="md:absolute md:z-10 mt-2 w-64 bg-slate-700 border border-slate-500 rounded-lg shadow-lg p-4 space-y-2">
                    {chunkedWords.map((_, idx) => {
                      const chunkStart = idx * 100 + 1;
                      const chunkEnd = (idx + 1) * 100;
                      const label = `チャンク${
                        idx + 1
                      }：${chunkStart}〜${chunkEnd}単語`;
                      const isSelected = selectedChunks.includes(idx);

                      return (
                        <label
                          key={idx}
                          className="flex items-center gap-2 text-white cursor-pointer hover:text-yellow-300"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleChunk(idx)}
                          />
                          {label}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ヘッダー選択ボタン + トグルメニュー */}
              <div className="relative">
                <button
                  onClick={() => setIsHeaderMenuOpen((prev) => !prev)}
                  className={`w-52 px-4 py-2 rounded-lg font-semibold transition
                    ${
                      selectedHeaders.length > 0
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-indigo-500 hover:bg-indigo-600"
                    }
                    text-white
                  `}
                >
                  {selectedHeaders.length > 0
                    ? `項目を選択済み (${selectedHeaders.length})`
                    : "項目を選ぶ"}
                </button>

                {isHeaderMenuOpen && (
                  <div className="md:absolute md:z-10 mt-2 w-64 bg-slate-700 border border-slate-500 rounded-lg shadow-lg p-4 space-y-2">
                    {[
                      "単語",
                      "品詞",
                      "英語定義",
                      "日本語訳",
                      "例文(英語)",
                      "例文(日本語)",
                    ].map((header) => (
                      <label
                        key={header}
                        className="flex items-center gap-2 text-white cursor-pointer hover:text-yellow-300"
                      >
                        <input
                          type="checkbox"
                          checked={selectedHeaders.includes(header)}
                          onChange={() => toggleHeader(header)}
                        />
                        {header}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* その他オプションボタン + トグルメニュー */}
              <div className="relative">
                <button
                  onClick={() => setIsOptionMenuOpen((prev) => !prev)}
                  className="w-52 px-4 py-2 rounded-lg font-semibold transition bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  その他
                </button>

                {isOptionMenuOpen && (
                  <div className="md:absolute md:z-10 mt-2 w-64 bg-slate-700 border border-slate-500 rounded-lg shadow-lg p-4 space-y-4 text-white text-sm">
                    {/* 並び順オプション */}
                    <div>
                      <p className="font-semibold mb-1">並び順</p>
                      {["デフォルト", "アルファベット順", "ランダム"].map(
                        (option) => (
                          <label
                            key={option}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="radio"
                              name="order"
                              value={option}
                              checked={selectedOrder === option}
                              onChange={() =>
                                setSelectedOrder(
                                  option as
                                    | "デフォルト"
                                    | "アルファベット順"
                                    | "ランダム"
                                )
                              }
                            />
                            {option}
                          </label>
                        )
                      )}
                    </div>

                    {/* 番号付加オプション */}
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={addRowNumber}
                          onChange={() => setAddRowNumber((prev) => !prev)}
                        />
                        一列目に番号を付ける
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* プレビューボタン */}
              <button
                onClick={handlePreview}
                disabled={
                  selectedChunks.length === 0 || selectedHeaders.length === 0
                }
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedChunks.length === 0 || selectedHeaders.length === 0
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600 text-black"
                }`}
              >
                プレビューを表示
              </button>
            </div>

            {preview && (
              <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl max-h-[80vh] overflow-y-auto bg-white text-gray-900 p-6 rounded-xl shadow-2xl border border-gray-300">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                  <h3 className="text-base mb-4 im:mb-0 im:text-lg font-bold">
                    🔍 出力プレビュー（先頭3行）
                  </h3>
                  <button
                    onClick={() => setPreview(null)}
                    className="text-red-600 font-semibold hover:underline"
                  >
                    閉じる
                  </button>
                </div>

                {/* CSVプレビュー（表形式） */}
                <div className="overflow-auto max-h-[300px]">
                  <table className="min-w-full text-sm table-auto border border-gray-300">
                    <thead className="bg-gray-100 font-bold">
                      <tr>
                        {preview[0].split(",").map((col, idx) => (
                          <th
                            key={idx}
                            className="border px-2 py-1 text-left whitespace-nowrap"
                          >
                            {col.replace(/^"|"$/g, "")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(1).map((line, i) => (
                        <tr key={i}>
                          {line.split(",").map((cell, j) => (
                            <td
                              key={j}
                              className="border px-2 py-1 whitespace-nowrap"
                            >
                              {cell.replace(/^"|"$/g, "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 保存ボタン */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleExport}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-lg"
                  >
                    保存する
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
