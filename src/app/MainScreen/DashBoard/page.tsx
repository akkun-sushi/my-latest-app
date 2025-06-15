"use client";

import Sidebar from "@/app/components/Sidebar";
import Calendar from "./components/Calendar";
import Chart from "./components/Chart";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      {/* 📚 サイドバー */}
      <Sidebar />

      {/* 📊 メインコンテンツ */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* ヘッダー */}
          <header className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-wide">
              学習ダッシュボード
            </h1>
            <span className="text-lg font-bold text-white/70">
              学習状況をビジュアルで確認
            </span>
          </header>

          {/* コンテンツ */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 rounded-2xl shadow-lg p-6 transition-transform duration-300">
              <h2 className="text-xl font-semibold mb-4">📈 チャンク進捗</h2>
              <Chart />
            </div>
            <div className="bg-white/10 rounded-2xl shadow-lg p-6 transition-transform duration-300">
              <h2 className="text-xl font-semibold mb-4">🗓 学習カレンダー</h2>
              <Calendar />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
