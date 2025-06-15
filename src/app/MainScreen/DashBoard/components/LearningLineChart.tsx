"use client";

import { getToday } from "@/app/hooks/dateUtils";
import { fetchFromLocalStorage } from "@/app/hooks/fetchFromLocalStorage";
import { useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function LearningLineChart() {
  const [viewMode, setViewMode] = useState<"4days" | "4weeks" | "4months">(
    "4days"
  );

  const getFilteredData = () => {
    const { userData } = fetchFromLocalStorage();

    // ダミーデータ処理は先に処理
    if (!userData || !userData.progress) {
      if (viewMode === "4days") {
        const today = new Date();
        return [...Array(4)].map((_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - (3 - i));
          return {
            date: `${date.getMonth() + 1}/${date.getDate()}`,
            learnCount: 0,
            reviewCount: 0,
          };
        });
      }

      if (viewMode === "4weeks") {
        return ["3週間前", "2週間前", "1週間前", "今週"].map((label) => ({
          date: label,
          learnCount: 0,
          reviewCount: 0,
        }));
      }

      if (viewMode === "4months") {
        const today = new Date();
        return [...Array(4)].map((_, i) => {
          const d = new Date(today);
          d.setMonth(today.getMonth() - (3 - i));
          return {
            date: `${d.getMonth() + 1}月`,
            learnCount: 0,
            reviewCount: 0,
          };
        });
      }

      return [];
    }

    // ✅ baseData を定義
    const baseData = Object.entries(userData.progress).map(
      ([date, { learnCount, reviewCount }]) => ({
        date,
        learnCount,
        reviewCount,
      })
    );

    if (viewMode === "4days") {
      const endDate = new Date(getToday()); // ← 「今日」から計算
      const result = [];

      for (let i = 3; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(endDate.getDate() - i);

        const yyyy_mm_dd = date.toISOString().slice(0, 10); // "YYYY-MM-DD"
        const shortDate = `${date.getMonth() + 1}/${date.getDate()}`; // "8/1"など

        const match = baseData.find((d) => d.date === yyyy_mm_dd);

        result.push({
          date: shortDate,
          learnCount: match?.learnCount ?? 0,
          reviewCount: match?.reviewCount ?? 0,
        });
      }

      return result;
    } else if (viewMode === "4weeks") {
      const endDate = new Date(getToday()); // ← 「今日」から計算
      const result = [];

      const labels = ["3週間前", "2週間前", "1週間前", "今週"];

      for (let i = 4; i >= 1; i--) {
        const weekStart = new Date(endDate);
        weekStart.setDate(endDate.getDate() - i * 7 + 1);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const weekTotal = {
          date: labels[4 - i], // ← ラベル名を使う
          learnCount: 0,
          reviewCount: 0,
        };

        for (const d of baseData) {
          const dDate = new Date(d.date);
          if (dDate >= weekStart && dDate <= weekEnd) {
            weekTotal.learnCount += d.learnCount;
            weekTotal.reviewCount += d.reviewCount;
          }
        }

        result.push(weekTotal);
      }

      return result;
    } else if (viewMode === "4months") {
      const latestDate = new Date(getToday());
      const fourMonthsAgo = new Date(latestDate);
      fourMonthsAgo.setDate(latestDate.getDate() - 120); // ← 4ヶ月前に変更

      const monthlyTotals = new Map<
        string,
        { date: string; learnCount: number; reviewCount: number }
      >();

      const getJapaneseMonth = (monthNumber: number) => `${monthNumber + 1}月`;

      for (const entry of baseData) {
        const entryDate = new Date(entry.date);
        if (entryDate < fourMonthsAgo || entryDate > latestDate) continue;

        const year = entryDate.getFullYear();
        const month = entryDate.getMonth();

        const key = `${year}-${month}`;

        if (!monthlyTotals.has(key)) {
          monthlyTotals.set(key, {
            date: getJapaneseMonth(month),
            learnCount: 0,
            reviewCount: 0,
          });
        }

        const total = monthlyTotals.get(key)!;
        total.learnCount += entry.learnCount;
        total.reviewCount += entry.reviewCount;
      }

      const result: {
        date: string;
        learnCount: number;
        reviewCount: number;
      }[] = [];

      for (let i = 3; i >= 0; i--) {
        // ← ここを 5 → 3 に
        const d = new Date(latestDate);
        d.setMonth(d.getMonth() - i);

        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const defaultMonth = {
          date: getJapaneseMonth(d.getMonth()),
          learnCount: 0,
          reviewCount: 0,
        };

        result.push(monthlyTotals.get(key) ?? defaultMonth);
      }

      return result;
    }

    return baseData;
  };

  return (
    <div className="mt-4 w-full ">
      <div className="flex justify-end mb-2 mr-4">
        <label className="mr-2 pt-1 font-semibold text-gray-200">
          表示範囲：
        </label>
        <select
          value={viewMode}
          onChange={(e) =>
            setViewMode(e.target.value as "4days" | "4weeks" | "4months")
          }
          className="bg-gray-800 text-white border border-gray-600 rounded-md px-3 py-1"
        >
          <option value="4days">直近4日間（日ごと）</option>
          <option value="4weeks">直近4週間（週ごと）</option>
          <option value="4months">直近4ヶ月（月ごと）</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={getFilteredData()}
          margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
        >
          <CartesianGrid />
          <XAxis dataKey="date" interval={0} tickMargin={10} />
          <YAxis width={20} tickMargin={5} />
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: 10 }}
          />
          <Line
            type="monotone"
            dataKey="learnCount"
            name="学習回数"
            stroke="#8884d8"
            strokeWidth={3}
          />
          <Line
            type="monotone"
            dataKey="reviewCount"
            name="復習回数"
            stroke="#82ca9d"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
