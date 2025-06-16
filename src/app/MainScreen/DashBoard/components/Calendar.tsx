"use client";

import { useEffect, useState } from "react";
import { fetchFromLocalStorage } from "@/app/hooks/fetchFromLocalStorage";
import { format, startOfMonth, getDay, endOfMonth, isToday } from "date-fns";
import { getToday } from "@/app/hooks/dateUtils";

type Day = {
  date: Date;
  isCurrentMonth: boolean;
  studied: boolean;
  learnCount: number;
  reviewCount: number;
};

type Props = {
  onLoaded: () => void;
};

export default function Calendar({ onLoaded }: Props) {
  const [calendar, setCalendar] = useState<Day[]>([]);
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);

  useEffect(() => {
    const today = getToday(); // CSR時にのみ取得
    const [yearStr, monthStr] = today.split("-");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    setYear(year);
    setMonth(month);
  }, []);

  const titleMonth = `${year}年${month}月`; // parseIntで先頭0を自動で消す

  useEffect(() => {
    const { userData } = fetchFromLocalStorage();
    if (!userData) {
      onLoaded(); // 読み込み失敗でも呼ぶ
      return;
    }

    const firstDayOfMonth = startOfMonth(new Date(year, month - 1));
    const lastDayOfMonth = endOfMonth(firstDayOfMonth);

    const startWeekDay = getDay(firstDayOfMonth); // 0 (Sun) - 6 (Sat)
    const daysInMonth = lastDayOfMonth.getDate();

    // カレンダーデータ作成
    const days: Day[] = [];

    // 🔽 1. 前月の空白セル
    for (let i = 0; i < startWeekDay; i++) {
      days.push({
        date: new Date(0),
        isCurrentMonth: false,
        studied: false,
        learnCount: 0,
        reviewCount: 0,
      });
    }

    // 🔽 2. 当月の日付
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const yyyy_mm_dd = format(date, "yyyy-MM-dd");
      const dayProgress = userData.progress?.[yyyy_mm_dd]; // ← Record型なのでfindは不要！

      days.push({
        date,
        isCurrentMonth: true,
        studied: Boolean(dayProgress),
        learnCount: dayProgress?.learnCount ?? 0,
        reviewCount: dayProgress?.reviewCount ?? 0,
      });
    }

    // 🔽 3. 後ろに空白セル追加（全体を6週間=42日分に）
    while (days.length < 42) {
      days.push({
        date: new Date(0),
        isCurrentMonth: false,
        studied: false,
        learnCount: 0,
        reviewCount: 0,
      });
    }

    setCalendar(days);
    onLoaded(); // ✅ 完了通知
  }, [year, month]);

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 2); // JSは0始まりなので -2
    setYear(newDate.getFullYear());
    setMonth(newDate.getMonth() + 1);
  };

  const handleNextMonth = () => {
    const newDate = new Date(year, month); // 現在の月 +1
    setYear(newDate.getFullYear());
    setMonth(newDate.getMonth() + 1);
  };

  return (
    <div className="bg-white/10 rounded-2xl shadow-lg p-4 sm:p-6 transition-transform duration-300 text-white w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4 text-center sm:text-left">
        <h2 className="text-2xl font-bold">📆 学習カレンダー</h2>

        <div className="flex items-center gap-4 justify-center sm:justify-end w-full sm:w-auto">
          <button
            onClick={handlePrevMonth}
            className="text-xs md:text-base text-indigo-300 hover:text-white transition"
          >
            ◀ 前の月
          </button>

          <p className="text-lg font-semibold text-indigo-300 w-[7rem] text-center">
            {titleMonth}
          </p>

          <button
            onClick={handleNextMonth}
            className="text-xs md:text-base text-indigo-300 hover:text-white transition"
          >
            次の月 ▶
          </button>
        </div>
      </div>

      {/* 曜日見出し */}
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-indigo-300 border-b border-indigo-600 pb-2 mb-2">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* カレンダー本体 */}
      <div className="grid grid-cols-7 text-center text-sm gap-1">
        {calendar.map((day, i) => {
          const isTodayDate = isToday(day.date);
          const dateNum = day.date.getDate();
          const key = format(day.date, "yyyy-MM-dd"); // ← 一意なキーとして使える

          if (!day.isCurrentMonth) {
            return <div key={`empty-${i}`} className="aspect-square"></div>;
          }

          return (
            <div key={key} className="relative group">
              <div
                className={`aspect-square flex items-center justify-center border border-gray-700 transition-all duration-200
          ${
            day.studied ? "bg-indigo-500 text-white font-bold" : "text-gray-300"
          }
          ${isTodayDate ? "outline-2 outline-pink-400" : ""}
          hover:scale-105 hover:brightness-110 rounded-md`}
              >
                {dateNum}
              </div>

              {(day.learnCount > 0 || day.reviewCount > 0) && (
                <div className="absolute z-10 hidden group-hover:block left-1/2 top-full -translate-x-1/2 mt-2 px-4 py-2 text-xs bg-gray-600 text-white rounded shadow whitespace-nowrap">
                  学習: {day.learnCount}回 <br /> 復習: {day.reviewCount}回
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
