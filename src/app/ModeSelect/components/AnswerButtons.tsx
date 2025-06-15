"use client";

import { AiOutlineClose, AiOutlineCheck } from "react-icons/ai";
import { LearnSettings } from "../../../../types/WordSensesList";

type Props = {
  settings: LearnSettings;
  onKnow: () => void;
  onDontKnow: () => void;
  options: { text: string; isCorrect: boolean }[];
  selectedIndex: number | null;
  setSelectedIndex: (i: number) => void;
  labelKnow: string;
  labelDontKnow: string;
  isDisabled?: boolean;
  buttonPressed: "know" | "dontKnow" | null;
};

export default function AnswerButtons({
  settings,
  onKnow,
  onDontKnow,
  options,
  selectedIndex,
  setSelectedIndex,
  labelKnow,
  labelDontKnow,
  isDisabled = false,
  buttonPressed,
}: Props) {
  const isInput = settings.mode === "input";

  return (
    <>
      {isInput && (
        <div className="flex flex-row gap-4 w-full max-w-[80dvw] mt-4 px-2 justify-center">
          <button
            onClick={onDontKnow}
            disabled={isDisabled}
            className={`bg-red-500 text-white text-xl md:text-3xl font-extrabold py-8 px-6 rounded-3xl w-1/2 flex items-center justify-center gap-2 ${
              isDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <AiOutlineClose className="text-xl md:text-3xl" />
            {labelDontKnow}
          </button>
          <button
            onClick={onKnow}
            disabled={isDisabled}
            className={`bg-green-600 text-white text-xl md:text-3xl font-extrabold py-8 px-6 rounded-3xl w-1/2 flex items-center justify-center gap-2 ${
              isDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <AiOutlineCheck className="-ml-2 text-xl md:text-3xl" />
            {labelKnow}
          </button>
        </div>
      )}

      {!isInput && (
        <div className="grid grid-cols-2 gap-4 w-full max-w-[90dvw] mt-4 px-2">
          {options.map((opt, idx) => {
            const isSelected = selectedIndex === idx;

            let bgColor = "bg-slate-500"; // 初期色

            if (selectedIndex !== null || buttonPressed === "dontKnow") {
              if (isSelected) {
                bgColor = opt.isCorrect ? "bg-green-600" : "bg-red-500";
              } else if (opt.isCorrect) {
                // ❗ 不正解を選んだときに正解を緑に
                bgColor = "bg-green-600";
              }
            }

            return (
              <button
                key={idx}
                disabled={isDisabled || selectedIndex !== null}
                onClick={() => {
                  if (selectedIndex === null) {
                    setSelectedIndex(idx);
                    if (opt.isCorrect) {
                      onKnow();
                    } else {
                      onDontKnow();
                    }
                  }
                }}
                className={`${bgColor} text-white text-xl font-bold py-6 px-4 rounded-2xl shadow-md transition hover:scale-105 ${
                  isDisabled || selectedIndex !== null
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
