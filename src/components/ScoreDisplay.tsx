"use client";

interface ScoreDisplayProps {
  score: number;
  totalRounds: number;
  currentRound: number;
}

export function ScoreDisplay({
  score,
  totalRounds,
  currentRound,
}: ScoreDisplayProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto text-lg">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Round</span>
        <span className="font-bold text-gray-900">{currentRound}</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500">{totalRounds}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Score</span>
        <span className="font-bold text-gray-900 text-2xl">{score}</span>
      </div>
    </div>
  );
}
