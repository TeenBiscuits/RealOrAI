"use client";

import { useTranslations } from "next-intl";
import { useSoloGame } from "@/hooks/useSoloGame";
import { Timer } from "@/components/Timer";
import { GameImage } from "@/components/GameImage";
import { VoteButtons } from "@/components/VoteButtons";
import { ResultFeedback } from "@/components/ResultFeedback";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { FinalScore } from "@/components/FinalScore";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function SoloPage() {
  const t = useTranslations("game");
  const { gameState, timeLeft, startGame, submitVote, nextRound, resetGame } =
    useSoloGame();

  // Loading state
  if (gameState.status === "loading") {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading images...</p>
        </div>
      </div>
    );
  }

  // Ready state - show start button
  if (gameState.status === "ready") {
    return (
      <main className="min-h-dvh flex flex-col bg-gray-50">
        <header className="p-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← {t("back")}
          </Link>
          <LanguageSwitcher />
        </header>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-8 max-w-md">
            <h1 className="text-6xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-gray-600 text-lg">{t("description")}</p>
            <button
              onClick={startGame}
              className="w-full py-6 bg-blue-600 text-white font-bold text-2xl rounded-2xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-material-2 animate-pulse-glow"
            >
              {t("play")}
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Finished state - show final score
  if (gameState.status === "finished") {
    return (
      <main className="min-h-dvh flex flex-col bg-gray-50">
        <header className="p-4 flex justify-end">
          <LanguageSwitcher />
        </header>

        <div className="flex-1 flex items-center justify-center p-8">
          <FinalScore
            score={gameState.score}
            totalRounds={gameState.totalRounds}
            onPlayAgain={resetGame}
          />
        </div>

        <Footer />
      </main>
    );
  }

  // Playing or showing result
  return (
    <main className="min-h-dvh flex flex-col p-4 md:p-8 bg-gray-50">
      {/* Header with score and timer */}
      <header className="space-y-4 mb-6">
        <ScoreDisplay
          score={gameState.score}
          totalRounds={gameState.totalRounds}
          currentRound={gameState.currentRound}
        />
        {gameState.status === "playing" && <Timer timeLeft={timeLeft} />}
      </header>

      {/* Game content */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Image */}
        {gameState.currentImage && (
          <GameImage
            src={gameState.currentImage.src}
            alt={gameState.currentImage.alt}
            showResult={gameState.status === "showing-result"}
            isReal={gameState.currentImage.type === "real"}
          />
        )}

        {/* Vote buttons or Result */}
        {gameState.status === "playing" && (
          <VoteButtons
            onVote={submitVote}
            disabled={gameState.userVote !== null}
            selectedVote={gameState.userVote}
            size="large"
          />
        )}

        {gameState.status === "showing-result" &&
          gameState.isCorrect !== null && (
            <ResultFeedback
              isCorrect={gameState.isCorrect}
              wasReal={gameState.currentImage?.type === "real"}
              onNext={nextRound}
              isLastRound={gameState.currentRound >= gameState.totalRounds}
            />
          )}
      </div>
    </main>
  );
}
