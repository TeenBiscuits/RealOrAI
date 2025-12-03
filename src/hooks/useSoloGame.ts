import { useState, useCallback, useEffect } from "react";
import { useTimer } from "./useTimer";
import type { GameImage, ImageType } from "@/lib/types";
import {
  getSeenImageIds,
  markImagesAsSeen,
  resetSeenImages,
} from "@/lib/seenImages";

interface SoloGameState {
  status: "loading" | "ready" | "playing" | "showing-result" | "finished";
  currentRound: number;
  totalRounds: number;
  score: number;
  currentImage: GameImage | null;
  userVote: ImageType | null;
  isCorrect: boolean | null;
  results: { image: GameImage; userVote: ImageType; isCorrect: boolean }[];
}

const TOTAL_ROUNDS = 12;
const TIME_PER_ROUND = 30;

export function useSoloGame() {
  const [gameState, setGameState] = useState<SoloGameState>({
    status: "loading",
    currentRound: 0,
    totalRounds: TOTAL_ROUNDS,
    score: 0,
    currentImage: null,
    userVote: null,
    isCorrect: null,
    results: [],
  });

  const [images, setImages] = useState<GameImage[]>([]);

  const handleTimeUp = useCallback(() => {
    if (gameState.status === "playing" && !gameState.userVote) {
      // Auto-submit wrong answer if time runs out
      submitVote(gameState.currentImage?.type === "real" ? "ai" : "real");
    }
  }, [gameState.status, gameState.userVote, gameState.currentImage]);

  const timer = useTimer({
    initialTime: TIME_PER_ROUND,
    onTimeUp: handleTimeUp,
    autoStart: false,
  });

  // Load images on mount
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      // Get list of already seen image IDs
      const seenIds = getSeenImageIds();

      // Build URL with exclude parameter
      const params = new URLSearchParams({
        includeTypes: "true",
      });

      if (seenIds.length > 0) {
        params.set("excludeIds", encodeURIComponent(JSON.stringify(seenIds)));
      }

      const fullResponse = await fetch(`/api/images?${params.toString()}`);
      const fullData = await fullResponse.json();

      setImages(fullData);
      setGameState((prev) => ({ ...prev, status: "ready" }));
    } catch (error) {
      console.error("Failed to load images:", error);
    }
  };

  const startGame = useCallback(() => {
    if (images.length < TOTAL_ROUNDS) {
      console.error("Not enough images");
      return;
    }

    setGameState((prev) => ({
      ...prev,
      status: "playing",
      currentRound: 1,
      score: 0,
      currentImage: images[0],
      userVote: null,
      isCorrect: null,
      results: [],
    }));

    timer.restart(TIME_PER_ROUND);
  }, [images, timer]);

  const submitVote = useCallback(
    (vote: ImageType) => {
      if (gameState.status !== "playing" || gameState.userVote) return;

      timer.stop();

      const isCorrect = vote === gameState.currentImage?.type;
      const newScore = isCorrect ? gameState.score + 1 : gameState.score;
      const newResult = {
        image: gameState.currentImage!,
        userVote: vote,
        isCorrect,
      };

      setGameState((prev) => ({
        ...prev,
        status: "showing-result",
        userVote: vote,
        isCorrect,
        score: newScore,
        results: [...prev.results, newResult],
      }));
    },
    [gameState, timer],
  );

  const nextRound = useCallback(() => {
    const nextRoundNum = gameState.currentRound + 1;

    if (nextRoundNum > TOTAL_ROUNDS) {
      // Mark all played images as seen
      const playedImageIds = images.map((img) => img.id);
      markImagesAsSeen(playedImageIds);

      setGameState((prev) => ({
        ...prev,
        status: "finished",
      }));
      return;
    }

    setGameState((prev) => ({
      ...prev,
      status: "playing",
      currentRound: nextRoundNum,
      currentImage: images[nextRoundNum - 1],
      userVote: null,
      isCorrect: null,
    }));

    timer.restart(TIME_PER_ROUND);
  }, [gameState.currentRound, images, timer]);

  const resetGame = useCallback(() => {
    loadImages();
    setGameState({
      status: "loading",
      currentRound: 0,
      totalRounds: TOTAL_ROUNDS,
      score: 0,
      currentImage: null,
      userVote: null,
      isCorrect: null,
      results: [],
    });
    timer.reset(TIME_PER_ROUND);
  }, [timer]);

  return {
    gameState,
    timeLeft: timer.timeLeft,
    startGame,
    submitVote,
    nextRound,
    resetGame,
  };
}
