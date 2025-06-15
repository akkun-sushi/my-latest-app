"use client";

import { useEffect } from "react";
import { getToday } from "./dateUtils";
import { fetchFromLocalStorage } from "./fetchFromLocalStorage";

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

      const isTodayListLearnedToday = todayLearningList.some((word) =>
        word.senses.some((sense) => {
          const status = senseStatuses.find(
            (s) => s.senses_id === sense.senses_id
          );
          return status?.learnedDate === today;
        })
      );

      if (!isTodayListLearnedToday) {
        console.log("📅 日付が変わったようなのでリロードします");
        clearInterval(interval);
        window.location.reload();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);
};
