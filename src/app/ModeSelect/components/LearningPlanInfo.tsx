import { LearningPlan } from "../../../../types/WordSensesList";

type Props = {
  learningPlan: LearningPlan | null;
};

export default function LearningPlanInfo({ learningPlan }: Props) {
  // 現在チャンクの目標データを取得（安全にアクセス）
  const currentChunk =
    learningPlan?.chunks[learningPlan?.currentChunkIndex ?? 0] ?? undefined;

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6 bg-white/70 border border-indigo-200 rounded-xl p-4 shadow-sm">
      <div>
        <h2 className="text-lg md:text-xl font-bold text-indigo-500 flex items-center gap-2">
          🎯 目標設定
        </h2>
        <p className="text-sm md:text-base text-gray-700 mt-2 leading-relaxed">
          <span className="inline-block font-bold text-indigo-500">
            学習開始日：
          </span>
          {formatDate(currentChunk?.startDate)}

          <br />
          <span className="inline-block font-bold text-indigo-500">
            目標達成日：
          </span>
          {formatDate(currentChunk?.targetDate)}

          <br />
          <span className="mt-2 inline-block text-gray-800">
            {learningPlan?.durationDays ?? "?"}日間で
            <span className="font-bold text-indigo-500">100単語</span>
            をマスターしよう！
          </span>
        </p>
      </div>
    </div>
  );
}
