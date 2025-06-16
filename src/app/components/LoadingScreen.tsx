export const LoadingScreen = ({
  message = "データを読み込み中です...",
}: {
  message?: string;
}) => {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-center items-center space-y-6">
      {/* ローディングスピナー */}
      <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />

      {/* メインメッセージ */}
      <div className="text-xl sm:text-2xl font-semibold animate-pulse text-center">
        {message}
      </div>

      {/* サブメッセージ */}
      <div className="text-sm sm:text-base text-white/60">
        しばらくお待ちください...
      </div>
    </div>
  );
};
