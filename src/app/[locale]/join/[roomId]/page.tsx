"use client";

import { useState, useEffect, use } from "react";
import { useTranslations } from "next-intl";
import { usePolling } from "@/hooks/usePolling";
import { VoteButtons } from "@/components/VoteButtons";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Player, ImageType, GameState } from "@/lib/types";

type PlayerStatus =
  | "joining"
  | "waiting"
  | "playing"
  | "voted"
  | "result"
  | "finished";

interface PlayerState {
  status: PlayerStatus;
  player: Player | null;
  currentRound: number;
  totalRounds: number;
  currentVote: ImageType | null;
  isCorrect: boolean | null;
  correctAnswer: ImageType | null;
  finalRank: number | null;
  players: Player[];
}

interface JoinPageProps {
  params: Promise<{ roomId: string }>;
}

export default function JoinPollingPage({ params }: JoinPageProps) {
  const { roomId } = use(params);
  const t = useTranslations("join");
  const tGame = useTranslations("game");
  const tLeaderboard = useTranslations("leaderboard");

  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<PlayerState>({
    status: "joining",
    player: null,
    currentRound: 0,
    totalRounds: 12,
    currentVote: null,
    isCorrect: null,
    correctAnswer: null,
    finalRank: null,
    players: [],
  });

  const { isPolling, sendAction } = usePolling({
    roomId: roomId,
    enabled: !!state.player,
    interval: 1000,
    onUpdate: (gameState: GameState) => {
      console.log("[Player] Game state updated:", gameState);

      setState((prev) => {
        const updatedPlayer = gameState.players.find(
          (p) => p.id === prev.player?.id,
        );

        // Determine status based on game state
        let newStatus: PlayerStatus = prev.status;

        if (gameState.status === "lobby" && prev.player) {
          newStatus = "waiting";
        } else if (gameState.status === "playing") {
          newStatus = updatedPlayer?.hasVoted ? "voted" : "playing";
        } else if (gameState.status === "showing-result") {
          newStatus = "result";
        } else if (gameState.status === "finished") {
          newStatus = "finished";
        }

        // Check if vote was correct
        let isCorrect = prev.isCorrect;
        if (gameState.correctAnswer && prev.currentVote) {
          isCorrect = prev.currentVote === gameState.correctAnswer;
        }

        return {
          ...prev,
          status: newStatus,
          players: gameState.players,
          player: updatedPlayer || prev.player,
          currentRound: gameState.currentRound,
          totalRounds: gameState.totalRounds,
          correctAnswer: gameState.correctAnswer,
          isCorrect,
        };
      });
    },
  });

  const handleJoin = async () => {
    if (!nickname.trim()) return;

    console.log("[Player] Joining room:", roomId, "as", nickname.trim());

    const result = await sendAction("join", { nickname: nickname.trim() });

    if (result.success) {
      console.log("[Player] Joined successfully:", result.player);
      setState((prev) => ({
        ...prev,
        status: "waiting",
        player: result.player,
      }));
      setError(null);
    } else {
      console.error("[Player] Failed to join:", result.error);
      setError(result.error || "Failed to join room");
    }
  };

  const handleVote = async (vote: ImageType) => {
    if (state.currentVote || !state.player) return;

    console.log("[Player] Voting:", vote);

    setState((prev) => ({
      ...prev,
      status: "voted",
      currentVote: vote,
    }));

    const result = await sendAction("vote", {
      playerId: state.player.id,
      vote,
    });

    if (!result.success) {
      console.error("[Player] Failed to vote:", result.error);
      // Revert vote status on error
      setState((prev) => ({
        ...prev,
        status: "playing",
        currentVote: null,
      }));
    }
  };

  // Reset vote when new round starts
  useEffect(() => {
    if (state.status === "playing" && state.currentVote) {
      setState((prev) => ({
        ...prev,
        currentVote: null,
        isCorrect: null,
      }));
    }
  }, [state.currentRound]);

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  // Joining - enter nickname
  if (state.status === "joining") {
    return (
      <main className="min-h-screen flex flex-col bg-gray-50">
        <header className="p-4 flex justify-end">
          <LanguageSwitcher />
        </header>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📷 Real or AI 🍌
              </h1>
              <p className="text-gray-600">{t("joinGame")}</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t("enterNickname")}
                maxLength={20}
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl text-gray-900 text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              <button
                onClick={handleJoin}
                disabled={!nickname.trim()}
                className="w-full py-4 bg-blue-600 text-white font-bold text-xl rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-all shadow-material-2"
              >
                {t("join")}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Waiting for game to start
  if (state.status === "waiting") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin mx-auto" />
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {t("connected")} ✓
            </p>
            <p className="text-gray-600">{t("waiting")}</p>
          </div>
          <div className="bg-white rounded-xl px-6 py-4 shadow-material-1 border border-gray-200">
            <p className="text-gray-600 text-sm">
              {state.players.length} {t("players")}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {isPolling ? "🟢 Connected" : "🔴 Disconnected"}
          </div>
        </div>
      </main>
    );
  }

  // Game finished - show final result
  if (state.status === "finished") {
    const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);
    const rank = sortedPlayers.findIndex((p) => p.id === state.player?.id) + 1;
    const percentage = state.player
      ? Math.round((state.player.score / state.totalRounds) * 100)
      : 0;

    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="text-center space-y-6 w-full max-w-sm">
          <h2 className="text-3xl font-bold text-gray-900">
            {tLeaderboard("title")}
          </h2>

          {/* Your result */}
          <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-material-2">
            <div className="text-6xl mb-4">{getRankEmoji(rank)}</div>
            <p className="text-gray-600 mb-2">
              {state.player?.nickname} {tLeaderboard("you")}
            </p>
            <p className="text-4xl font-bold text-gray-900">{percentage}%</p>
            <p className="text-gray-500">
              {state.player?.score}/{state.totalRounds} correct
            </p>
          </div>

          {/* Top 3 */}
          <div className="space-y-2">
            {sortedPlayers.slice(0, 3).map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-xl shadow-sm ${
                  player.id === state.player?.id
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getRankEmoji(index + 1)}</span>
                  <span className="text-gray-900">{player.nickname}</span>
                </div>
                <span className="font-bold text-gray-900">
                  {Math.round((player.score / state.totalRounds) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Playing or showing result
  return (
    <main className="min-h-screen flex flex-col p-4 bg-gray-50">
      {/* Header */}
      <header className="text-center mb-4">
        <p className="text-gray-500">
          {tGame("round")} {state.currentRound}/{state.totalRounds}
        </p>
        <p className="text-gray-900 font-bold">
          {tGame("score")}: {state.player?.score || 0}
        </p>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Playing - show vote buttons */}
        {state.status === "playing" && (
          <div className="w-full space-y-8">
            <p className="text-center text-xl text-gray-600">
              Look at the screen and vote!
            </p>
            <VoteButtons
              onVote={handleVote}
              selectedVote={state.currentVote}
              size="large"
            />
          </div>
        )}

        {/* Voted - waiting for result */}
        {state.status === "voted" && (
          <div className="text-center space-y-4">
            <p className="text-xl text-gray-600">{t("youVoted")}</p>
            <div
              className={`text-4xl font-bold px-8 py-4 rounded-2xl ${
                state.currentVote === "real"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {state.currentVote === "real" ? "📷 Real" : "🍌 AI"}
            </div>
            <p className="text-gray-500">{t("waitingForResults")}</p>
          </div>
        )}

        {/* Result */}
        {state.status === "result" && (
          <div className="text-center space-y-6">
            <div
              className={`text-4xl font-bold px-8 py-4 rounded-2xl ${
                state.isCorrect
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {state.isCorrect ? tGame("correct") : tGame("incorrect")}
            </div>
            <p className="text-xl text-gray-600">
              {state.correctAnswer === "real"
                ? tGame("wasReal")
                : tGame("wasAI")}
            </p>
            <p className="text-gray-500">{tGame("waiting")}</p>
          </div>
        )}
      </div>

      {/* Footer - current score */}
      <footer className="text-center text-gray-500 text-sm">
        {state.player?.nickname}
      </footer>
    </main>
  );
}
