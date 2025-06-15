import { GiSpeaker } from "react-icons/gi";
import { IoInfiniteOutline } from "react-icons/io5";
import { BiSolidLeftArrow } from "react-icons/bi";
import {
  LearnSettings,
  Sense,
  WordWithSenses,
} from "../../../../types/WordSensesList";

type Props = {
  sense: Sense;
  currentWord: WordWithSenses;
  settings: LearnSettings;
  isFront: boolean;
  isAutoSpeaking: boolean;
  isSpeaking: boolean;
  isBackButtonPressed: boolean;
  buttonPressed: "know" | "dontKnow" | null;
  currentLevel: number;
  levelStyles: Record<number, string>;
  onFlip: () => void;
  onBack: (e: React.MouseEvent) => void;
  onMoreInfo: (e: React.MouseEvent) => void;
  onSpeak: (e: React.MouseEvent) => void;
  onToggleAuto: (e: React.MouseEvent) => void;
  timeLeft: number;
  getTimeBarColor: (percent: number) => void;
};

const FlashCard = ({
  sense,
  currentWord,
  isFront,
  settings,
  isAutoSpeaking,
  isSpeaking,
  isBackButtonPressed,
  buttonPressed,
  currentLevel,
  levelStyles,
  onFlip,
  onBack,
  onMoreInfo,
  onSpeak,
  onToggleAuto,
  timeLeft,
  getTimeBarColor,
}: Props) => {
  const isInput = settings.mode === "input";
  const isTest = settings.mode === "test" || settings.mode === "review";

  return (
    <div className="mt-16 md:mt-24 md:mb-4 flex flex-col items-center justify-center flex-1 w-full px-6">
      <div
        className={`w-full md:max-w-[80dvw] rounded-3xl p-2 shadow-xl text-center duration-300 flex flex-col justify-between h-full transition-colors ${
          buttonPressed === "know"
            ? "bg-green-200"
            : buttonPressed === "dontKnow"
            ? "bg-red-200"
            : "bg-white text-black"
        }`}
        onClick={onFlip}
      >
        {isTest && (
          <div className="absolute top-0 left-0 w-full h-5 bg-gray-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${getTimeBarColor(
                timeLeft
              )}`}
              style={{ width: `${timeLeft}%` }}
            />
          </div>
        )}

        <div className="h-full flex flex-col justify-between">
          {/* 🟠 センテンス部分 */}
          <div
            className={`${
              isTest ? "basis-[40%]" : "basis-[25%]"
            } relative flex items-start text-left justify-start`}
          >
            <p className="text-xl md:text-4xl font-semibold break-words absolute left-4 top-4 leading-relaxed md:top-1/2 md:-translate-y-1/2">
              {isInput ? (isFront ? sense.seEn : sense.seJa) : sense.seEn}
            </p>

            {/* 🎓 習熟度ラベル */}
            <div
              className={`absolute top-4 right-4 sm:text-lg md:text-2xl font-bold px-5 py-2 rounded-full backdrop-blur-sm ${
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

          <div className="w-full h-1 mx-auto rounded-full bg-gray-400" />

          {/* 🟠 単語 + 定義部分 */}
          <div
            className={`${
              isTest ? "basis-[60%]" : "basis-[50%]"
            }  relative w-full text-left`}
          >
            {/* 単語 */}
            <div
              className={`${
                isTest ? "top-[50%]" : "top-[35%]"
              } absolute  left-0 -translate-y-1/2 px-4`}
            >
              <p className="text-4xl md:text-8xl font-extrabold text-orange-400 whitespace-nowrap">
                {currentWord.word}
              </p>
              <span className="text-black text-lg md:text-2xl">
                {" "}
                ({sense.pos})
              </span>
            </div>

            {/* 訳文（下に配置） */}
            {isInput && (
              <div className="absolute bottom-12 left-0 translate-y-1/2 px-4 w-full">
                <p
                  className={`italic font-bold text-gray-800 break-words text-left ${
                    isFront ? "text-xl md:text-4xl" : "text-2xl md:text-5xl"
                  }`}
                >
                  {isFront ? sense.en : sense.ja}
                </p>
              </div>
            )}
          </div>

          {/* 🟠 ボタン部分 */}
          {!isTest && (
            <div className="basis-[25%] flex justify-center gap-4 md:gap-40 items-center">
              {/* ← ボタン */}
              <button
                onClick={onBack}
                disabled={isBackButtonPressed}
                className={`border rounded-3xl px-6 md:px-24 py-4 text-sm shadow transition-colors duration-200 ${
                  isBackButtonPressed ? "bg-sky-200" : "bg-white"
                }`}
              >
                <BiSolidLeftArrow />
              </button>

              {/* 詳細検索ボタン */}
              <button
                onClick={onMoreInfo}
                className="bg-white font-bold border rounded-xl px-3 md:px-24 py-4 text-sm shadow"
              >
                🔍 もっと知る
              </button>

              {/* スピーカーアイコンと自動再生表示 */}
              <div className="flex flex-col items-center px-2">
                <div className="flex gap-2 md:gap-12 bg-white border rounded-lg px-3 md:px-8 py-2">
                  <button
                    onClick={onSpeak}
                    className={`text-3xl md:text-4xl transition-colors duration-200 ${
                      isSpeaking
                        ? "text-red-400 cursor-not-allowed"
                        : "text-gray-800 hover:text-red-200"
                    }`}
                    disabled={isSpeaking}
                  >
                    <GiSpeaker />
                  </button>
                  <button
                    onClick={onToggleAuto}
                    className={`text-3xl md:text-4xl transition-colors duration-200 ${
                      isAutoSpeaking
                        ? "text-blue-400"
                        : "text-gray-800 hover:text-blue-200"
                    }`}
                  >
                    <IoInfiniteOutline />
                  </button>
                </div>
                <p className="text-xs md:text-xl text-gray-800 mt-1">
                  自動再生：{isAutoSpeaking ? "ON" : "OFF"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
