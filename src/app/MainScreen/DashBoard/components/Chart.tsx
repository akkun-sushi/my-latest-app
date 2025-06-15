"use client";

import { getToday } from "@/app/hooks/dateUtils";
import { fetchFromLocalStorage } from "@/app/hooks/fetchFromLocalStorage";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// 動的インポートでもOKだが、Chart全体をクライアント扱いにする方が安全
const LearningLineChart = dynamic(() => import("./LearningLineChart"), {
  ssr: false,
}); 

const Chart = () => {
  const [daysStudied, setDaysStudied] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const today = getToday();

    const { userData } = fetchFromLocalStorage();
    if (!userData) return;

    const progress = userData.progress ?? {};
    const dates = Object.keys(progress);
    setDaysStudied(dates.length);

    const dateSet = new Set(dates);
    let count = 0;
    const current = new Date(today);

    while (true) {
      const yyyy_mm_dd = current.toISOString().slice(0, 10);
      if (dateSet.has(yyyy_mm_dd)) {
        count++;
        current.setDate(current.getDate() - 1); // 1日ずつ戻る
      } else {
        break;
      }
    }

    setStreak(count);
  }, []);

  return (
    <div className="bg-gray-900 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-semibold mb-4">📊 学習統計</h2>
      <p className="mb-2">📅 勉強日数：{daysStudied}日</p>
      <p className="mb-2">🔥 継続記録：{streak}日連続</p>
      <div className="w-full h-96 flex items-center justify-center">
        <LearningLineChart />
      </div>
    </div>
  );
};

export default Chart;
