"use client";

import { useTranslations } from "next-intl";
import type { Player } from "@/lib/types";

interface PlayerListProps {
  players: Player[];
  showVoteStatus?: boolean;
}

export function PlayerList({
  players,
  showVoteStatus = false,
}: PlayerListProps) {
  const t = useTranslations("host");

  if (players.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        {t("waitingForPlayers")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-700">
        {t("players")} ({players.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={`rounded-full px-4 py-2 shadow-sm transition-all ${
              showVoteStatus
                ? player.hasVoted
                  ? "border border-green-300 bg-green-100 font-medium text-green-700"
                  : "border border-gray-300 bg-gray-100 font-medium text-gray-600"
                : player.nickname.toUpperCase() === "MAITE"
                  ? "border border-pink-300 bg-pink-200 font-bold text-pink-800"
                  : "border border-blue-200 bg-blue-50 font-medium text-blue-700"
            }`}
          >
            {player.nickname.toUpperCase() === "MAITE" ? "👑 " : ""}
            {player.nickname}
            {showVoteStatus && player.hasVoted && (
              <span className="ml-2">✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
