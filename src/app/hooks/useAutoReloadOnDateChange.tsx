"use client";

import { useEffect } from "react";
import { fetchFromLocalStorage } from "@/app/hooks/fetchFromLocalStorage";
import { getToday } from "./dateUtils";

export const useAutoReloadOnDateChange = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      const today = getToday();
      const { todayLearningList, currentChunkStatuses: senseStatuses } =
        fetchFromLocalStorage();

      if (
        !todayLearningList ||
        todayLearningList.length === 0 ||
        !senseStatuses
      )
        return;

      const isTodayListLearnedToday = todayLearningList.some((word: any) =>
        word.senses.some((sense: any) => {
          const status = senseStatuses.find(
            (s) => s.senses_id === sense.senses_id
          );
          return status?.learnedDate === today;
        })
      );

      if (!isTodayListLearnedToday) {
        console.log("📅 日付が変わったようなのでリロードします");
        clearInterval(interval); // 無限リロード防止
        window.location.reload();
      }
    }, 60000); // ⏰ 60秒に1回チェック

    return () => clearInterval(interval);
  }, []);
};
