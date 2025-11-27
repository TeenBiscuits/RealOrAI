'use client';

import type { ImageType } from '@/lib/types';

interface VoteButtonsProps {
  onVote: (vote: ImageType) => void;
  disabled?: boolean;
  selectedVote?: ImageType | null;
  correctAnswer?: ImageType;
  showResult?: boolean;
  size?: 'normal' | 'large';
}

export function VoteButtons({
  onVote,
  disabled = false,
  selectedVote,
  correctAnswer,
  showResult = false,
  size = 'normal',
}: VoteButtonsProps) {
  const sizeClasses = size === 'large' 
    ? 'py-8 px-12 text-3xl' 
    : 'py-4 px-8 text-xl';

  const getButtonClass = (type: ImageType) => {
    const baseClass = `${sizeClasses} font-bold rounded-2xl transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-material-2`;
    
    if (showResult && correctAnswer) {
      if (type === correctAnswer) {
        return `${baseClass} bg-green-500 text-white ring-4 ring-green-200 scale-105`;
      }
      if (type === selectedVote && type !== correctAnswer) {
        return `${baseClass} bg-red-500 text-white ring-4 ring-red-200`;
      }
      return `${baseClass} bg-gray-200 text-gray-500`;
    }

    if (selectedVote === type) {
      return `${baseClass} ${
        type === 'real'
          ? 'bg-blue-600 text-white ring-4 ring-blue-200'
          : 'bg-purple-600 text-white ring-4 ring-purple-200'
      }`;
    }

    return `${baseClass} ${
      type === 'real'
        ? 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 hover:shadow-material-3'
        : 'bg-purple-500 hover:bg-purple-600 text-white hover:scale-105 hover:shadow-material-3'
    }`;
  };

  return (
    <div className="flex gap-4 justify-center flex-wrap">
      <button
        onClick={() => onVote('real')}
        disabled={disabled || !!selectedVote}
        className={getButtonClass('real')}
      >
        📷 Real
      </button>
      <button
        onClick={() => onVote('ai')}
        disabled={disabled || !!selectedVote}
        className={getButtonClass('ai')}
      >
        🍌 AI
      </button>
    </div>
  );
}
