import { WordRow } from "../../../../../types/WordSensesList";
import {
  formatAccuracy,
  formatJapaneseDate,
  formatLevel,
  formatTagWithChunk,
} from "../hooks/convertToWordRows";

type Props = {
  wordRows: WordRow[];
  onSort: (key: keyof WordRow) => void;
  sortKey: keyof WordRow;
  sortOrder: "asc" | "desc";
  onSelect: (word: WordRow) => void;
};

const headers: { label: string; key: keyof WordRow; width: string }[] = [
  { label: "単語", key: "word", width: "w-[160px]" },
  { label: "リスト", key: "chunkIndex", width: "w-[140px]" },
  { label: "状態", key: "status", width: "w-[160px]" },
  { label: "習熟度", key: "level", width: "w-[120px]" },
  { label: "正答率", key: "accuracy", width: "w-[120px]" },
  { label: "学習日", key: "learnedDate", width: "w-[180px]" },
  { label: "復習日", key: "reviewDate", width: "w-[180px]" },
];

export default function WordTable({
  wordRows,
  onSort,
  sortKey,
  sortOrder,
  onSelect,
}: Props) {
  return (
    <div className="md:mx-12 overflow-x-auto rounded-xl shadow border border-gray-200 bg-white">
      <table className="min-w-max w-full text-lg text-left border-collapse">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            {headers.map((h) => (
              <th
                key={h.key}
                className={`px-4 py-3 font-semibold text-gray-700 whitespace-nowrap cursor-pointer hover:text-blue-600 transition ${
                  h.key === "word" ? "sticky left-0 z-10 bg-sky-200" : ""
                } ${h.width ?? ""}`}
                onClick={() => onSort(h.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {h.label}
                  <span className="text-xs w-4">
                    {sortKey === h.key && (sortOrder === "asc" ? "🔼" : "🔽")}
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {wordRows.map((word, idx) => (
            <tr
              key={word.word_id}
              className={`hover:bg-blue-50 transition whitespace-nowrap cursor-pointer ${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td
                onClick={() => onSelect(word)}
                className={`px-4 py-3 border-t border-sky-100 ${"sticky left-0 bg-sky-100 z-10"}`}
              >
                {word.word}
              </td>
              <td className="px-4 py-3 border-t border-gray-100">
                {formatTagWithChunk(word.tags, word.chunkIndex)}
              </td>
              <td className="px-4 py-3 border-t border-gray-100">
                {word.status}
              </td>
              <td className="px-4 py-3 border-t border-gray-100">
                {formatLevel(word.level)}
              </td>
              <td className="px-4 py-3 border-t border-gray-100">
                {formatAccuracy(word.accuracy)}
              </td>
              <td className="px-4 py-3 border-t border-gray-100">
                {formatJapaneseDate(word.learnedDate)}
              </td>
              <td className="px-4 py-3 border-t border-gray-100">
                {formatJapaneseDate(word.reviewDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
