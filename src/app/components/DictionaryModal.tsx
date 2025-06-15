"use client";

import { useEffect, useState } from "react";

import { fetchFromLocalStorage } from "@/app/hooks/fetchFromLocalStorage";
import { WordWithSenses } from "../../../types/WordSensesList";

type Props = {
  word: string;
  isOpen: boolean;
  onClose: () => void;
};

const DictionaryModal = ({ word, isOpen, onClose }: Props) => {
  const [wordData, setWordData] = useState<WordWithSenses | null>(null);
  const [etymology, setEtymology] = useState<string | null>(null);
  const [showImage, setShowImage] = useState(true); // 画像表示フラグ

  // ✅ localStorageから該当単語を探す
  useEffect(() => {
    const { words } = fetchFromLocalStorage();
    if (!words) return;
    try {
      const found = words.find((w) => w.word === word);
      if (found) setWordData(found);
    } catch (e) {
      console.error("❌ WordList parse error", e);
    }
  }, [word]);

  // ✅ 語源情報をetymologies.jsonから取得
  useEffect(() => {
    fetch("/etymologies/etymologies.json")
      .then((res) => res.json())
      .then((json: { word: string; ety: string }[]) => {
        // 比較用にwordの空白を_に変換
        const normalizedWord = word.toLowerCase().replace(/\s+/g, "_");
        const match = json.find(
          (entry) => entry.word.toLowerCase() === normalizedWord
        );
        setEtymology(match?.ety ?? "語源情報は見つかりませんでした。");
      })
      .catch(() => {
        setEtymology("語源情報の読み込みに失敗しました。");
      });
  }, [word]);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    if (target.src.endsWith(".jpg")) {
      target.src = `/images/words/${imageName}.png`; // imageNameを使う
    } else {
      setShowImage(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!wordData) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const imageName = wordData.word.toLowerCase().replace(/\s+/g, "_");

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-6 rounded-xl shadow-lg max-w-4xl w-[90dvw]  overflow-y-auto relative max-h-[80dvh] min-h-[500px] flex flex-col md:flex-row gap-6"
      >
        {/* 左：画像 */}
        <div className="md:w-1/2 w-full rounded-xl overflow-hidden shadow min-h-[180px]">
          {showImage ? (
            <img
              src={`/images/words/${imageName}.jpg`}
              alt={`${wordData.word} image`}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full min-h-[180px] md:h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
              画像がありません
            </div>
          )}
        </div>

        {/* 右：意味・語源など */}
        <div className="md:w-1/2 w-full flex flex-col gap-y-4 pr-2">
          <h1 className="text-2xl font-bold text-indigo-700">
            {wordData.word}
          </h1>

          <section className="space-y-4">
            {wordData.senses.map((sense) => (
              <div
                key={sense.senses_id ?? `${sense.pos}-${sense.en}`}
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm"
              >
                <p className="text-sm font-medium text-gray-500">{sense.pos}</p>
                <p className="text-lg font-semibold mt-1">{sense.en}</p>
                <p className="text-gray-700 mb-2">{sense.ja}</p>
                <p className="italic text-indigo-600">"{sense.seEn}"</p>
                <p className="text-sm text-gray-600">→ {sense.seJa}</p>
              </div>
            ))}
          </section>

          {etymology &&
            etymology.trim() !== "" &&
            ![
              "語源情報は見つかりませんでした。",
              "語源情報の読み込みに失敗しました。",
            ].includes(etymology) && (
              <section className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                <h2 className="text-lg font-bold text-gray-700 mb-2">
                  📜 語源
                </h2>
                <p className="text-gray-800 whitespace-pre-wrap">{etymology}</p>
              </section>
            )}
        </div>
      </div>
    </div>
  );
};

export default DictionaryModal;
