"use client";

import { useState, useCallback, use } from "react";
import { useTranslations } from "next-intl";
import { useWebSocket } from "@/hooks/useWebSocket";
import { VoteButtons } from "@/components/VoteButtons";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Footer } from "@/components/Footer";
import type { WSMessage, Player, ImageType } from "@/lib/types";

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

export default function JoinPage({ params }: JoinPageProps) {
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

  const handleMessage = useCallback((message: WSMessage) => {
    switch (message.type) {
      case "player:join": {
        const payload = message.payload as {
          player: Player;
          success: boolean;
        };
        if (payload.success) {
          setState((prev) => ({
            ...prev,
            status: "waiting",
            player: payload.player,
          }));
          setError(null);
        }
        break;
      }

      case "error": {
        const payload = message.payload as {
          message: string;
          code: string;
        };
        setError(payload.message);
        break;
      }

      case "game:state": {
        const payload = message.payload as { players?: Player[] };
        if (payload.players) {
          setState((prev) => ({
            ...prev,
            players: payload.players!,
          }));
        }
        break;
      }

      case "round:start": {
        const payload = message.payload as {
          round: number;
          timeLeft: number;
        };
        setState((prev) => ({
          ...prev,
          status: "playing",
          currentRound: payload.round,
          currentVote: null,
          isCorrect: null,
          correctAnswer: null,
        }));
        break;
      }

      case "round:end": {
        const payload = message.payload as {
          correctAnswer: ImageType;
          players: Player[];
        };

        setState((prev) => {
          const updatedPlayer = payload.players.find(
            (p) => p.id === prev.player?.id,
          );
          const isCorrect = prev.currentVote === payload.correctAnswer;

          return {
            ...prev,
            status: "result",
            correctAnswer: payload.correctAnswer,
            isCorrect,
            players: payload.players,
            player: updatedPlayer || prev.player,
          };
        });
        break;
      }

      case "game:end": {
        const payload = message.payload as { players: Player[] };
        const sortedPlayers = [...payload.players].sort(
          (a, b) => b.score - a.score,
        );

        setState((prev) => {
          const rank =
            sortedPlayers.findIndex((p) => p.id === prev.player?.id) + 1;
          const updatedPlayer = sortedPlayers.find(
            (p) => p.id === prev.player?.id,
          );

          return {
            ...prev,
            status: "finished",
            players: sortedPlayers,
            finalRank: rank,
            player: updatedPlayer || prev.player,
          };
        });
        break;
      }
    }
  }, []);

  const { isConnected, send } = useWebSocket({
    onMessage: handleMessage,
    autoConnect: true,
  });

  const handleJoin = () => {
    if (!nickname.trim()) return;

    send({
      type: "player:join",
      payload: { roomId, nickname: nickname.trim() },
    });
  };

  const handleVote = (vote: ImageType) => {
    if (state.currentVote) return;

    setState((prev) => ({
      ...prev,
      status: "voted",
      currentVote: vote,
    }));

    send({
      type: "player:vote",
      payload: { vote },
    });
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  // Joining - enter nickname
  if (state.status === "joining") {
    return (
      <main className="flex min-h-dvh flex-col bg-gray-50">
        <header className="flex justify-end p-4">
          <LanguageSwitcher />
        </header>

        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {tGame("title")}
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
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-lg text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />

              {error && (
                <p className="text-center text-sm text-red-600">{error}</p>
              )}

              <button
                onClick={handleJoin}
                disabled={!nickname.trim() || !isConnected}
                className="shadow-material-2 w-full rounded-xl bg-blue-600 py-4 text-xl font-bold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("join")}
              </button>
            </div>

            {!isConnected && (
              <p className="text-center text-sm text-amber-600">
                Connecting to server...
              </p>
            )}
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  // Waiting for game to start
  if (state.status === "waiting") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-gray-50 p-8">
        <div className="space-y-6 text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-purple-600" />
          <div>
            <p className="mb-2 text-2xl font-bold text-gray-900">
              {t("connected")} ✓
            </p>
            <p className="text-gray-600">{t("waiting")}</p>
          </div>
          <div className="shadow-material-1 rounded-xl border border-gray-200 bg-white px-6 py-4">
            <p className="text-sm text-gray-600">
              {state.players.length} {t("players")}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Game finished - show final result
  if (state.status === "finished") {
    const percentage = state.player
      ? Math.round((state.player.score / state.totalRounds) * 100)
      : 0;

    return (
      <main className="flex min-h-dvh flex-col bg-gray-50">
        <header className="flex items-center justify-center p-4">
          <div className="text-2xl font-bold text-gray-900">
            {tGame("title")}
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {tLeaderboard("title")}
            </h2>

            {/* Your result */}
            <div className="shadow-material-2 rounded-2xl border border-blue-200 bg-white p-6">
              <div className="mb-4 text-6xl">
                {getRankEmoji(state.finalRank || 0)}
              </div>
              <p className="mb-2 text-gray-600">
                {state.player?.nickname} {tLeaderboard("you")}
              </p>
              <p className="text-4xl font-bold text-gray-900">{percentage}%</p>
              <p className="text-gray-500">
                {state.player?.score}/{state.totalRounds} correct
              </p>
            </div>

            {/* Top 3 */}
            <div className="space-y-2">
              {state.players.slice(0, 3).map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-xl p-3 shadow-sm ${
                    player.id === state.player?.id
                      ? "border border-blue-200 bg-blue-50"
                      : "border border-gray-200 bg-white"
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
        </div>

        <Footer />
      </main>
    );
  }

  // Playing or showing result
  return (
    <main className="flex min-h-dvh flex-col bg-gray-50 p-4">
      {/* Header */}
      <header className="mb-4 text-center">
        <p className="text-gray-500">
          {tGame("round")} {state.currentRound}/{state.totalRounds}
        </p>
        <p className="font-bold text-gray-900">
          {tGame("score")}: {state.player?.score || 0}
        </p>
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center">
        {/* Playing - show vote buttons */}
        {state.status === "playing" && (
          <div className="w-full space-y-8">
            <p className="text-center text-xl text-gray-600">{tGame("look")}</p>
            <VoteButtons
              onVote={handleVote}
              selectedVote={state.currentVote}
              size="large"
            />
          </div>
        )}

        {/* Voted - waiting for result */}
        {state.status === "voted" && (
          <div className="space-y-4 text-center">
            <p className="text-xl text-gray-600">{t("youVoted")}</p>
            <div
              className={`rounded-2xl px-8 py-4 text-4xl font-bold ${
                state.currentVote === "real"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {state.currentVote === "real" ? t("real") : t("ai")}
            </div>
            <p className="text-gray-500">{t("waitingForResults")}</p>
          </div>
        )}

        {/* Result */}
        {state.status === "result" && (
          <div className="space-y-6 text-center">
            <div
              className={`rounded-2xl px-8 py-4 text-4xl font-bold ${
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
      <footer className="text-center text-sm text-gray-500">
        {state.player?.nickname}
      </footer>
    </main>
  );
}
