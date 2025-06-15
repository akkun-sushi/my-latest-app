import { useRouter } from "next/navigation";

type Props = {
  mode: "input" | "output" | "test" | "review";
};

const Header = ({ mode }: Props) => {
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
    <div className="fixed top-4 left-0 right-0 z-50 px-4 py-3 sm:px-6 sm:py-4">
      <div className="max-w-4xl mx-auto relative flex items-center justify-between">
        {/* 戻るボタン */}
        <button
          onClick={handleBack}
          className="ml-4 text-blue-600 hover:text-blue-800 text-sm is:text-lg sm:text-xl md:text-2xl font-semibold flex items-center space-x-1"
        >
          <span>戻る</span>
        </button>

        {/* タイトル（中央寄せ） */}
        <div className="absolute left-1/2 -translate-x-1/2 text-black text-sm is:text-xl sm:text-2xl md:text-4xl font-bold">
          {title}
        </div>
      </div>
    </div>
  );
};

export default Header;
