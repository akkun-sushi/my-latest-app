type LocalStorageData = Record<string, any>;

export const updateLocalStorageObject = <T extends LocalStorageData>(
  key: string,
  updates: Partial<T>
): void => {
  const raw = localStorage.getItem(key);

  if (!raw) {
    console.warn(
      `⚠️ localStorageにキー "${key}" が存在しません。updateをスキップします。`
    );
    return;
  }

  try {
    const current: T = JSON.parse(raw);
    const updated = { ...current, ...updates };
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error(`❌ localStorageの更新に失敗しました (キー: ${key})`, e);
  }
};

export const saveListToLocalStorage = <T,>(key: string, list: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.error(
      `❌ localStorageへのリスト保存に失敗しました (キー: ${key})`,
      e
    );
  }
};
