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

  // ⚡️ 単語の長さに応じたクラスを決定
  const wordLength = currentWord.word.length;
  let fontSizeClass = "text-5xl";

  if (wordLength > 20) {
    fontSizeClass = "text-xl im:text-2xl";
  } else if (wordLength > 16) {
    fontSizeClass = "text-2xl im:text-3xl";
  } else if (wordLength > 14) {
    fontSizeClass = "text-3xl im:text-4xl";
  } else if (wordLength > 10) {
    fontSizeClass = "text-4xl im:text-5xl";
  } else if (wordLength > 7) {
    fontSizeClass = "text-4xl im:text-5xl";
  }

  return (
    <div className="mt-12 im:mt-20 md:mt-24 im:mb-4 flex flex-col items-center justify-center flex-1 w-full px-6">
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
          <div className="absolute top-0 left-0 w-full h-2 md:h-5 bg-gray-200 overflow-hidden">
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
            className={`${isTest ? "basis-[30%]" : "basis-[25%]"} ${
              isInput ? "hidden im:flex" : "flex"
            } relative items-start text-left justify-start`}
          >
            <p
              className={`${
                isTest
                  ? "px-2 top-1/2 -translate-y-1/2"
                  : "top-1 left-1 im:top-1/2 im:-translate-y-1/2"
              } text-sm im:text-xl md:text-4xl font-semibold break-words absolute `}
            >
              {isInput ? (isFront ? sense.seEn : sense.seJa) : sense.seEn}
            </p>
          </div>
          <div
            className={`${
              isInput ? "hidden im:flex" : "flex"
            } mt-2 w-full h-1 mx-auto rounded-full bg-gray-400`}
          />

          {/* 🟠 単語 + 定義部分 */}
          <div
            className={`${
              isTest ? "basis-[70%]" : "basis-[75%]"
            } relative w-full text-left`}
          >
            {/* 単語 */}
            <div
              className={`${
                isTest ? "top-[50%]" : "top-[35%]"
              } absolute left-0 -translate-y-[40%] im:-translate-y-[30%] px-4`}
            >
              <p
                className={`${fontSizeClass} md:text-8xl font-extrabold text-orange-400 whitespace-nowrap`}
              >
                {currentWord.word}
              </p>
              <span className="text-black text-sm im:text-lg md:text-2xl">
                {" "}
                ({sense.pos})
              </span>
            </div>

            {/* 訳文（下に配置） */}
            {isInput && (
              <div className="absolute bottom-12 left-0 translate-y-1/2 px-4 w-full">
                <p
                  className={`italic font-bold text-gray-800 break-words text-left ${
                    isFront
                      ? "text-base im:text-xl md:text-4xl"
                      : "text-lg im:text-2xl md:text-5xl"
                  }`}
                >
                  {isFront ? sense.en : sense.ja}
                </p>
              </div>
            )}
          </div>

          {/* 🟠 ボタン部分 */}
          {!isTest && (
            <div className="basis-[25%] flex justify-center gap-2 im:gap-4 md:gap-40 items-center">
              {/* ← ボタン */}
              <button
                onClick={onBack}
                disabled={isBackButtonPressed}
                className={`border rounded-3xl px-6 md:px-24 py-4 text-xs im:text-sm shadow transition-colors duration-200 ${
                  isBackButtonPressed ? "bg-sky-200" : "bg-white"
                }`}
              >
                <BiSolidLeftArrow />
              </button>

              {/* 詳細検索ボタン */}
              <button
                onClick={onMoreInfo}
                className="bg-white font-bold border rounded-xl px-1 im:px-3 md:px-24 py-4 text-xs im:text-sm shadow"
              >
                🔍 もっと知る
              </button>

              {/* スピーカーアイコンと自動再生表示 */}
              <div className="flex flex-col items-center">
                <div className="flex gap-2 md:gap-12 bg-white border rounded-lg px-3 md:px-8 py-2">
                  <button
                    onClick={onSpeak}
                    className={`text-lg im:text-xl md:text-4xl transition-colors duration-200 ${
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
                    className={`text-lg im:text-xl md:text-4xl transition-colors duration-200 ${
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
