"use client";

import { useTranslations } from "next-intl";

interface TimerProps {
  timeLeft: number;
  totalTime?: number;
}

export function Timer({ timeLeft, totalTime = 30 }: TimerProps) {
  const t = useTranslations("game");
  const percentage = (timeLeft / totalTime) * 100;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">
          {t("timeLeft")}
        </span>
        <span
          className={`text-2xl font-bold tabular-nums ${
            isCritical
              ? "animate-pulse text-red-600"
              : isLow
                ? "text-amber-600"
                : "text-gray-900"
          }`}
        >
          {timeLeft}s
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isCritical
              ? "bg-red-500"
              : isLow
                ? "bg-amber-500"
                : "bg-gradient-to-r from-green-500 to-emerald-400"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
