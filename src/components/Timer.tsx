'use client';

interface TimerProps {
  timeLeft: number;
  totalTime?: number;
}

export function Timer({ timeLeft, totalTime = 30 }: TimerProps) {
  const percentage = (timeLeft / totalTime) * 100;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">Time left</span>
        <span
          className={`text-2xl font-bold tabular-nums ${
            isCritical
              ? 'text-red-600 animate-pulse'
              : isLow
              ? 'text-amber-600'
              : 'text-gray-900'
          }`}
        >
          {timeLeft}s
        </span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${
            isCritical
              ? 'bg-red-500'
              : isLow
              ? 'bg-amber-500'
              : 'bg-gradient-to-r from-green-500 to-emerald-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
