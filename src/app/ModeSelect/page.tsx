"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { LearnSettings, Word } from "../../../types/WordList";

const LEVEL_RANGES = [
  { label: "初級（習熟度1〜3）", range: [1, 2, 3] },
  { label: "中級（習熟度4〜6）", range: [4, 5, 6] },
  { label: "上級（習熟度7〜8）", range: [7, 8] },
  { label: "マスター（習熟度9〜10）", range: [9, 10] },
  { label: "達人（習熟度11）", range: [11] },
];

const getAllLevels = (): { [key: number]: boolean } => {
  return Object.fromEntries(
    Array.from({ length: 11 }, (_, i) => [i + 1, true])
  );
};

export default function ModeSelect() {
  // Next.js のルーターを使用
  const router = useRouter();

  // ローカルステートの定義
  const [words, setWords] = useState<Word[]>([]); // 単語リスト（localStorage用）
  const [showSettings, setShowSettings] = useState(false); // 設定モーダル表示
  const [selectedMinLevel, setSelectedMinLevel] = useState<number | null>(null);

  const [mode, setMode] = useState<
    "word-en-ja" | "word-ja-en" | "sentence-en-ja" | "sentence-ja-en"
  >("word-en-ja");
  const [method, setMethod] = useState<"learn" | "review" | "test">("learn");
  const [order, setOrder] = useState<"default" | "alphabetical" | "random">(
    "default"
  ); // 単語の並び順
  const [levels, setLevels] = useState<{ [key: number]: boolean }>(() =>
    getAllLevels()
  ); // ✅ 習熟度ごとの有効状態を管理

  // 🎯 初回マウント時：localStorageから単語データを読み込む
  useEffect(() => {
    const storedListName = localStorage.getItem("ListName");
    if (storedListName) {
      const parsedListName = JSON.parse(storedListName);

      // 📦 単語データ（WordList）の読み込み処理
      const storedWordList = localStorage.getItem("WordList");

      if (storedWordList) {
        try {
          const parsedWordList = JSON.parse(storedWordList);

          if (parsedWordList && Array.isArray(parsedWordList[parsedListName])) {
            setWords(parsedWordList[parsedListName]);
          }
        } catch (e) {
          console.error("localStorage WordList の解析に失敗しました:", e);
        }
      }
    }
  }, []);

  // 🎯 指定レベル内にすべての単語が収まっているかを判定
  const canAccess = (
    minLevel: number,
    words: Word[],
    maxLevel?: number // ← オプション引数
  ): boolean => {
    if (!words || words.length === 0) return false;
    return words.every((w) => {
      if (maxLevel !== undefined) {
        return w.level >= minLevel && w.level <= maxLevel;
      }
      return w.level >= minLevel;
    });
  };

  useEffect(() => {
    if (selectedMinLevel !== null) {
      if (canAccess(selectedMinLevel, words, selectedMinLevel)) {
        setMethod("test");
      } else if (canAccess(selectedMinLevel, words)) {
        setMethod("review");
      } else {
        setMethod("learn");
      }
    }
  }, [selectedMinLevel, words]);

  useEffect(() => {
    if (method === "test") {
      setOrder("random");
      setLevels(getAllLevels());
    } else if (method === "review") {
      setLevels(getAllLevels());
    }
  }, [method]);

  useEffect(() => {
    if (showSettings) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSettings]);

  // 🎯 学習を開始するときの処理
  const handleStart = () => {
    try {
      // ✅ 現在の設定をオブジェクトにまとめる
      const settings: LearnSettings = {
        mode,
        method,
        order,
        levels,
      };

      // ✅ 有効なレベル一覧を取得（例: [1, 3]）
      const allowedLevels = Object.entries(levels)
        .filter(([, val]) => val)
        .map(([key]) => Number(key));

      // ✅ 有効レベルに該当する単語だけを抽出
      const matchingWords = words.filter((word) =>
        allowedLevels.includes(word.level)
      );

      // ✅ 該当する単語がなければアラート
      if (matchingWords.length === 0) {
        alert("選択されたレベルに該当する単語が見つかりません。");
        return;
      }

      // ✅ 設定をlocalStorageに保存
      localStorage.setItem("LearnSettings", JSON.stringify(settings));

      // ✅ モーダルを閉じる
      setShowSettings(false);

      // ✅ 学習ページへ遷移
      router.push("/Learn");
    } catch (err) {
      console.error("設定の保存に失敗しました:", err);
      alert("設定の保存に失敗しました。もう一度お試しください。");
    }
  };

  // ✅ 学習済みの単語数をカウント
  const learnedCount = words.filter((word) => word.learnedAt).length;

  // ✅ プログレスバー（最大50で丸める）
  const progress = (Math.min(learnedCount, 50) / 50) * 100;

  const getProgressBarColor = (words: Word[]): string => {
    if (words.length === 0) return "from-gray-300 to-gray-400";

    const levels = words.map((w) => w.level);
    const minLevel = Math.min(...levels);

    if (minLevel >= 9) return "from-yellow-500 to-orange-400";
    if (minLevel >= 7) return "from-emerald-500 to-teal-400";
    if (minLevel >= 4) return "from-pink-500 to-rose-400";
    return "from-indigo-500 to-sky-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-100 to-white py-4 px-4">
      <div className="max-w-4xl mx-auto">
        {/* タイトル＆進捗 */}
        <header className="sticky top-0 z-50 bg-white/30 backdrop-blur-xl shadow-md px-6 py-4 rounded-b-2xl border-b border-gray-200">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <span onClick={() => router.push("/")} className="text-3xl">
              📚
            </span>
            <span className="font-sans">英単語学習</span>
            <span className="font-sans">初級編</span>
          </h1>
        </header>
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
          <p className="mt-2 text-lg text-gray-500 font-medium">
            楽しく、効率よく、言葉の力を伸ばそう！
          </p>
          {/* 進捗バー */}
          <div className="w-full md:w-64 flex flex-col items-center">
            {/* バー本体 */}
            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner mb-1">
              <div
                className={`h-4 rounded-full transition-all bg-gradient-to-r ${getProgressBarColor(
                  words
                )}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* 表示テキスト */}
            <span className="text-sm font-bold text-gray-600">
              進捗： {learnedCount} / 50 単語
            </span>
          </div>
        </div>

        {/* モード選択ボタン */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 各モードボタンをカード風に */}
          {[
            {
              label: "単語（英→日）",
              desc: "英単語から日本語訳を選ぶ練習モード",
              color: "from-indigo-500 to-sky-400",
              available: canAccess(1, words),
              onClick: () => {
                setMode("word-en-ja");
                setSelectedMinLevel(3);
                if (canAccess(1, words)) setShowSettings(true);
              },
            },
            {
              label: "単語（日→英）",
              desc: "日本語から英単語を思い出す応用モード",
              color: "from-pink-500 to-rose-400",
              available: canAccess(4, words),
              onClick: () => {
                setMode("word-ja-en");
                setSelectedMinLevel(6);
                if (canAccess(4, words)) setShowSettings(true);
              },
            },
            {
              label: "例文（英→日）",
              desc: "英文例から日本語訳を考える実践モード",
              color: "from-emerald-500 to-teal-400",
              available: canAccess(7, words),
              onClick: () => {
                setMode("sentence-en-ja");
                setSelectedMinLevel(8);
                if (canAccess(7, words)) setShowSettings(true);
              },
            },
            {
              label: "例文（日→英）",
              desc: "日本語例文から英訳を練習する上級モード",
              color: "from-yellow-500 to-orange-400",
              available: canAccess(9, words),
              onClick: () => {
                setMode("sentence-ja-en");
                setSelectedMinLevel(10);
                if (canAccess(9, words)) setShowSettings(true);
              },
            },
          ].map((btn) => (
            <button
              key={btn.label}
              disabled={!btn.available}
              onClick={btn.onClick}
              className={`w-full p-6 rounded-2xl shadow-xl transition-transform duration-200
            text-left flex flex-col gap-2 hover:scale-105
            ${
              btn.available
                ? `bg-gradient-to-br ${btn.color} text-white hover:shadow-2xl`
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
            >
              <span className="text-2xl font-bold">{btn.label}</span>
              <span className="text-base">{btn.desc}</span>
            </button>
          ))}
        </section>

        {/* 単語リスト */}
        <section className="bg-white/80 rounded-2xl shadow-lg p-6 mb-8 max-h-[350px] overflow-y-auto">
          <h2 className="text-lg font-semibold text-indigo-700 mb-4">
            単語リスト
          </h2>
          <ul className="grid md:grid-cols-2 gap-4">
            {words.slice(0, 10).map((word) => (
              <li
                key={word.id}
                className="border border-indigo-100 rounded-xl p-3 shadow-sm bg-indigo-50/50 hover:bg-indigo-100 transition"
              >
                <p className="font-bold text-indigo-700">{word.en}</p>
                <p className="text-gray-700 mb-1">{word.ja}</p>
                <p className="text-sm text-gray-600 italic">{word.seEn}</p>
                <p className="text-sm text-gray-500 italic">{word.seJa}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-right text-xs text-gray-400">
            ※冒頭10単語のみ表示
          </p>
        </section>

        {/* モーダル */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl 
             w-[90vw] max-w-lg p-6 space-y-4 relative 
             max-h-[90dvh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="absolute top-6 right-6 cursor-pointer p-2 rounded-full hover:bg-gray-200 transition"
                onClick={() => setShowSettings(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-extrabold text-gray-800 border-b pb-2">
                📘 学習設定
              </h2>

              {/* ✅ メソッド選択 */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-700">メソッド</h3>
                <div className="flex gap-3">
                  {["learn", "review", "test"].map((m) => {
                    const labels = {
                      learn: "学習",
                      review: "復習",
                      test: "テスト",
                    };
                    const colors = {
                      learn: "bg-green-100 text-green-700",
                      review: "bg-blue-100 text-blue-700",
                      test: "bg-red-100 text-red-700",
                    };
                    const isDisabled =
                      m === "test" && !canAccess(selectedMinLevel ?? 0, words);
                    if (
                      m === "learn" &&
                      selectedMinLevel !== null &&
                      canAccess(selectedMinLevel, words)
                    )
                      return null;

                    return (
                      <button
                        key={m}
                        onClick={() => setMethod(m as typeof method)}
                        disabled={isDisabled}
                        className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm transition
                  ${
                    method === m
                      ? colors[m as keyof typeof colors]
                      : "bg-gray-100 text-gray-500"
                  }
                  ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-md"
                  }
                `}
                      >
                        {labels[m as keyof typeof labels]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ✅ 並び順設定（ボタン風） */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-700">単語の順序</h3>
                <div className="flex gap-3 flex-wrap">
                  {[
                    {
                      value: "default",
                      label: "デフォルト",
                      color: "bg-cyan-100 text-cyan-800",
                    },
                    {
                      value: "alphabetical",
                      label: "ABC順",
                      color: "bg-yellow-100 text-yellow-700",
                    },
                    {
                      value: "random",
                      label: "ランダム",
                      color: "bg-purple-100 text-purple-700",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setOrder(
                          opt.value as "default" | "alphabetical" | "random"
                        )
                      }
                      disabled={method === "test"}
                      className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm transition 
          ${order === opt.value ? opt.color : "bg-gray-100 text-gray-500"} 
          ${
            method === "test"
              ? "opacity-50 cursor-not-allowed"
              : "hover:shadow-md"
          }
        `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ✅ 習熟度選択 */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-700">
                  習熟度レベル
                </h3>
                <div className="space-y-2">
                  {LEVEL_RANGES.map(({ label, range }) => {
                    const minLevel = Math.min(...range);
                    const maxLevel = Math.max(...range);
                    if (!canAccess(minLevel, words, maxLevel)) return null;

                    return (
                      <div
                        key={label}
                        className="border rounded-md p-3 bg-white shadow-sm"
                      >
                        <h4 className="font-semibold mb-2 text-gray-700">
                          {label}
                        </h4>
                        <div className="flex flex-col gap-2">
                          {range.map((lv) => {
                            const count = words.filter(
                              (w) => w.level === lv
                            ).length;
                            return (
                              <label
                                key={lv}
                                className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={!!levels[lv]}
                                  onChange={() =>
                                    setLevels((prev) => ({
                                      ...prev,
                                      [lv]: !prev[lv],
                                    }))
                                  }
                                  disabled={method !== "learn"}
                                />
                                <span className="text-sm font-semibold text-gray-800">
                                  <span className="font-bold text-indigo-600 mr-1">
                                    習熟度 {lv}
                                  </span>
                                  <span className="text-gray-500">
                                    （{count}語）
                                  </span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ✅ スタートボタン */}
              <button
                onClick={handleStart}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                🚀 スタート
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 初期化ボタン（画面最下部に自然に配置） */}
      <div className="mt-12 flex justify-end">
        <button
          onClick={() => {
            localStorage.clear();
            router.push("/"); // 初期化後にトップページへ
          }}
          className="bg-red-500 text-white text-xs px-4 py-2 rounded-sm shadow hover:bg-red-600 transition"
          title="全データを初期化"
        >
          初期化
        </button>
      </div>
    </div>
  );
}
