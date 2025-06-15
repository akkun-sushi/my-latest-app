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
    <div className="flex items-center gap-2 md:gap-3 border border-gray-300 p-3 rounded-lg shadow-sm bg-white">
      <span className="text-sm text-gray-700 whitespace-nowrap font-bold">
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
            className={`px-4 py-1.5 rounded-full text-sm border transition shadow-sm font-semibold whitespace-nowrap
          ${
            isSelected
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-100"
          }
        `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
