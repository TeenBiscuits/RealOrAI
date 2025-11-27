'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface FinalScoreProps {
  score: number;
  totalRounds: number;
  onPlayAgain: () => void;
}

export function FinalScore({ score, totalRounds, onPlayAgain }: FinalScoreProps) {
  const t = useTranslations('game');
  const percentage = Math.round((score / totalRounds) * 100);

  const getGrade = () => {
    if (percentage >= 90) return { emoji: '🏆', text: 'Perfect!', color: 'text-amber-600' };
    if (percentage >= 75) return { emoji: '🎉', text: 'Great!', color: 'text-green-600' };
    if (percentage >= 50) return { emoji: '👍', text: 'Good job!', color: 'text-blue-600' };
    if (percentage >= 25) return { emoji: '💪', text: 'Keep trying!', color: 'text-orange-600' };
    return { emoji: '🤖', text: 'AI fooled you!', color: 'text-red-600' };
  };

  const grade = getGrade();

  return (
    <div className="text-center space-y-8 max-w-md mx-auto">
      <h2 className="text-4xl font-bold text-gray-900">{t('finalScore')}</h2>
      
      <div className="text-8xl">{grade.emoji}</div>
      
      <div className={`text-2xl font-bold ${grade.color}`}>{grade.text}</div>
      
      <div className="bg-white rounded-3xl p-8 space-y-4 shadow-material-2 border border-gray-100">
        <div className="text-6xl font-bold text-gray-900">{percentage}%</div>
        <div className="text-gray-600 text-xl">
          {t('youGot')} <span className="text-gray-900 font-bold">{score}</span> {t('outOf')} {totalRounds} {t('correct_plural')}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={onPlayAgain}
          className="w-full py-4 bg-blue-600 text-white font-bold text-xl rounded-2xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-material-2"
        >
          {t('playAgain')}
        </button>
        <Link
          href="/"
          className="w-full py-4 bg-gray-100 text-gray-700 font-bold text-xl rounded-2xl hover:bg-gray-200 transition-all text-center"
        >
          {t('backToHome')}
        </Link>
      </div>
    </div>
  );
}
