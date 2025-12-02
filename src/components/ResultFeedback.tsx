"use client";

import { useTranslations } from "next-intl";

interface ResultFeedbackProps {
  isCorrect: boolean;
  wasReal: boolean;
  onNext: () => void;
  isLastRound?: boolean;
}

export function ResultFeedback({
  isCorrect,
  wasReal,
  onNext,
  isLastRound = false,
}: ResultFeedbackProps) {
  const t = useTranslations("game");

  return (
    <div className="text-center space-y-6">
      <div
        className={`inline-block px-8 py-4 rounded-2xl text-3xl font-bold ${
          isCorrect
            ? "bg-green-100 text-green-700 ring-2 ring-green-400"
            : "bg-red-100 text-red-700 ring-2 ring-red-400"
        }`}
      >
        {isCorrect ? t("correct") : t("incorrect")}
      </div>
      <p className="text-xl text-gray-600">
        {wasReal ? t("wasReal") : t("wasAI")}
      </p>
      <button
        onClick={onNext}
        className="px-8 py-4 bg-blue-600 text-white font-bold text-xl rounded-2xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-material-2"
      >
        {isLastRound ? t("finalScore") : t("nextRound")}
      </button>
    </div>
  );
}
