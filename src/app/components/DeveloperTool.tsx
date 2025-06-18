"use client";

import { useState, useEffect } from "react";
import { getNDaysLater, getToday } from "../hooks/dateUtils";
import { fetchFromLocalStorage } from "../hooks/fetchFromLocalStorage";

export const DeveloperTool = () => {
  const isDev =
    typeof window !== "undefined" && window.location.hostname === "localhost";

  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const [isClicked, setIsClicked] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [clicked, setClicked] = useState(false);

  const [storageUsage, setStorageUsage] = useState<{
    usedKB: number;
    remainingKB: number;
  }>({
    usedKB: 0,
    remainingKB: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem("CustomToday");
    if (saved) setSelectedDate(saved);
    calculateLocalStorageUsage();
  }, []);

  const calculateLocalStorageUsage = () => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const value = localStorage.getItem(key);
      total += key.length + (value?.length ?? 0);
    }
    const usedKB = Math.round((total * 2) / 1024); // UTF-16なので*2
    const maxKB = 5120; // 5MB = 5120KB
    const remainingKB = maxKB - usedKB;
    setStorageUsage({ usedKB, remainingKB });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setIsClicked(false);
  };

  const handleEnter = () => {
    localStorage.setItem("CustomToday", selectedDate);
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 500);
    //window.location.reload();
  };

  const setAlllevel = (x: number) => {
    const { currentChunkWords: storedList, statuses } = fetchFromLocalStorage();
    if (!storedList || !statuses) {
      console.warn("localStorageにデータがありません");
      return;
    }

    const updatedList = statuses.map((s) => {
      const item = storedList.find(
        (item) => item.senses[0].senses_id === s.senses_id
      );
      if (item) {
        return {
          ...s,
          level: x,
          learnedDate: getToday(),
          reviewDate: getNDaysLater(3),
        };
      }
      return s;
    });

    localStorage.setItem("SensesStatusList", JSON.stringify(updatedList));
    localStorage.setItem("CurrentLearningList", JSON.stringify([]));

    setClicked(true);
    setTimeout(() => setClicked(false), 3000);

    calculateLocalStorageUsage(); // 更新後に再計算
  };

  if (!isDev) return null;

  return (
    <div className="m-10 bg-white text-gray-900 p-6 rounded-xl shadow-md max-w-md mx-auto space-y-6 border border-gray-300">
      <h2 className="text-2xl font-bold mb-4 text-center">🛠 Developer Tool</h2>

      {/* 容量チェック */}
      <div className="bg-gray-100 p-3 rounded">
        <p className="font-semibold">🧠 localStorage 容量</p>
        <p>使用量：約 {storageUsage.usedKB} KB</p>
        <p>残り容量：約 {storageUsage.remainingKB} KB（最大約5MB）</p>
        <button
          className="mt-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          onClick={calculateLocalStorageUsage}
        >
          再チェック
        </button>
      </div>

      <hr className="border-gray-300" />

      {/* 日付設定 */}
      <div className="space-y-2">
        <label htmlFor="datePicker" className="block font-semibold">
          📅 カスタム日付を選択：
        </label>
        <input
          id="datePicker"
          type="date"
          value={selectedDate}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded px-3 py-2"
        />
        <button
          onClick={handleEnter}
          className={`w-full mt-2 py-2 rounded font-semibold transition-colors duration-300 ${
            isClicked
              ? "bg-green-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          決定
        </button>
      </div>

      <hr className="border-gray-300" />

      {/* level設定 */}
      <div className="space-y-2">
        <label className="block font-semibold">
          📊 全ての level を指定した値に変更：
        </label>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="例: 2"
          className="w-full border border-gray-400 rounded px-3 py-2"
        />
        <button
          onClick={() => {
            const num = Number(inputValue);
            if (!isNaN(num)) {
              setAlllevel(num);
            } else {
              alert("数字を入力してください");
            }
          }}
          className={`w-full py-2 rounded font-semibold transition-colors duration-300 ${
            clicked
              ? "bg-green-500 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          すべての level を変更
        </button>
      </div>
    </div>
  );
};
