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
      <div className="text-center text-gray-500 py-8">
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
            className={`px-4 py-2 rounded-full font-medium transition-all shadow-sm ${
              showVoteStatus
                ? player.hasVoted
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-600 border border-gray-300"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
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
