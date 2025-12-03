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
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="text-gray-600">Loading images...</p>
        </div>
      </div>
    );
  }

  // Ready state - show start button
  if (gameState.status === "ready") {
    return (
      <main className="flex min-h-dvh flex-col bg-gray-50">
        <header className="flex items-center justify-between p-4">
          <Link
            href="/"
            className="text-gray-600 transition-colors hover:text-gray-900"
          >
            ← {t("back")}
          </Link>
          <LanguageSwitcher />
        </header>

        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-md space-y-8 text-center">
            <h1 className="text-6xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-lg text-gray-600">{t("description")}</p>
            <button
              onClick={startGame}
              className="shadow-material-2 animate-pulse-glow w-full transform rounded-2xl bg-blue-600 py-6 text-2xl font-bold text-white transition-all hover:scale-105 hover:bg-blue-700"
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
      <main className="flex min-h-dvh flex-col bg-gray-50">
        <header className="flex justify-end p-4">
          <LanguageSwitcher />
        </header>

        <div className="flex flex-1 items-center justify-center p-8">
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
    <main className="flex min-h-dvh flex-col bg-gray-50 p-4 md:p-8">
      {/* Header with score and timer */}
      <header className="mb-6 space-y-4">
        <ScoreDisplay
          score={gameState.score}
          totalRounds={gameState.totalRounds}
          currentRound={gameState.currentRound}
        />
        {gameState.status === "playing" && <Timer timeLeft={timeLeft} />}
      </header>

      {/* Game content */}
      <div className="flex flex-1 flex-col items-center justify-center space-y-8">
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
