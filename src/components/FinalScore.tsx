"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

interface FinalScoreProps {
  score: number;
  totalRounds: number;
  onPlayAgain: () => void;
}

export function FinalScore({
  score,
  totalRounds,
  onPlayAgain,
}: FinalScoreProps) {
  const t = useTranslations("game");
  const percentage = Math.round((score / totalRounds) * 100);

  const getGrade = () => {
    if (percentage >= 90)
      return { emoji: "🏆", text: "perfect", color: "text-amber-600" };
    if (percentage >= 75)
      return { emoji: "🎉", text: "great", color: "text-green-600" };
    if (percentage >= 50)
      return { emoji: "👍", text: "nice", color: "text-blue-600" };
    if (percentage >= 25)
      return { emoji: "💪", text: "keep", color: "text-orange-600" };
    return { emoji: "🤖", text: "fooled", color: "text-red-600" };
  };

  const grade = getGrade();

  return (
    <div className="mx-auto max-w-md space-y-8 text-center">
      <h2 className="text-4xl font-bold text-gray-900">{t("finalScore")}</h2>

      <div className="text-8xl">{grade.emoji}</div>

      <div className={`text-2xl font-bold ${grade.color}`}>{t(grade.text)}</div>

      <div className="shadow-material-2 space-y-4 rounded-3xl border border-gray-100 bg-white p-8">
        <div className="text-6xl font-bold text-gray-900">{percentage}%</div>
        <div className="text-xl text-gray-600">
          {t("youGot")} <span className="font-bold text-gray-900">{score}</span>{" "}
          {t("outOf")} {totalRounds} {t("correct_plural")}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={onPlayAgain}
          className="shadow-material-2 w-full transform rounded-2xl bg-blue-600 py-4 text-xl font-bold text-white transition-all hover:scale-105 hover:bg-blue-700"
        >
          {t("playAgain")}
        </button>
        <Link
          href="/"
          className="w-full rounded-2xl bg-gray-100 py-4 text-center text-xl font-bold text-gray-700 transition-all hover:bg-gray-200"
        >
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}
