"use client";

import { useEffect, useState } from "react";
import { WordRow } from "../../../../types/WordSensesList";
import { useSort } from "./hooks/useSort";
import WordTable from "./components/WordTable";
import { fetchFromLocalStorage } from "@/app/hooks/fetchFromLocalStorage";
import { convertToWordRows } from "./hooks/convertToWordRows";
import Sidebar from "@/app/components/Sidebar";
import ItemsPerPageToggle from "./components/ItemsPerPageToggle";
import DictionaryModal from "@/app/components/DictionaryModal";
import { LoadingScreen } from "@/app/components/LoadingScreen";

export default function WordListPage() {
  const [query, setQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<WordRow | null>(null);
  const [wordRows, setWordRows] = useState<WordRow[]>([]);
  const { sortKey, sortOrder, toggleSort, sortList } = useSort<WordRow>("word");
  const [isLoading, setIsLoading] = useState(true); // 初期は読み込み中

  // ✅ クライアント側でのみlocalStorageを読み込む
  useEffect(() => {
    const { chunkedWords, chunkedStatuses } = fetchFromLocalStorage();
    if (!chunkedWords || !chunkedStatuses) return;

    const rows = convertToWordRows(chunkedWords, chunkedStatuses);
    setWordRows(rows);

    // 読み込み完了
    setIsLoading(false);
  }, []);

  const filteredRows = sortList(
    wordRows.filter((row) =>
      row.word.toLowerCase().includes(query.toLowerCase())
    )
  );

  const [itemsPerPage, setItemsPerPage] = useState(100);

  const displayedRows =
    itemsPerPage === -1 ? filteredRows : filteredRows.slice(0, itemsPerPage);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-950 text-white">
      {/* ✅ Sidebar */}
      <Sidebar
        isFixed={false}
        toggleButtonPosition="top-8 left-4"
        toggleButtonColor="text-white"
      />

      {/* ✅ メインコンテンツ */}
      <main className="flex-1 px-2 py-4 sm:p-6 overflow-x-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* ✅ ヘッダー */}
          <h1 className="text-2xl sm:text-3xl font-bold text-center bg-gray-800 p-4 rounded-xl shadow">
            単語帳一覧
          </h1>

          {/* ✅ 検索・切り替え */}
          <div className="px-2 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="単語を検索..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border border-gray-600 px-4 py-3 rounded-lg text-sm w-full shadow-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ItemsPerPageToggle
              value={itemsPerPage}
              onChange={setItemsPerPage}
            />
          </div>

          {/* ✅ 単語テーブル */}
          <div className="mx-2 bg-gray-900 rounded-xl p-4 shadow overflow-x-auto">
            <WordTable
              wordRows={displayedRows}
              onSort={toggleSort}
              sortKey={sortKey}
              sortOrder={sortOrder}
              onSelect={(w) => setSelectedWord(w)}
            />
          </div>
        </div>
      </main>

      {/* ✅ モーダル */}
      {selectedWord && (
        <DictionaryModal
          isOpen={!!selectedWord}
          word={selectedWord.word}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
}
