"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlanModal } from "./components/PlanModal";
import { supabase } from "../../lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false); // プラン選択モーダルの開閉
  const [hasUser, setHasUser] = useState(false); // Supabaseに匿名ユーザーが存在するか
  const [loading, setLoading] = useState(true); // 読み込み中かどうか

  /**
   * ✅ ページ読み込み時にユーザーの存在を確認
   * - 匿名ログイン済みかどうか Supabase から取得
   * - ユーザーがいない場合は初回ユーザーと判断し、モーダル表示
   */
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        // ログインしていない（初回ユーザーなど）場合もエラーになる
        console.warn("ユーザー取得に失敗しました（未ログインの可能性）");
        setHasUser(false); // 明示的にfalseをセット
      } else {
        setHasUser(!!data?.user?.id); // ユーザーIDがある＝ログイン済み
      }

      setLoading(false); // ローディング完了
    };

    checkUser();
  }, []);

  /**
   * ✅ スタートボタンを押したときの挙動
   * - ログイン済みならメイン画面へ遷移
   * - まだならモーダルでプラン設定へ
   */
  const handleStartLearning = () => {
    if (!hasUser) {
      setIsModalOpen(true); // 初回はプラン設定モーダルを開く
    } else {
      router.push("/MainScreen"); // 既存ユーザーならすぐ遷移
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-200 to-blue-300 text-gray-900 px-6 py-12 flex flex-col items-center justify-center">
      {/* ✅ タイトル・キャッチコピー */}
      <header className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-md bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          英語学習、次のステージへ。
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-700 leading-relaxed">
          ただの単語アプリじゃない。
          <br />
          覚えた単語、忘れたタイミング、学習のペースまで完全サポート。
          <br />
          自分史上最高の学習体験が、ここにある。
        </p>
      </header>

      {/* ✅ 特徴紹介カード */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-20">
        {[
          [
            "直感的インターフェース",
            "スワイプ感覚で学べるフラッシュカード。学びがもっと軽快に。",
          ],
          [
            "科学的な復習",
            "記憶の波に合わせて、ベストなタイミングでリマインド。",
          ],
          [
            "進化する学習",
            "レベルアップやグラフ表示で、自分の成長を見える化。",
          ],
        ].map(([title, desc]) => (
          <div
            key={title}
            className="bg-white rounded-3xl shadow-xl p-8 text-center hover:scale-105 transition-transform"
          >
            <h2 className="text-2xl font-bold mb-2 text-indigo-700">{title}</h2>
            <p className="text-gray-600">{desc}</p>
          </div>
        ))}
      </section>

      {/* ✅ スタートボタン（読み込み後のみ表示） */}
      {!loading && (
        <button
          onClick={handleStartLearning}
          className="bg-gradient-to-r from-indigo-600 to-purple-500 text-white text-2xl md:text-5xl font-semibold py-4 px-10 rounded-full shadow-xl hover:scale-110 transition-transform"
        >
          {hasUser ? "📈 学習を続ける" : "🚀 今すぐ始める"}
        </button>
      )}

      {/* ✅ 初回ユーザー用のプラン選択モーダル */}
      <PlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        redirectPath={"/MainScreen"}
      />

      {/* ✅ 開発用：localStorage初期化ボタン（あとで消す） */}
      <button
        onClick={() => {
          localStorage.clear();
          alert("🧹 localStorageを初期化しました！");
          window.location.reload();
        }}
        className="fixed bottom-4 right-4 text-xs px-3 py-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600"
      >
        🧪 初期化
      </button>
    </main>
  );
}
