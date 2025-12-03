"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface GameImageProps {
  src: string;
  alt?: string;
  showResult?: boolean;
  isReal?: boolean;
}

export function GameImage({
  src,
  alt = "Game image",
  showResult,
  isReal,
}: GameImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations("game");

  return (
    <div className="shadow-material-3 relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
        priority
      />
      {showResult && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div
            className={`shadow-material-3 rounded-2xl px-8 py-4 text-6xl font-bold text-white ${
              isReal ? "bg-blue-600" : "bg-purple-600"
            }`}
          >
            {isReal ? t("real") : t("ai")}
          </div>
        </div>
      )}
    </div>
  );
}
