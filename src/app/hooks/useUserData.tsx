// hooks/useUserProgress.ts
import { useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { UserData } from "../../../types/WordSensesList";
import { updateLocalStorageObject } from "./updateLocalStorage";

export const useUserData = () => {
  // 🔸 Insert 新規作成
  const insertUserData = useCallback(async (data: UserData) => {
    const { error } = await supabase.from("UserData").insert([data]);

    if (error) {
      console.error("❌ insertUserData エラー:", error.message);
      throw error;
    }

    // ✅ LocalStorageに保存
    updateLocalStorageObject("UserData", data);
  }, []);

  // 🔸 Update 既存ユーザー更新（userIdが一致）
  const updateUserData = useCallback(
    async (userId: string, updates: Partial<UserData>) => {
      const { data, error } = await supabase
        .from("UserData")
        .update(updates)
        .eq("userId", userId)
        .select()
        .single();

      if (error) {
        console.error("❌ updateUserData エラー:", error.message);
        throw error;
      }

      // ✅ LocalStorageに保存
      updateLocalStorageObject("UserData", data);
    },
    []
  );

  // 🔸 Fetch 取得（必要に応じて）
  const fetchUserData = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("UserData")
      .select("*")
      .eq("userId", userId)
      .single();

    if (error) {
      console.error("❌ fetchUserData エラー:", error.message);
      throw error;
    }

    return data as UserData;
  }, []);

  return {
    insertUserData,
    updateUserData,
    fetchUserData,
  };
};
