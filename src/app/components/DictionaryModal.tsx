"use client";

import { useEffect, useState } from "react";

import { fetchFromLocalStorage } from "@/app/hooks/fetchFromLocalStorage";
import { WordWithSenses } from "../../../types/WordSensesList";
import Image from "next/image";

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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4 sm:px-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-4xl max-h-[80dvh] overflow-y-auto flex flex-col md:flex-row gap-6"
      >
        {/* 左：意味・語源など */}
        <div className="md:w-1/2 w-full flex flex-col gap-y-4 pr-1 sm:pr-2">
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-700">
            {wordData.word}
          </h1>

          <section className="space-y-4">
            {wordData.senses.map((sense) => (
              <div
                key={sense.senses_id ?? `${sense.pos}-${sense.en}`}
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm"
              >
                <p className="text-sm font-medium text-gray-500">{sense.pos}</p>
                <p className="text-base sm:text-lg text-gray-900 font-semibold mt-1">
                  {sense.en}
                </p>
                <p className="text-gray-700 text-sm sm:text-base mb-2">
                  {sense.ja}
                </p>
                <p className="italic text-indigo-600 text-sm sm:text-base">
                  &quot;{sense.seEn}&quot;
                </p>
                <p className="text-sm text-gray-600">→ {sense.seJa}</p>
              </div>
            ))}
          </section>

          {/* 語源セクション */}
          {etymology &&
            etymology.trim() !== "" &&
            ![
              "語源情報は見つかりませんでした。",
              "語源情報の読み込みに失敗しました。",
            ].includes(etymology) && (
              <section className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                <h2 className="text-base sm:text-lg font-bold text-gray-700 mb-2">
                  📜 語源
                </h2>
                <p className="text-gray-800 text-sm sm:text-base whitespace-pre-wrap">
                  {etymology}
                </p>
              </section>
            )}
        </div>

        {/* 右：画像 */}
        <div className="md:w-1/2 w-full rounded-xl overflow-hidden shadow relative aspect-[16/9] md:aspect-auto min-h-[180px]">
          {showImage ? (
            <Image
              src={`/images/words/${imageName}.jpg`}
              alt={`${wordData.word} image`}
              fill
              className="object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
              画像がありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DictionaryModal;
