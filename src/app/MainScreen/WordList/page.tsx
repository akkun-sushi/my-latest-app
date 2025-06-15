"use client";

import { useEffect, useState } from "react";
import { WordRow } from "../../../../types/WordSensesList";
import { useSort } from "./hooks/useSort";
import SearchBar from "./components/SearchBar";
import WordTable from "./components/WordTable";
import { fetchFromLocalStorage } from "@/app/hooks/fetchFromLocalStorage";
import { convertToWordRows } from "./hooks/convertToWordRows";
import Sidebar from "@/app/components/Sidebar";
import ItemsPerPageToggle from "./components/ItemsPerPageToggle";
import DictionaryModal from "@/app/components/DictionaryModal";

export default function WordListPage() {
  const [query, setQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<WordRow | null>(null);
  const [wordRows, setWordRows] = useState<WordRow[]>([]);

  const { sortKey, sortOrder, toggleSort, sortList } = useSort<WordRow>("word");

  // ✅ クライアント側でのみlocalStorageを読み込む
  useEffect(() => {
    const { chunkedWords, chunkedStatuses } = fetchFromLocalStorage();
    if (!chunkedWords || !chunkedStatuses) return;

    const rows = convertToWordRows(chunkedWords, chunkedStatuses);
    setWordRows(rows);
  }, []);

  const filteredRows = sortList(
    wordRows.filter((row) =>
      row.word.toLowerCase().includes(query.toLowerCase())
    )
  );

  const [itemsPerPage, setItemsPerPage] = useState(100);

  const displayedRows =
    itemsPerPage === -1 ? filteredRows : filteredRows.slice(0, itemsPerPage);

  return (
    <div className="flex min-h-screen">
      {/* ✅ Sidebar追加 */}
      <Sidebar
        isFixed={false}
        toggleButtonPosition="top-10 left-10"
        toggleButtonColor="text-black"
      />

      {/* ✅ メインコンテンツ */}
      <main className="flex-1 p-6 bg-gray-50 min-h-screen overflow-x-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 flex justify-center bg-sky-200 p-4 rounded-xl shadow">
            単語帳一覧
          </h1>

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            <div className="flex-1">
              <SearchBar searchQuery={query} onChange={setQuery} />
            </div>
            <ItemsPerPageToggle
              value={itemsPerPage}
              onChange={setItemsPerPage}
            />
          </div>
        </div>

        {/* ✅ テーブル部分だけ横スクロール可能 */}
        <WordTable
          wordRows={displayedRows}
          onSort={toggleSort}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSelect={(w) => setSelectedWord(w)}
        />
      </main>

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
