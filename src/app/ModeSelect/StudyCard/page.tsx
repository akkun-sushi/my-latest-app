"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  INITIAL_LEARN_SETTINGS,
  INITIAL_USER_DATA,
  LearnSettings,
  SenseStatus,
  UserData,
  WordWithSenses,
} from "../../../../types/WordSensesList";
import AnswerButtons from "../components/AnswerButtons";
import { useAnswerHandler } from "../hooks/useAnswerHandler";
import { useSpeechSynthesis } from "../../hooks/useSpeechSynthesis";
import { useFlashCard } from "../hooks/useFlashCard";
import FlashCard from "../components/FlashCard";
import { fetchFromLocalStorage } from "../../hooks/fetchFromLocalStorage";
import DictionaryModal from "../../components/DictionaryModal";

const InputMode = () => {
  // ==========================
  // 📦 データ読み込み・状態管理
  // ==========================

  // 単語リストのステート
  const [words, setWords] = useState<WordWithSenses[]>([]);
  // ステータスリストのステート（記憶度など）
  const [statuses, setStatuses] = useState<SenseStatus[]>([]);

  const [userData, setUserData] = useState<UserData>(INITIAL_USER_DATA);
  const [settings, setSettings] = useState<LearnSettings>(
    INITIAL_LEARN_SETTINGS
  );

  // データ読み込み後に useState に反映
  useEffect(() => {
    const { currentLearningList, statuses, userData, learnSettings } =
      fetchFromLocalStorage();

    if (currentLearningList && statuses && userData && learnSettings) {
      setWords(currentLearningList);
      setStatuses(statuses); // currentChunkStatusesではないのは、のちのちデータを更新して保存する際に、一括変更をするため。
      setUserData(userData);
      setSettings(learnSettings);
    }
  }, []);

  // フラッシュカードの表裏（true: 表, false: 裏）
  const [isFront, setIsFront] = useState(true);
  // 自動音声ON/OFF
  const [isAutoSpeaking, setIsAutoSpeaking] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalWord, setModalWord] = useState<string | null>(null);

  // ==========================
  // 🔈 音声関連
  // ==========================

  const {
    speakWord, // 単語や例文を読み上げる関数
    isSpeaking, // 現在読み上げ中かどうか（再生中の無効化に使用）
  } = useSpeechSynthesis();

  // ==========================
  // 🧠 回答・学習進捗管理
  // ==========================

  const {
    currentWord, // 現在表示中の単語
    currentSense, // 現在の意味（sense）情報
    index, // 現在のインデックス（何番目か）
    setIndex, // インデックス更新関数
    currentLevel, // 覚えた度合い
    buttonPressed, // 押されたボタンの状態（"know" / "dontKnow" / null）
    handleAnswer, // 回答ボタンが押されたときの処理
    getButtonLabels, // remember値に応じたボタンのラベル取得関数
    options,
    selectedIndex,
    setSelectedIndex,
    timeLeft,
    getTimeBarColor,
  } = useAnswerHandler(
    words,
    statuses,
    userData,
    settings,
    setStatuses,
    setIsFront,
    isAutoSpeaking,
    speakWord
  );

  useEffect(() => {
    if (index !== null) {
      localStorage.setItem("CurrentWordIndex", index.toString());
    }
  }, [index]);

  // ==========================
  // 🃏 カード操作系（フリップ・戻る・音声ボタンなど）
  // ==========================

  const {
    isBackButtonPressed, // 戻るボタンが押された状態かどうか
    levelStyles,
    handleCardFlip, // 表⇔裏の切り替え処理
    handleBackClick, // 戻るボタンクリック時の処理
    handleMoreInfoClick, // 詳細表示ボタンクリック
    handleSpeakerClick, // 音声ボタンクリック時の処理
    handleAutoSpeakerClick, // 自動読み上げON/OFF切り替え処理
  } = useFlashCard({
    settings: settings ?? INITIAL_LEARN_SETTINGS,
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
  });

  // ==========================
  // 📝 回答ボタンのラベル設定
  // ==========================

  const {
    know: labelKnow, // 「覚えた！」ボタンの表示ラベル
    dontKnow: labelDontKnow, // 「もう一回」ボタンの表示ラベル
  } = getButtonLabels(currentLevel);

  // ==========================
  // ⏳ 読み込み中の表示
  // ==========================

  if (!words || !statuses || !currentWord || !currentSense || !settings) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  // ==========================
  // 🌟 描画処理
  // ==========================

  return (
    <div className="h-[100dvh] bg-gradient-to-br from-sky-50 to-blue-100 flex flex-col items-center relative pb-12 im:pb-16 md:pb-24">
      <Header
        mode={settings.mode}
        currentLevel={currentLevel}
        levelStyles={levelStyles}
      />

      <FlashCard
        sense={currentSense}
        currentWord={currentWord}
        settings={settings}
        isFront={isFront}
        isAutoSpeaking={isAutoSpeaking}
        isSpeaking={isSpeaking}
        isBackButtonPressed={isBackButtonPressed}
        buttonPressed={buttonPressed}
        onFlip={handleCardFlip}
        onBack={handleBackClick}
        onMoreInfo={handleMoreInfoClick}
        onSpeak={handleSpeakerClick}
        onToggleAuto={handleAutoSpeakerClick}
        timeLeft={timeLeft}
        getTimeBarColor={getTimeBarColor}
      />

      <AnswerButtons
        settings={settings}
        onKnow={() => handleAnswer("know")}
        onDontKnow={() => handleAnswer("dontKnow")}
        options={options}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        labelKnow={labelKnow}
        labelDontKnow={labelDontKnow}
        isDisabled={buttonPressed !== null || isSpeaking}
        buttonPressed={buttonPressed}
      />

      <Footer currentIndex={index} total={words.length} />

      {isModalOpen && modalWord && (
        <DictionaryModal
          word={modalWord}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default InputMode;
