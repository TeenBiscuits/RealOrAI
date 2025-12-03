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
    <div className="mx-auto flex w-full max-w-md items-center justify-between text-lg">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Round</span>
        <span className="font-bold text-gray-900">{currentRound}</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500">{totalRounds}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Score</span>
        <span className="text-2xl font-bold text-gray-900">{score}</span>
      </div>
    </div>
  );
}
