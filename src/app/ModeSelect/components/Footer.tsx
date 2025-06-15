// Footer.tsx
type Props = {
  currentIndex: number; // 現在の単語（0始まり）
  total: number; // 総単語数
};

const Footer = ({ currentIndex, total }: Props) => {
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;
  const displayIndex = Math.min(currentIndex + 1, total);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md px-6 pt-3 py-1 border-t border-gray-200">
      <div className="max-w-[80dvw] mx-auto">
        <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-sm mt-1 md:text-xl text-gray-600">
          {displayIndex} / {total} 単語完了
        </div>
      </div>
    </div>
  );
};

export default Footer;
