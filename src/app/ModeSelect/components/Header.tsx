import { useRouter } from "next/navigation";

type Props = {
  mode: "input" | "output" | "test" | "review";
  currentLevel: number;
  levelStyles: Record<number, string>;
};

const Header = ({ mode, currentLevel, levelStyles }: Props) => {
  const router = useRouter();

  const handleBack = () => {
    if (mode !== "review") {
      router.push("/ModeSelect");
    } else {
      router.push("/MainScreen");
    }
  };

  const modeTitleMap = {
    input: "インプット学習",
    output: "アウトプット学習",
    test: "テストモード",
    review: "復習タイム",
  };

  const title = modeTitleMap[mode];

  return (
    <div className="fixed im:top-4 left-0 right-0 z-50 px-4 py-3 sm:px-6 sm:py-4">
      <div className="max-w-4xl mx-auto relative flex items-center justify-between">
        {/* 戻るボタン */}
        <button
          onClick={handleBack}
          className="ml-4 text-blue-600 hover:text-blue-800 text-sm im:text-xl md:text-2xl font-semibold flex items-center space-x-1"
        >
          <span>戻る</span>
        </button>

        {/* タイトル（中央寄せ） */}
        <div className="absolute left-1/2  -translate-x-[65%] text-black im:text-xl md:text-4xl font-bold">
          {title}
        </div>

        {/* 🎓 習熟度ラベル（右寄せ） */}
        <div
          className={`absolute right-0 w-[80px] im:w-[100px] md:w-[160px] text-xs im:text-lg md:text-2xl font-bold px-1 md:px-5 py-1 md:py-2 rounded-3xl backdrop-blur-sm text-center ${
            levelStyles[currentLevel] || "bg-gray-300/80 text-gray-800"
          }`}
        >
          {currentLevel === 0
            ? "NEW"
            : currentLevel === 10
            ? "👑 習熟度：10"
            : `習熟度：${currentLevel}`}
        </div>
      </div>
    </div>
  );
};

export default Header;
