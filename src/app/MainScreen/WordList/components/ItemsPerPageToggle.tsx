type Props = {
  value: number; // 選択中
  options?: number[]; // -1 は「全て」
  onChange: (newValue: number) => void;
};

export default function ItemsPerPageToggle({
  value,
  options = [100, 200, 500, -1], // ← -1 = 全て
  onChange,
}: Props) {
  return (
    <div className="flex items-center gap-2 md:gap-3 border border-gray-600 p-3 rounded-lg shadow-sm bg-gray-800 text-white">
      <span className="text-sm text-gray-300 whitespace-nowrap font-bold">
        表示数:
      </span>
      {options.map((n) => {
        const isAll = n === -1;
        const isSelected = value === n;
        const label = isAll ? "全て" : n;

        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`px-2.5 im:px-4 py-1.5 rounded-full text-sm border transition shadow-sm font-semibold whitespace-nowrap
          ${
            isSelected
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-gray-700 text-gray-300 border-gray-500 hover:bg-gray-600"
          }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
