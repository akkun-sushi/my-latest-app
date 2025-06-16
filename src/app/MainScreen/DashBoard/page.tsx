"use client";

import Sidebar from "@/app/components/Sidebar";

import { LoadingScreen } from "@/app/components/LoadingScreen";
import { useState } from "react";
import dynamic from "next/dynamic";

// 動的インポート（必要に応じて）
const Chart = dynamic(() => import("./components/Chart"), { ssr: false });
const Calendar = dynamic(() => import("./components/Calendar"), {
  ssr: false,
});

export default function Dashboard() {
  const [chartLoaded, setChartLoaded] = useState(false);
  const [calendarLoaded, setCalendarLoaded] = useState(false);

  const isLoading = !(chartLoaded && calendarLoaded);

  return (
    <>
      {isLoading && <LoadingScreen />}

      <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-white">
        {/* 📚 サイドバー */}
        {!isLoading && <Sidebar isFixed={false} />}

        {/* 📊 メインコンテンツ */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
            {/* ヘッダー */}
            <header className="flex flex-col sm:flex-row ml-4 items-center sm:justify-between gap-2 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide">
                学習ダッシュボード
              </h1>
              <span className="text-sm sm:text-base md:text-lg font-medium text-white/70">
                学習状況をビジュアルで確認
              </span>
            </header>

            {/* グリッドレイアウト */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
              <Chart onLoaded={() => setChartLoaded(true)} />
              <Calendar onLoaded={() => setCalendarLoaded(true)} />
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
