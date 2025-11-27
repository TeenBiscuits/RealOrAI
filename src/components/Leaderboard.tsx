'use client';

import { useTranslations } from 'next-intl';
import type { Player } from '@/lib/types';

interface LeaderboardProps {
  players: Player[];
  totalRounds: number;
  currentPlayerId?: string;
}

export function Leaderboard({ players, totalRounds, currentPlayerId }: LeaderboardProps) {
  const t = useTranslations('leaderboard');

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-amber-50 border-amber-300';
    if (rank === 2) return 'bg-gray-50 border-gray-300';
    if (rank === 3) return 'bg-orange-50 border-orange-300';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">{t('title')}</h2>
      
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => {
          const rank = index + 1;
          const percentage = Math.round((player.score / totalRounds) * 100);
          const isCurrentPlayer = player.id === currentPlayerId;

          return (
            <div
              key={player.id}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all shadow-material-1 ${getRankStyle(rank)} ${
                isCurrentPlayer ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              <div className="text-2xl w-12 text-center">
                {getRankEmoji(rank)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 truncate">
                  {player.nickname}
                  {isCurrentPlayer && (
                    <span className="ml-2 text-blue-600 text-sm">{t('you')}</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {player.score}/{totalRounds} correct
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
