"use client";

import { useEffect, useState } from "react";

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    window.speechSynthesis.getVoices(); // 初回トリガー

    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices(); // 音声準備後の再トリガー
    };
  }, []);

  const getPreferredEnglishVoice = (): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();

    if (voices.length === 0) return null;

    const preferredNames = [
      "Samantha",
      "Daniel",
      "Karen",
      "Google US English",
      "Google UK English Female",
    ];

    for (const name of preferredNames) {
      const voice = voices.find((v) => v.name === name);
      if (voice) return voice;
    }

    return (
      voices.find((v) => v.lang === "en-US") ||
      voices.find((v) => v.lang.startsWith("en")) ||
      null
    );
  };

  const speakWord = (text: string) => {
    if (!text || isSpeaking) return;

    const voice = getPreferredEnglishVoice();
    if (!voice) {
      alert(
        "音声データがまだ読み込まれていません。少し待ってからもう一度試してください。"
      );
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice.lang;
    utterance.voice = voice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return { speakWord, isSpeaking };
};
