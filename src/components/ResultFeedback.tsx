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
    <div className="space-y-6 text-center">
      <div
        className={`inline-block rounded-2xl px-8 py-4 text-3xl font-bold ${
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
        className="shadow-material-2 transform rounded-2xl bg-blue-600 px-8 py-4 text-xl font-bold text-white transition-all hover:scale-105 hover:bg-blue-700"
      >
        {isLastRound ? t("finalScore") : t("nextRound")}
      </button>
    </div>
  );
}
