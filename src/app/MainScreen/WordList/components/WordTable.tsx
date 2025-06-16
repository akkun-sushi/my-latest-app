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
  {
    label: "単語",
    key: "word",
    width: "min-w-[120px] sm:w-[140px] md:w-[180px]",
  },
  {
    label: "状態",
    key: "status",
    width: "min-w-[100px] sm:w-[130px] md:w-[160px]",
  },
  {
    label: "習熟度",
    key: "level",
    width: "min-w-[90px] sm:w-[100px] md:w-[120px]",
  },
  {
    label: "正答率",
    key: "accuracy",
    width: "min-w-[90px] sm:w-[100px] md:w-[120px]",
  },
  {
    label: "学習日",
    key: "learnedDate",
    width: "min-w-[130px] sm:w-[160px] md:w-[180px]",
  },
  {
    label: "復習日",
    key: "reviewDate",
    width: "min-w-[130px] sm:w-[160px] md:w-[180px]",
  },
  {
    label: "リスト",
    key: "chunkIndex",
    width: "min-w-[100px] sm:w-[120px] md:w-[140px]",
  },
];

export default function WordTable({
  wordRows,
  onSort,
  sortKey,
  sortOrder,
  onSelect,
}: Props) {
  return (
    <div className="md:mx-12 overflow-x-auto rounded-xl shadow border border-gray-700 bg-gray-900 text-white">
      <table className="min-w-max w-full text-sm sm:text-base text-left border-collapse">
        <thead className="bg-gray-800 border-b border-gray-700">
          <tr>
            {headers.map((h) => (
              <th
                key={h.key}
                className={`px-4 py-3 font-semibold text-gray-300 whitespace-nowrap cursor-pointer hover:text-blue-400 transition ${
                  h.key === "word" ? "sticky left-0 z-10 bg-gray-800" : ""
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
          {wordRows.map((word, idx) => {
            const rowBg =
              idx % 2 === 0 ? "even:bg-gray-900" : "odd:bg-gray-800";

            return (
              <tr
                key={word.word_id}
                className={`text-xs md:text-base hover:bg-gray-700 transition cursor-pointer ${rowBg}`}
              >
                <td
                  onClick={() => onSelect(word)}
                  className={`px-4 py-3 border-t border-gray-700 sticky left-0 z-10 bg-gray-800 even:bg-gray-900 odd:bg-gray-800 break-words`}
                >
                  {word.word}
                </td>
                <td className="px-4 py-3 border-t border-gray-700 break-words">
                  {word.status}
                </td>
                <td className="px-4 py-3 border-t border-gray-700 break-words">
                  {formatLevel(word.level)}
                </td>
                <td className="px-4 py-3 border-t border-gray-700 break-words">
                  {formatAccuracy(word.accuracy)}
                </td>
                <td className="px-4 py-3 border-t border-gray-700 break-words">
                  {formatJapaneseDate(word.learnedDate)}
                </td>
                <td className="px-4 py-3 border-t border-gray-700 break-words">
                  {formatJapaneseDate(word.reviewDate)}
                </td>
                <td className="px-4 py-3 border-t border-gray-700 break-words">
                  {formatTagWithChunk(word.tags, word.chunkIndex)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
