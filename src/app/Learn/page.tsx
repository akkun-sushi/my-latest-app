"use client";

import { useEffect, useRef, useState } from "react";
import {
  LearnSettings,
  ListName,
  Word,
  WordList,
} from "../../../types/WordList";
import { useRouter } from "next/navigation";
import { GiSpeaker } from "react-icons/gi";
import { MdImageSearch } from "react-icons/md";
import { IoInfiniteOutline } from "react-icons/io5"; // 自動っぽいアイコン
import { BiBookOpen } from "react-icons/bi";
import { BiSearchAlt2 } from "react-icons/bi";
import confetti from "canvas-confetti";

export default function Learn() {
  // ------------------------------
  // 📚 単語データ関連
  // ------------------------------
  const [listName, setListName] = useState<ListName>(null);
  const [wordList, setWordList] = useState<WordList>({});
  const [words, setWords] = useState<Word[]>([]); // 表示用の単語リスト
  const [originalWords, setOriginalWords] = useState<Word[]>([]); // 元データ（レベル更新などに使用）
  const [current, setCurrent] = useState(0); // 現在の単語インデックス
  const word = words[current]; // 現在表示中の単語

  // ------------------------------
  // 💡 UI状態管理
  // ------------------------------
  const [showJapanese, setShowJapanese] = useState(false); // 日本語を表示するか
  const [buttonPressed, setButtonPressed] = useState<
    "know" | "dontKnow" | null
  >(null); // 押されたボタン状態（色変更）
  const [isSpeaking, setIsSpeaking] = useState(false); // 音声読み上げ中かどうか
  const [timeLeft, setTimeLeft] = useState(100); // 残り時間（％表示）

  // ------------------------------
  // 🔁 モード・設定関連
  // ------------------------------

  const [mode, setMode] = useState<
    "word-en-ja" | "word-ja-en" | "sentence-en-ja" | "sentence-ja-en"
  >("word-en-ja");
  const [method, setMethod] = useState<"learn" | "review" | "test">("learn"); // 復習モードの選択
  const [order, setOrder] = useState<"default" | "alphabetical" | "random">(
    "default"
  ); // 単語の並び順
  const [levels, setLevels] = useState<{ [level: number]: boolean }>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    10: true,
    11: true,
  }); // 出題対象のレベル
  const [correctCount, setCorrectCount] = useState(0); // 正解数（テスト用）

  // ------------------------------
  // 🧭 ナビゲーションとタイマー
  // ------------------------------
  const router = useRouter(); // ページ遷移用（Next.js）
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // プログレスバー更新用の interval
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // 自動失点用の timeout

  const [isAutoSpeak, setIsAutoSpeak] = useState(false);
  const [hasSpokenOnce, setHasSpokenOnce] = useState(false); // スピーカーを一度でも押したか

  // 🔁 初期マウント時のみ1回実行
  useEffect(() => {
    // ⚙️ 学習設定（LearnSettings）の読み込み処理
    const savedSettings = localStorage.getItem("LearnSettings");
    if (savedSettings) {
      try {
        const settings: LearnSettings = JSON.parse(savedSettings);

        // ✅ 各設定を反映（モード・音声・並び順・出題レベル）
        setMode(settings.mode);
        setMethod(settings.method);
        setOrder(settings.order);
        setLevels(settings.levels);

        // ✅ 正答カウントは毎回リセット（テスト時用）
        setCorrectCount(0);

        if (
          settings.mode === "word-ja-en" ||
          settings.mode === "sentence-ja-en"
        ) {
          setShowJapanese(true); // ✅ 日本語を初期表示にする
        }

        // 🎯 許可されているレベルの単語だけを抽出（levels: {1: true, 2: false, ...}）
        const allowedLevels = Object.entries(levels)
          .filter(([, val]) => val)
          .map(([key]) => Number(key)); // 数値に変換

        // 📦 有効レベルに該当する単語だけを残す
        let updated = originalWords.filter((w) =>
          allowedLevels.includes(w.level)
        );

        // 📑 current = 0（つまり初回表示）のときだけ順序を変更
        if (current === 0) {
          if (order === "alphabetical") {
            // 🔤 英単語アルファベット順に並び替え
            updated.sort((a, b) => a.en.localeCompare(b.en));
          } else if (order === "random") {
            // 🔀 シャッフル（ランダム並び）
            updated.sort(() => Math.random() - 0.5);
          }

          // 🖥️ 表示用単語リストとして更新
          setWords(updated);
        } else {
          // 2単語目以降は現在の words を維持
          updated = words;
        }
      } catch {
        console.warn("LearnSettings の読み込みに失敗しました");
      }
    }

    const storedListName = localStorage.getItem("ListName");
    if (storedListName) {
      const parsedListName = JSON.parse(storedListName);
      setListName(parsedListName);

      // 📦 単語データ（WordList）の読み込み処理
      const storedWordList = localStorage.getItem("WordList");

      if (storedWordList) {
        try {
          const parsedWordList = JSON.parse(storedWordList);
          setWordList(parsedWordList);

          if (parsedWordList && Array.isArray(parsedWordList[parsedListName])) {
            // 🔑 元データとして state に保持（level 更新用など）
            setOriginalWords(parsedWordList[parsedListName]);

            // 🖥️ 表示用のデータにも反映（そのまま出力される単語リスト）
            setWords(parsedWordList[parsedListName]);
          }
        } catch (e) {
          console.error("localStorage WordList の解析に失敗しました:", e);
        }
      }
    }
  }, []);

  //出題単語のフィルタ・並び替え・音声再生処理
  useEffect(() => {
    // 🔒 単語データがまだ読み込まれていない場合は処理しない
    if (originalWords.length === 0) return;

    // 🎯 許可されているレベルの単語だけを抽出（levels: {1: true, 2: false, ...}）
    const allowedLevels = Object.entries(levels)
      .filter(([, val]) => val) // true のみ
      .map(([key]) => Number(key)); // 数値に変換

    // 📦 有効レベルに該当する単語だけを残す
    let updated = originalWords.filter((w) => allowedLevels.includes(w.level));

    // 📑 current = 0（つまり初回表示）のときだけ順序を変更
    if (current === 0) {
      if (order === "alphabetical") {
        // 🔤 英単語アルファベット順に並び替え
        updated.sort((a, b) => a.en.localeCompare(b.en));
      } else if (order === "random") {
        // 🔀 シャッフル（ランダム並び）
        updated.sort(() => Math.random() - 0.5);
      }

      // 🖥️ 表示用単語リストとして更新
      setWords(updated);
    } else {
      // 2単語目以降は現在の words を維持
      updated = words;
    }

    // 🔊 単語表示時に音声再生（設定がオンなら）
    if (isAutoSpeak) {
      const currentWord = updated[current];

      if (mode === "word-en-ja" || mode === "sentence-en-ja") {
        const textToSpeak =
          mode === "sentence-en-ja" ? currentWord.seEn : currentWord.en;
        speakWord(textToSpeak);
      }
    }
  }, [current, method, levels, isAutoSpeak]); // ← current の変更や再生設定変更時に再実行

  // 単語が読み込まれた直後に current をトリガーとして時間制限開始
  useEffect(() => {
    // 🚫 単語が未定義 or テストモードでない場合は何もしない
    if (!word || method !== "test") return;

    // ⏱ タイマー初期化（1問ごとに）
    setTimeLeft(100); // プログレスバー（％）

    if (mode === "word-ja-en" || mode === "sentence-ja-en") {
      setShowJapanese(true); // 日本語を初期表示
    } else {
      setShowJapanese(false); // 通常は英語を初期表示
    }

    setButtonPressed(null); // ボタンの色もリセット

    // 🕒 タイマー設定
    const start = Date.now(); // 開始時刻を取得
    const duration = 3000; // 制限時間（ミリ秒）← ここでは3秒

    // ⏳ 進行バー更新（30msごとに残り％を計算）
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start; // 経過時間
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100); // 残り％
      setTimeLeft(remaining);
    }, 30);

    // 🧨 時間切れになったら自動的に「わからない」扱い
    timeoutRef.current = setTimeout(() => {
      handleAnswer("dontKnow");
    }, duration);

    // ♻️ クリーンアップ（current, word, testMode が変わるたびに再実行）
    return () => {
      clearInterval(intervalRef.current!); // プログレスバー更新停止
      clearTimeout(timeoutRef.current!); // 自動判定停止
    };
  }, [current, word, method]); // ← 1問ごと or テストモード切替で再実行

  // 🧠 単語の回答結果に応じた共通処理（"know" or "dontKnow"）
  const handleAnswer = (type: "know" | "dontKnow") => {
    const isCorrect = type === "know"; // ✅ 正解かどうかを判定

    // ボタンの色（エフェクト）設定
    setButtonPressed(type);

    // 📦 該当単語の情報を更新（levelの段階的加算 & learnedAt 記録）
    const updatedOriginalWords = originalWords.map((w) =>
      w.id === words[current].id
        ? {
            ...w,
            level:
              isCorrect && method === "learn"
                ? (() => {
                    if (w.level >= 1 && w.level <= 2) {
                      return Math.min(w.level + 1, 3);
                    } else if (w.level >= 4 && w.level <= 5) {
                      return Math.min(w.level + 1, 6);
                    } else if (w.level === 7) {
                      return 8;
                    } else if (w.level === 9) {
                      return 10;
                    } else {
                      return w.level; // 3, 6, 8, 10などは変わらない
                    }
                  })()
                : w.level, // ❌ 不正解 or reviewMode中はレベル変更なし
            learnedAt: getToday(), // 今日の日付を記録
          }
        : w
    );

    // 📥 保存（stateとlocalStorage両方）
    const saveToWordList = (newWords: Word[]) => {
      setOriginalWords(newWords); // 🧠 個別単語状態も更新

      if (listName) {
        const updated = {
          ...wordList,
          [listName]: newWords,
        };

        setWordList(updated); // 状態更新
        localStorage.setItem("WordList", JSON.stringify(updated)); // 保存
      }
    };

    saveToWordList(updatedOriginalWords);

    // ✅ テストモード時のみ正答数カウント
    if (method === "test" && isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }

    // ⏱ 300ms 後に次の処理へ（ボタン押しっぱなし防止）
    setTimeout(() => {
      // 📚 まだ単語が残っている場合 → 次へ
      if (current < words.length - 1) {
        if (mode === "word-en-ja" || mode === "sentence-en-ja") {
          setShowJapanese(false);
        } else if (mode === "word-ja-en" || mode === "sentence-ja-en") {
          setShowJapanese(true);
        }

        // ⏭ 次の単語へ
        setCurrent((prev) => prev + 1);
        setButtonPressed(null); // 色戻す
      } else {
        // ✅ 全単語終了後の処理
        const percentage = (correctCount + (isCorrect ? 1 : 0)) / words.length;

        if (method === "test") {
          // ✅ mode と level の整合性チェック
          const isInvalidLevel = originalWords.some((w) => {
            if (mode === "word-en-ja") return w.level >= 4;
            if (mode === "word-ja-en") return w.level >= 7;
            if (mode === "sentence-en-ja") return w.level >= 9;
            if (mode === "sentence-ja-en") return w.level >= 11;
            return true; // mode 不明な場合も無効とする
          });

          if (isInvalidLevel) {
            // 🎌 条件外の単語が混ざっている場合 → テストモードの処理をスキップ
            alert("学習完了！");
            router.push("/ModeSelect");
            return;
          }

          // 📊 合格判定（70%以上）
          if (percentage >= 0.7) {
            // 🔍 現在のレベル帯に応じて次のレベルを設定
            let newLevel = 4;
            if (originalWords.every((w) => w.level === 6)) {
              newLevel = 7;
            } else if (originalWords.every((w) => w.level === 8)) {
              newLevel = 9;
            } else if (originalWords.every((w) => w.level === 10)) {
              newLevel = 11;
            }

            // 🎯 全単語を合格レベルに昇格
            const masteredOriginalWords = originalWords.map((w) => ({
              ...w,
              level: newLevel,
            }));

            saveToWordList(masteredOriginalWords);

            setTimeout(() => {
              confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.7 },
              });
            }, 200);

            // 300ms待ってからアラートを出す（描画が先に走る）
            setTimeout(() => {
              alert(
                `🎉 合格！正答率 ${(percentage * 100).toFixed(0)}% でした！`
              );
            }, 300);
          } else {
            // 💡 不合格メッセージ
            alert(
              `💡 正答率 ${(percentage * 100).toFixed(0)}%。再挑戦しよう！`
            );
          }
        } else {
          // テストモードでない場合の完了通知
          alert("お疲れさまでした！学習を完了しました🎉");
        }

        setTimeout(() => {
          router.push("/ModeSelect");
        }, 300);
      }
    }, 300);
  };

  const getPreferredEnglishVoice = () => {
    const voices = window.speechSynthesis.getVoices();

    // よく使われる高品質な音声の候補（環境によって有無は異なる）
    const preferredNames = [
      "Google US English", // Chrome系
      "Google UK English Female",
      "Samantha", // macOS / iOS（Apple系、自然）
      "Daniel", // UK男性
      "Karen", // オーストラリア女性（Apple系）
    ];

    // 優先リストにある音声を探す
    for (const name of preferredNames) {
      const voice = voices.find((v) => v.name === name);
      if (voice) return voice;
    }

    // なければ en-US 系で fallback
    return (
      voices.find((v) => v.lang === "en-US") ||
      voices.find((v) => v.lang.startsWith("en"))
    );
  };

  const speakWord = (text: string) => {
    if (!text || isSpeaking) return;

    const voice = getPreferredEnglishVoice();
    if (!voice) {
      alert("英語の音声が見つかりませんでした。");
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

  // 📅 日本時間（UTC+9）の今日の日付を "YYYY-MM-DD" 形式で取得する関数
  const getToday = () => {
    const date = new Date(); // 現在のUTC日時を取得
    date.setHours(date.getHours() + 9); // ⏰ UTC → JST（日本時間）に変換
    return date.toISOString().slice(0, 10); // "YYYY-MM-DDTHH:mm:ss.sssZ" → "YYYY-MM-DD" に切り出し
  };

  // 🎨 習熟度レベルごとのスタイル設定（Tailwind CSS）
  const levelStyles: Record<number, string> = {
    1: "bg-gray-200 text-gray-800", // 🟤 レベル1：初期状態
    2: "bg-red-100 text-red-800", // 🔴 レベル2：かなり苦手
    3: "bg-orange-100 text-orange-800", // 🟠 レベル3：やや苦手
    4: "bg-yellow-100 text-yellow-800", // 🟡 レベル4：少しできる
    5: "bg-lime-100 text-lime-800", // 🟢 レベル5：そこそこ理解
    6: "bg-green-200 text-green-900", // ✅ レベル6：合格ライン
    7: "bg-cyan-200 text-cyan-900", // 🔷 レベル7：安定して理解
    8: "bg-orange-300 text-orange-900 font-semibold shadow-sm", // 🥉 レベル8：かなり良い
    9: "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 border border-gray-400 text-gray-900 font-semibold shadow-md", // 🥈 レベル9：ほぼ完璧
    10: "bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 border border-yellow-400 text-yellow-900 font-bold shadow-md", // 👑 レベル10：完全習得
    11: "bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 border-2 border-yellow-500 text-yellow-900 font-extrabold shadow-lg ring-2 ring-yellow-400", // 👑✨ レベル11：殿堂入り
  };

  const handleCardClick = () => {
    console.log(isAutoSpeak && showJapanese);
    if (isAutoSpeak && showJapanese) {
      if (mode === "word-en-ja" || mode === "word-ja-en") {
        speakWord(word.en);
      } else if (mode === "sentence-en-ja" || mode === "sentence-ja-en") {
        speakWord(word.seEn);
      }
    }
    setShowJapanese((prev) => !prev);
  };

  const handleSpeakerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToSpeak =
      mode === "sentence-en-ja" || mode === "sentence-ja-en"
        ? word.seEn
        : word.en;
    speakWord(textToSpeak);
    setHasSpokenOnce(true);
  };

  const handleSearch = (
    e: React.MouseEvent,
    type: "image" | "example" | "etym"
  ) => {
    e.stopPropagation();
    let url = "";
    const encoded = encodeURIComponent(word.en);

    switch (type) {
      case "image":
        url = `https://www.google.com/search?tbm=isch&q=${encoded}`;
        break;
      case "example":
        url = `https://context.reverso.net/translation/english-japanese/${encoded}`;
        break;
      case "etym":
        url = `https://www.etymonline.com/word/${encoded}`;
        break;
    }

    window.open(url, "_blank");
  };

  const getDisplayText = () => {
    if (showJapanese) {
      if (mode === "word-en-ja" || mode === "word-ja-en") {
        return word.ja;
      } else {
        return word.seJa;
      }
    } else {
      if (mode === "word-en-ja" || mode === "word-ja-en") {
        return word.en;
      } else {
        return word.seEn;
      }
    }
  };

  const getTitleMessage = () => {
    switch (mode) {
      case "word-en-ja":
        return "英単語を見て、日本語がすぐに言えるようになろう。";
      case "word-ja-en":
        return "日本語を見て、英単語がすぐに言えるようになろう。";
      case "sentence-en-ja":
        return "英文を見て、日本語に即座に訳せるようにしよう。";
      case "sentence-ja-en":
        return "日本語を見て、英文を即座に作れるようにしよう。";
      default:
        return;
    }
  };

  const handleBack = () => {
    router.push("/ModeSelect");
  };

  const handleToggleAutoSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasSpokenOnce) {
      setIsAutoSpeak((prev) => !prev);
    }
  };

  const getTimeBarColor = (percent: number) => {
    if (percent > 66) return "bg-green-300/70"; // 柔らかい緑
    if (percent > 33) return "bg-yellow-300/70"; // 柔らかい黄
    return "bg-red-300/70"; // 柔らかい赤
  };

  const ListNameLabels: Record<Exclude<ListName, null>, string> = {
    Beginner: "初級",
    Intermediate: "中級",
    Advanced: "上級",
  };

  return (
    <div className="h-[100dvh] bg-gradient-to-br from-sky-50 to-blue-100 flex flex-col items-center relative pb-20 sm:pb-20">
      {/* 🔙 戻るボタン */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-blue-600 hover:text-blue-800 text-sm is:text-lg sm:text-xl font-semibold flex items-center space-x-1"
      >
        <span>←戻る</span>
      </button>

      {/* 🧠 タイトルとリスト名 */}
      <div className="mt-10 text-center space-y-2">
        <div className="inline-block bg-indigo-100 text-indigo-800 text-base is:text-xl sm:text-base px-4 py-1 rounded-2xl font-semibold">
          {listName && ListNameLabels[listName]} 50単語
        </div>
        <h1 className="mt-2 is:mt-4 text-xs is:text-sm im:text-base sm:text-3xl md:text-4xl font-bold text-gray-700 px-4">
          {getTitleMessage()}
        </h1>
      </div>

      {/* 📦 単語カード */}
      {word ? (
        <>
          <div
            onClick={handleCardClick}
            className={`relative w-[90dvw] max-w-xl h-[60dvh] sm:h-[50dvh] mt-4 is:mt-10 rounded-3xl shadow-2xl p-6 sm:p-10 text-center text-2xl sm:text-3xl font-bold cursor-pointer select-none flex items-center justify-center transition-all
    ${
      buttonPressed === "know"
        ? "bg-green-200"
        : buttonPressed === "dontKnow"
        ? "bg-red-200 "
        : "bg-white text-black"
    }`}
          >
            {method === "test" && (
              <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 rounded-t-3xl overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 ${getTimeBarColor(
                    timeLeft
                  )}`}
                  style={{ width: `${timeLeft}%` }}
                />
              </div>
            )}

            {/* 🔊 音声ボタン（右上） */}
            {method !== "test" && (
              <div className="absolute top-4 right-4">
                <GiSpeaker
                  className={`text-2xl sm:text-3xl ${
                    isSpeaking
                      ? "text-red-500 cursor-not-allowed"
                      : "text-red-300 hover:text-red-500 cursor-pointer"
                  }`}
                  title={isSpeaking ? "再生中…" : "音声を再生"}
                  onClick={handleSpeakerClick}
                />
              </div>
            )}

            {/* ♾️ 常時読み上げボタン（右下） */}
            {method !== "test" && (
              <div className="absolute bottom-4 right-4">
                <IoInfiniteOutline
                  className={`text-2xl sm:text-3xl transition cursor-pointer
        ${!hasSpokenOnce ? "text-gray-300 cursor-not-allowed" : ""}
        ${
          hasSpokenOnce && isAutoSpeak
            ? "text-blue-500"
            : "text-gray-400 hover:text-gray-600"
        }
      `}
                  title={
                    !hasSpokenOnce
                      ? "まずは一度スピーカーをタップしてください"
                      : isAutoSpeak
                      ? "常時読み上げON"
                      : "常時読み上げOFF"
                  }
                  onClick={handleToggleAutoSpeak}
                />
              </div>
            )}

            {/* 🔍 検索ボタン群 */}
            {method !== "test" && (
              <div className="absolute top-4 left-4 flex flex-col space-y-3">
                <MdImageSearch
                  onClick={(e) => handleSearch(e, "image")}
                  className="text-2xl sm:text-3xl text-sky-600 hover:text-sky-800 cursor-pointer"
                  title="画像検索"
                />
                <BiBookOpen
                  onClick={(e) => handleSearch(e, "example")}
                  className="text-2xl sm:text-3xl text-emerald-600 hover:text-emerald-800 cursor-pointer"
                  title="例文検索"
                />
                <BiSearchAlt2
                  onClick={(e) => handleSearch(e, "etym")}
                  className="text-2xl sm:text-3xl text-purple-600 hover:text-purple-800 cursor-pointer"
                  title="語源検索"
                />
              </div>
            )}

            {/* 🎓 習熟度ラベル */}
            <div
              className={`absolute bottom-4 left-4 text-sm sm:text-sm px-3 py-1 rounded-full backdrop-blur-sm ${
                levelStyles[word.level] || "bg-gray-300/80 text-gray-800"
              }`}
            >
              {word.level === 11 ? "👑 習熟度：11" : `習熟度：${word.level}`}
            </div>

            {/* 📖 中央表示 */}
            <span className="break-words">{getDisplayText()}</span>
          </div>

          {/* ✅ 回答ボタン */}
          <div className="flex flex-col sm:flex-row justify-center items-center w-full max-w-md mt-4 is:mt-8 gap-4 px-4">
            <button
              onClick={() => handleAnswer("dontKnow")}
              disabled={!!buttonPressed || isSpeaking}
              className={`w-full sm:w-1/2 py-2 im:py-4 text-base sm:text-lg font-semibold text-white rounded-xl shadow-md bg-red-500 hover:bg-red-600 transition ${
                buttonPressed || isSpeaking ? "opacity-50" : ""
              }`}
            >
              わからない
            </button>
            <button
              onClick={() => handleAnswer("know")}
              disabled={!!buttonPressed || isSpeaking}
              className={`w-full sm:w-1/2 py-2 im:py-4 text-base sm:text-lg font-semibold text-white rounded-xl shadow-md bg-green-500 hover:bg-green-600 transition ${
                buttonPressed || isSpeaking ? "opacity-50" : ""
              }`}
            >
              わかる
            </button>
          </div>

          {/* 📊 フッターの進捗バー */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md px-6 py-3 border-t border-gray-200">
            <div className="max-w-4xl mx-auto">
              <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(current / words.length) * 100}%` }}
                />
              </div>
              <div className="text-right text-sm mt-1 text-gray-600">
                {current} / {words.length} 単語完了
              </div>
            </div>
          </div>
        </>
      ) : (
        // ❗ 単語が存在しない場合の表示
        <p className="text-xl text-gray-600">単語がありません</p>
      )}
    </div>
  );
}
