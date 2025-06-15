"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToday } from "../hooks/dateUtils";
import { supabase } from "../../../lib/supabaseClient";
import { initializeFromSupabase } from "../hooks/initializeFromSupabase";
import { fetchFromLocalStorage } from "../hooks/fetchFromLocalStorage";
import { useUserData } from "../hooks/useUserData";

// 📌 モーダルのプロパティ型定義
type PlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  redirectPath: string;
};

// 🚀 プラン選択とニックネーム登録を担うモーダルコンポーネント
export const PlanModal = ({
  isOpen,
  onClose,
  redirectPath,
}: PlanModalProps) => {
  const router = useRouter();
  const { insertUserData } = useUserData();

  // 📌 モーダル内のステート
  const [selectedPlan, setSelectedPlan] = useState<3 | 5 | 9 | null>(null);
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [step, setStep] = useState<"select" | "nickname">("select"); // 2ステップ：プラン選択 → ニックネーム入力

  const tag = "yopio"; // ✅ 学習テーマ（今後変更する場合はここ）

  /**
   * ✅ プランが選択されたときの処理
   * - Supabaseの初期化
   * - 確認ダイアログ表示
   * - ステップを「ニックネーム入力」に進める
   */
  const handleSelectPlan = (days: 3 | 5 | 9) => {
    initializeFromSupabase(tag); // 初期化（学習計画生成など）

    const confirmed = window.confirm(
      "一度開始するとプランの変更はできません。このプランで始めますか？"
    );
    if (!confirmed) return;
    setSelectedPlan(days);
    setStep("nickname");
  };

  /**
   * ✅ ニックネーム入力のバリデーションと送信処理
   * - ニックネームチェック
   * - 匿名ログイン
   * - ユーザーデータの作成・保存（LocalStorage & Supabase）
   * - リダイレクト
   */
  const handleNicknameSubmit = async () => {
    const { userData } = fetchFromLocalStorage();
    if (!userData || !selectedPlan) return;

    // バリデーション
    if (!nickname.trim()) {
      setNicknameError("ニックネームを入力してください");
      return;
    }
    if (nickname.length > 10) {
      setNicknameError("ニックネームは10文字以内で入力してください");
      return;
    }
    if (/[^a-zA-Z0-9\u3040-\u30FF\u4E00-\u9FFF]/.test(nickname)) {
      setNicknameError("ニックネームには特殊記号は使用できません");
      return;
    }

    // 匿名ログイン（Supabase）
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      alert("ログインに失敗しました");
      return;
    }

    // 保存用ユーザーデータ構築
    const updatedUserData = {
      userId: data.user.id,
      userName: nickname,
      createdAt: getToday(),
      tag,
      learningPlan: {
        ...userData.learningPlan,
        durationDays: selectedPlan,
      },
      progress: userData.progress,
    };

    // Supabaseに保存
    try {
      await insertUserData(updatedUserData);
      console.log("✅ Supabaseへのユーザーデータ保存に成功:", updatedUserData);
    } catch (error) {
      console.error("❌ Supabaseへのユーザーデータ保存に失敗:", error);
    }

    // メイン画面に遷移
    router.push(redirectPath);
  };

  /**
   * ✅ モーダルが開いている間はスクロールを無効にする
   */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // モーダルが閉じていれば描画しない
  if (!isOpen) return null;

  // 📌 プラン定義（表示用）
  const plans = [
    {
      label: "🔥 3日プラン",
      bg: "bg-red-50",
      border: "border-red-300",
      days: [
        ["1日目", "新出", "1〜100"],
        ["2日目", "復習", "1〜100"],
        ["3日目", "テスト", "1〜100"],
      ],
      features: "短期集中で一気にマスター！",
      daysCount: 3,
    },
    {
      label: "📚 5日プラン",
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      days: [
        ["1日目", "新出 (1)", "1〜50"],
        ["2日目", "新出 (2)", "51〜100"],
        ["3日目", "復習 (1)", "1〜50"],
        ["4日目", "復習 (2)", "51〜100"],
        ["5日目", "テスト", "1〜100"],
      ],
      features: "毎日着実にステップアップ！",
      daysCount: 5,
    },
    {
      label: "✨ 9日プラン",
      bg: "bg-blue-50",
      border: "border-blue-300",
      days: [
        ["1日目", "新出 (1)", "1〜25"],
        ["2日目", "新出 (2)", "25〜50"],
        ["3日目", "新出 (3)", "50〜75"],
        ["4日目", "新出 (4)", "75〜100"],
        ["5日目", "復習 (1)", "0〜25"],
        ["6日目", "復習 (2)", "25〜50"],
        ["7日目", "復習 (3)", "50〜75"],
        ["8日目", "復習 (4)", "75〜100"],
        ["9日目", "テスト", "1〜100"],
      ],
      features: "分散学習で記憶に残る9日間！",
      daysCount: 9,
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <div
        className={`bg-white text-black rounded-2xl p-4 md:p-6 shadow-2xl overflow-y-auto relative ${
          step === "nickname"
            ? "w-full max-w-md"
            : "w-full max-w-4xl max-h-[80dvh]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative pt-4 space-y-6 pb-4">
          {/* ✅ タイトル：ステップに応じて変化 */}
          <h4 className="text-xl md:text-2xl font-semibold text-gray-800 text-center">
            {step === "select"
              ? "🎯 学習プランを選びましょう！"
              : "📝 ニックネームを入力してください"}
          </h4>

          {/* ✅ プラン選択ステップ */}
          {step === "select" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-8">
              {plans.map((plan) => (
                <div
                  key={plan.label}
                  className={`relative p-4 rounded-xl shadow-md border ${plan.border} ${plan.bg} flex flex-col justify-between`}
                >
                  {/* 👑 おすすめバッジ */}
                  {plan.daysCount === 5 && (
                    <span className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                      おすすめ
                    </span>
                  )}

                  {/* プランラベル */}
                  <h5 className="text-lg font-bold text-indigo-700 mb-2">
                    {plan.label}
                  </h5>

                  {/* 日程テーブル */}
                  <table className="text-sm w-full border border-gray-300 rounded overflow-hidden mb-2">
                    <thead>
                      <tr className="bg-gray-200 text-gray-700">
                        <th className="py-1 px-2 border">日</th>
                        <th className="py-1 px-2 border">内容</th>
                        <th className="py-1 px-2 border">範囲</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.days.map(([day, task, range]) => (
                        <tr key={day}>
                          <td className="py-1 px-2 border">{day}</td>
                          <td className="py-1 px-2 border">{task}</td>
                          <td className="py-1 px-2 border">{range}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* プランの特徴 */}
                  <p className="text-lg md:text-xl text-gray-800 font-semibold italic mt-2 mb-4 px-1">
                    {plan.features}
                  </p>

                  {/* 選択ボタン */}
                  <button
                    onClick={() =>
                      handleSelectPlan(plan.daysCount as 3 | 5 | 9)
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 px-4 rounded-xl transition"
                  >
                    このプランで始める
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ✅ ニックネーム入力ステップ */}
          {step === "nickname" && (
            <div className="flex flex-col items-center space-y-6 px-4 mt-6">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full max-w-sm px-4 py-2 border-2 border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ニックネーム（10文字以内）"
              />
              {nicknameError && (
                <p className="text-red-500 text-sm">{nicknameError}</p>
              )}

              {/* ボタン群 */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setStep("select")}
                  className="text-gray-600 border border-gray-400 px-6 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  ← 戻る
                </button>

                <button
                  onClick={handleNicknameSubmit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xl px-8 py-4 rounded-xl shadow transition"
                >
                  学習を始める
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
