// 📅 日本時間（UTC+9）の今日の日付を "YYYY-MM-DD" 形式で取得する関数
export const getToday = (): string => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("CustomToday");
    if (saved) return saved;
  }
  // localStorageがなければ今日の日付を返す
  const date = new Date();
  date.setHours(date.getHours() + 9);
  return date.toISOString().slice(0, 10);
};

// 📅 N日後の日本時間（UTC+9）の日付を "YYYY-MM-DD" 形式で取得する関数
export const getNDaysLater = (n: number): string => {
  let baseDate: Date;

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("CustomToday");
    if (saved) {
      baseDate = new Date(saved);
      baseDate.setHours(baseDate.getHours() + n * 24); // ⏱ n日分加算（UTCベースで処理）
      return baseDate.toISOString().slice(0, 10);
    }
  }

  // CustomToday が未設定なら現在時刻を基準に
  baseDate = new Date();
  baseDate.setHours(baseDate.getHours() + 9 + n * 24); // JST変換 + n日分加算
  return baseDate.toISOString().slice(0, 10);
};
