"use client";

import { useEffect, useRef, useState } from "react";
import { SenseStatus, WordWithSenses } from "../../../types/WordSensesList";
import { fetchFromLocalStorage } from "../hooks/fetchFromLocalStorage";

const getLevelStyle = (level: number): string => {
  if (level >= 3) {
    return "bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600";
  }

  const levelStyles: Record<number, string> = {
    0: "bg-slate-600",
    1: "bg-gradient-to-r from-sky-300 via-blue-300 to-blue-400",
    2: "bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500",
  };

  return levelStyles[level] ?? "bg-slate-400"; // デフォルトスタイル
};

type ProgressSegmentProps = {
  width: number;
  className: string;
};

const ProgressSegment = ({ width, className }: ProgressSegmentProps) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (el) {
      el.style.width = "0%";
      requestAnimationFrame(() => {
        el.style.transition = "width 0.7s ease-out";
        el.style.width = `${width}%`;
      });
    }
  }, [width]);

  return <div ref={barRef} className={`h-full ${className}`} />;
};

type Props = {
  index: number;
  textColor?: string;
};

export default function ProgressBar({
  index,
  textColor = "text-gray-300",
}: Props) {
  const [words, setWords] = useState<WordWithSenses[] | null>(null);
  const [statuses, setStatuses] = useState<SenseStatus[] | null>(null);

  useEffect(() => {
    const { chunkedWords, chunkedStatuses } = fetchFromLocalStorage();
    setWords(chunkedWords?.[index] ?? null);
    setStatuses(chunkedStatuses?.[index] ?? null);
  }, [index]);

  if (!words || !statuses) return null;

  const totalCount = words.length;

  // 単語ごとに最大のレベルを取得（複数senseがあるため）
  const wordLevels = words.map((word) => {
    const levels = word.senses.map((sense) => {
      const status = statuses.find((s) => s.senses_id === sense.senses_id);
      return status?.level ?? 0;
    });
    return Math.max(...levels, 0); // senseがなくても0にしておく
  });

  // レベルごとの数を集計（3以上はすべて3にまとめる）
  const levelCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  wordLevels.forEach((level) => {
    const cappedLevel = Math.min(level, 3); // 3以上を3にまとめる
    levelCounts[cappedLevel] = (levelCounts[cappedLevel] || 0) + 1;
  });

  // パーセンテージを算出
  const levelPercents: Record<number, number> = {
    0: totalCount > 0 ? (levelCounts[0] / totalCount) * 100 : 0,
    1: totalCount > 0 ? (levelCounts[1] / totalCount) * 100 : 0,
    2: totalCount > 0 ? (levelCounts[2] / totalCount) * 100 : 0,
    3: totalCount > 0 ? (levelCounts[3] / totalCount) * 100 : 0,
  };

  // ラベルと色のロジックを分けて定義
  let statusLabel = "";
  let statusColor = "";
  let displayCount = 0;

  if (levelCounts[3] === totalCount) {
    statusLabel = "学習済み";
    statusColor = "text-yellow-600";
    displayCount = levelCounts[3];
  } else if (levelCounts[2] > 0) {
    statusLabel = "アウトプット完了";
    statusColor = "text-pink-500";
    displayCount = levelCounts[2];
  } else if (levelCounts[1] > 0) {
    statusLabel = "インプット完了";
    statusColor = "text-blue-400";
    displayCount = levelCounts[1];
  } else {
    statusLabel = "未習";
    statusColor = "text-slate-600";
    displayCount = 0;
  }

  // 表示する単語数（ラベルと一緒に出す用）
  displayCount =
    statusLabel === "学習済み"
      ? levelCounts[3]
      : statusLabel === "アウトプット完了"
      ? levelCounts[2]
      : statusLabel === "インプット完了"
      ? levelCounts[1]
      : 0;

  return (
    <div>
      <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden flex">
        {[3, 2, 1, 0].map((level) => {
          const width = levelPercents[level] ?? 0;
          if (width === 0) return null;
          return (
            <ProgressSegment
              key={level}
              width={width}
              className={getLevelStyle(level)}
            />
          );
        })}
      </div>
      <p className={`text-sm font-semibold mt-2 ${textColor}`}>
        進捗：<span className={statusColor}>{statusLabel}</span> {displayCount}{" "}
        / {totalCount} 単語
      </p>
    </div>
  );
}
