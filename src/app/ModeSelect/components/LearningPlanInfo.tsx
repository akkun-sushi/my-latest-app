import { LearningPlan } from "../../../../types/WordSensesList";

type Props = {
  learningPlan: LearningPlan | null;
};

export default function LearningPlanInfo({ learningPlan }: Props) {
  const currentChunk =
    learningPlan?.chunks[learningPlan?.currentChunkIndex ?? 0] ?? undefined;

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div className="mt-8 mb-8 w-full bg-white/90 border border-indigo-200 rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl md:text-2xl font-extrabold text-indigo-600 tracking-tight">
          あなたの学習プラン
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm md:text-base text-gray-800">
        <div className="bg-indigo-50 rounded-xl p-4 shadow-inner">
          <p className="text-gray-500 text-xs font-semibold mb-1">
            📅 学習開始日
          </p>
          <p className="font-medium">{formatDate(currentChunk?.startDate)}</p>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4 shadow-inner">
          <p className="text-gray-500 text-xs font-semibold mb-1">
            🎯 目標達成日
          </p>
          <p className="font-medium">{formatDate(currentChunk?.targetDate)}</p>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4 shadow-inner">
          <p className="text-gray-500 text-xs font-semibold mb-1">
            ⏳ 学習期間と目標
          </p>
          <p className="font-medium">
            {learningPlan?.durationDays ?? "?"}日間で{" "}
            <span className="text-indigo-600 font-bold">100単語</span>{" "}
            をマスター！
          </p>
        </div>
      </div>
    </div>
  );
}
