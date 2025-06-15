type Props = {
  searchQuery: string;
  onChange: (q: string) => void;
};

export default function SearchBar({ searchQuery, onChange }: Props) {
  return (
    <input
      type="text"
      placeholder="単語を検索..."
      value={searchQuery}
      onChange={(e) => onChange(e.target.value)}
      className="border px-4 py-3 rounded-lg text-sm w-full shadow-sm"
    />
  );
}
