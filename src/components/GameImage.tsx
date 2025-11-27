'use client';

import Image from 'next/image';
import { useState } from 'react';

interface GameImageProps {
  src: string;
  alt?: string;
  showResult?: boolean;
  isReal?: boolean;
}

export function GameImage({ src, alt = 'Game image', showResult, isReal }: GameImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden bg-gray-100 shadow-material-3 border border-gray-200">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
        priority
      />
      {showResult && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className={`text-6xl font-bold px-8 py-4 rounded-2xl text-white shadow-material-3 ${
            isReal ? 'bg-blue-600' : 'bg-purple-600'
          }`}>
            {isReal ? '📷 REAL' : '🍌 AI'}
          </div>
        </div>
      )}
    </div>
  );
}
