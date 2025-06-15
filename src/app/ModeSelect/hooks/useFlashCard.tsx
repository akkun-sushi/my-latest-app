"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  LearnSettings,
  WordWithSenses,
} from "../../../../types/WordSensesList";

// コンポーネントから渡される Props の型定義
type Props = {
  settings: LearnSettings;
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
  currentWord: WordWithSenses | null;
  speakWord: (text: string) => void;
  isFront: boolean;
  setIsFront: (value: boolean) => void;
  isAutoSpeaking: boolean;
  setIsAutoSpeaking: (value: boolean | ((prev: boolean) => boolean)) => void;
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  setModalWord: Dispatch<SetStateAction<string | null>>;
  handleAnswer: (type: "know" | "dontKnow") => void;
};

export const useFlashCard = ({
  settings,
  index,
  setIndex,
  currentWord,
  speakWord,
  isFront,
  setIsFront,
  isAutoSpeaking,
  setIsAutoSpeaking,
  isModalOpen,
  setIsModalOpen,
  setModalWord,
  handleAnswer,
}: Props) => {
  const mode = settings.mode;

  const [isBackButtonPressed, setIsBackButtonPressed] = useState(false); // 戻るボタンアニメーション用

  // カードを裏返す処理（フリップ）
  const handleCardFlip = () => {
    const next = !isFront;
    setIsFront(next);

    // 表面に戻ったとき、かつ自動音声がONなら単語を読み上げ
    if (next && isAutoSpeaking && currentWord) {
      speakWord(currentWord.word);
    }
  };

  // 戻るボタン処理（indexを1つ減らす）
  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index > 0) {
      setIsBackButtonPressed(true);
      setIsFront(true); // 表面に戻す
      setIndex((prev) => prev - 1);
    }

    // アニメーション用フラグを一定時間で解除
    setTimeout(() => setIsBackButtonPressed(false), 300);
  };

  // 単語詳細モーダルを開く処理（マウス or キーイベント）
  const handleMoreInfoClick = (e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation?.(); // マウスイベントなら伝播を止める
    if (currentWord) {
      setModalWord(currentWord.word);
      setIsModalOpen(true);
    }
  };

  // スピーカーボタン処理（単語音声再生）
  const handleSpeakerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentWord) speakWord(currentWord.word);
  };

  // 自動読み上げ ON/OFF 切り替え
  const handleAutoSpeakerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoSpeaking((prev) => !prev);
  };

  // 連続キー入力を防止するためのロック
  const isLockedRef = useRef(false);

  // 🎨 習熟度レベルごとのスタイル設定
  const levelStyles: Record<number, string> = {
    0: "bg-blue-100",
    1: "bg-red-100 text-red-800",
    2: "bg-orange-100 text-orange-800",
    3: "bg-yellow-100 text-yellow-800",
    4: "bg-lime-100 text-lime-800",
    5: "bg-green-200 text-green-900",
    6: "bg-cyan-200 text-cyan-900",
    7: "bg-orange-300 text-orange-900 font-semibold shadow-sm",
    8: "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 border border-gray-400 text-gray-900 font-semibold shadow-md",
    9: "bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 border border-yellow-400 text-yellow-900 font-bold shadow-md",
    10: "bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 border-2 border-yellow-500 text-yellow-900 font-extrabold shadow-lg ring-2 ring-yellow-400",
  };

  // キーボードショートカット処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // モーダルが閉じているときだけロックをチェック（開いているときは w のみ許可）
      if (!isModalOpen && isLockedRef.current) return;

      // 🔒 モーダルが開いているときは "w" でのみ閉じる。それ以外は無視
      if (isModalOpen) {
        if (key === "w") {
          setIsModalOpen(false);
          isLockedRef.current = true;
          setTimeout(() => {
            isLockedRef.current = false;
          }, 300);
        }
        return;
      }

      // 各キーに応じたアクション
      switch (key) {
        case "q":
          handleBackClick(e as any);
          break;
        case "w":
          handleMoreInfoClick(e as any);
          break;
        case "e":
          handleSpeakerClick(e as any);
          break;
        case "r":
          handleAutoSpeakerClick(e as any);
          break;
        case "a":
          if (mode === "input") {
            handleAnswer("dontKnow");
          }
          break;
        case "s":
          /*
          if (mode === "input") {   
            handleAnswer("know");
          }
          */
          handleAnswer("know"); //練習用
          break;
        case " ":
          e.preventDefault(); // スクロール防止（特にSpace）
          const next = !isFront;
          setIsFront(next); // 表裏反転
          break;
        default:
          return;
      }

      // 一定時間ロックをかけて連続入力を防止
      isLockedRef.current = true;
      setTimeout(() => {
        isLockedRef.current = false;
      }, 300);
    };

    // イベントリスナー登録とクリーンアップ
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentWord, index, isModalOpen, isFront]);

  // フックで提供する関数・状態
  return {
    isBackButtonPressed,
    levelStyles,
    handleCardFlip,
    handleBackClick,
    handleMoreInfoClick,
    handleSpeakerClick,
    handleAutoSpeakerClick,
  };
};
