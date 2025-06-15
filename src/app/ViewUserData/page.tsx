"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { UserData } from "../../../types/WordSensesList";

export default function ViewAllUserData() {
  const [userDataList, setUserDataList] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.from("UserData").select("*");
      if (error) {
        setError("データの取得に失敗しました");
        setLoading(false);
        return;
      }
      setUserDataList(data);
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (loading)
    return <p className="text-center py-10 text-lg">読み込み中...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        👥 全ユーザーデータ一覧
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow table-fixed">
          <thead className="bg-indigo-100 text-gray-800">
            <tr>
              <th className="px-4 py-2 border w-12">#</th>
              <th className="px-4 py-2 border w-32">ユーザー名</th>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">開始日</th>
              <th className="px-4 py-2 border">プラン日数</th>
              <th className="px-4 py-2 border">チャンク進捗</th>
              <th className="px-4 py-2 border">タグ</th>
            </tr>
          </thead>
          <tbody>
            {userDataList.map((user, index) => (
              <React.Fragment key={user.userId || index}>
                <tr
                  className="hover:bg-indigo-50 cursor-pointer"
                  onClick={() =>
                    setExpandedIndex(index === expandedIndex ? null : index)
                  }
                >
                  <td className="px-4 py-2 border text-center">{index + 1}</td>
                  <td className="px-4 py-2 border font-semibold">
                    {user.userName}
                  </td>
                  <td className="px-4 py-2 border text-xs break-all">
                    {user.userId}
                  </td>
                  <td className="px-4 py-2 border">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {user.learningPlan?.durationDays ?? "-"}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {user.learningPlan?.unlockedChunkIndex ?? 0}/
                    {Object.keys(user.learningPlan?.chunks || {}).length}
                  </td>
                  <td className="px-4 py-2 border text-center">{user.tag}</td>
                </tr>
                {expandedIndex === index && (
                  <tr className="bg-gray-100">
                    <td colSpan={7} className="px-4 py-4">
                      {/* ✅ チャンク一覧 */}
                      <div className="mb-4">
                        <h3 className="font-bold mb-2">📦 Chunks</h3>
                        <table className="w-full text-sm border border-gray-300">
                          <thead className="bg-gray-200">
                            <tr>
                              <th className="px-2 py-1 border">チャンク</th>
                              <th className="px-2 py-1 border">開始日</th>
                              <th className="px-2 py-1 border">目標日</th>
                              <th className="px-2 py-1 border">完了日</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(
                              user.learningPlan?.chunks || {}
                            ).map(([chunkIndex, chunk]) => (
                              <tr key={`chunk-${user.userId}-${chunkIndex}`}>
                                <td className="px-2 py-1 border text-center">
                                  {chunkIndex}
                                </td>
                                <td className="px-2 py-1 border">
                                  {chunk.startDate}
                                </td>
                                <td className="px-2 py-1 border">
                                  {chunk.targetDate}
                                </td>
                                <td className="px-2 py-1 border">
                                  {chunk.completeDate}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* ✅ プログレス一覧 */}
                      <div>
                        <h3 className="font-bold mb-2">📊 Progress</h3>
                        <table className="w-full text-sm border border-gray-300">
                          <thead className="bg-gray-200">
                            <tr>
                              <th className="px-2 py-1 border">日付</th>
                              <th className="px-2 py-1 border">学習数</th>
                              <th className="px-2 py-1 border">復習数</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(user.progress || {}).map(
                              ([date, session]) => (
                                <tr key={`progress-${user.userId}-${date}`}>
                                  <td className="px-2 py-1 border">{date}</td>
                                  <td className="px-2 py-1 border text-center">
                                    {session.learnCount}
                                  </td>
                                  <td className="px-2 py-1 border text-center">
                                    {session.reviewCount}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
