"use client";

import { useState } from "react";

export function useSort<T>(defaultKey: keyof T) {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortList = (list: T[]) => {
    return [...list].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === null || bVal === null) return 0;
      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      } else {
        return sortOrder === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });
  };

  return { sortKey, sortOrder, toggleSort, sortList };
}
