"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useWebSocket } from "@/hooks/useWebSocket";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { PlayerList } from "@/components/PlayerList";
import { GameImage } from "@/components/GameImage";
import { Timer } from "@/components/Timer";
import { Leaderboard } from "@/components/Leaderboard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Link from "next/link";
import type {
  WSMessage,
  Player,
  GameImage as GameImageType,
  ImageType,
} from "@/lib/types";

type GameStatus =
  | "creating"
  | "lobby"
  | "playing"
  | "showing-result"
  | "finished";

interface HostState {
  status: GameStatus;
  roomId: string | null;
  hostId: string | null;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  currentImage: GameImageType | null;
  timeLeft: number;
  voteCount: number;
  correctAnswer: ImageType | null;
}

export default function HostPage() {
  const t = useTranslations("host");
  const tGame = useTranslations("game");

  const [state, setState] = useState<HostState>({
    status: "creating",
    roomId: null,
    hostId: null,
    players: [],
    currentRound: 0,
    totalRounds: 12,
    currentImage: null,
    timeLeft: 30,
    voteCount: 0,
    correctAnswer: null,
  });

  const handleMessage = useCallback((message: WSMessage) => {
    switch (message.type) {
      case "room:created": {
        const payload = message.payload as { roomId: string; hostId: string };
        setState((prev) => ({
          ...prev,
          status: "lobby",
          roomId: payload.roomId,
          hostId: payload.hostId,
        }));
        break;
      }

      case "game:state": {
        const payload = message.payload as Partial<{
          players: Player[];
          timeLeft: number;
          voteCount: number;
          totalPlayers: number;
          gameState: {
            status: string;
            players: Player[];
            currentRound: number;
            totalRounds: number;
          };
        }>;

        setState((prev) => ({
          ...prev,
          players:
            payload.players ?? payload.gameState?.players ?? prev.players,
          timeLeft: payload.timeLeft ?? prev.timeLeft,
          voteCount: payload.voteCount ?? prev.voteCount,
          currentRound: payload.gameState?.currentRound ?? prev.currentRound,
          totalRounds: payload.gameState?.totalRounds ?? prev.totalRounds,
        }));
        break;
      }

      case "round:start": {
        const payload = message.payload as {
          round: number;
          image: GameImageType;
          timeLeft: number;
        };
        setState((prev) => ({
          ...prev,
          status: "playing",
          currentRound: payload.round,
          currentImage: payload.image,
          timeLeft: payload.timeLeft,
          voteCount: 0,
          correctAnswer: null,
        }));
        break;
      }

      case "round:end": {
        const payload = message.payload as {
          correctAnswer: ImageType;
          players: Player[];
        };
        setState((prev) => ({
          ...prev,
          status: "showing-result",
          correctAnswer: payload.correctAnswer,
          players: payload.players,
        }));
        break;
      }

      case "game:end": {
        const payload = message.payload as { players: Player[] };
        setState((prev) => ({
          ...prev,
          status: "finished",
          players: payload.players,
        }));
        break;
      }
    }
  }, []);

  const { isConnected, send } = useWebSocket({
    onMessage: handleMessage,
    autoConnect: true,
  });

  // Create room on mount via WebSocket
  useEffect(() => {
    if (isConnected && !state.roomId) {
      const hostId = crypto.randomUUID();
      console.log("[Host] Creating room via WebSocket, hostId:", hostId);

      send({
        type: "room:create",
        payload: { hostId },
      });
    }
  }, [isConnected, state.roomId, send]);

  const startGame = () => {
    if (state.players.length === 0) return;
    send({ type: "game:start", payload: {} });
  };

  const getJoinUrl = () => {
    if (typeof window === "undefined" || !state.roomId) return "";
    return `${window.location.origin}/join/${state.roomId}`;
  };

  // Creating room
  if (state.status === "creating" || !state.roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Creating room...</p>
        </div>
      </div>
    );
  }

  // Lobby - waiting for players
  if (state.status === "lobby") {
    return (
      <main className="min-h-screen flex flex-col bg-gray-50">
        <header className="p-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </Link>
          <LanguageSwitcher />
        </header>

        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 p-8">
          {/* QR Code */}
          <QRCodeDisplay url={getJoinUrl()} roomCode={state.roomId} />

          {/* Players and Start */}
          <div className="w-full max-w-md space-y-6">
            <PlayerList players={state.players} />

            <button
              onClick={startGame}
              disabled={state.players.length === 0}
              className={`w-full py-4 font-bold text-xl rounded-2xl transition-all shadow-material-2 ${
                state.players.length > 0
                  ? "bg-green-600 text-white hover:bg-green-700 transform hover:scale-105"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {state.players.length > 0 ? t("startGame") : t("minPlayers")}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Game finished - show leaderboard
  if (state.status === "finished") {
    return (
      <main className="min-h-screen flex flex-col bg-gray-50">
        <header className="p-4 flex justify-end">
          <LanguageSwitcher />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Leaderboard
            players={state.players}
            totalRounds={state.totalRounds}
          />

          <div className="mt-8 flex gap-4">
            <Link
              href="/"
              className="px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all"
            >
              {tGame("backToHome")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Playing or showing result
  return (
    <main className="min-h-screen flex flex-col p-4 md:p-8 bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            {tGame("round")} {state.currentRound} {tGame("of")}{" "}
            {state.totalRounds}
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">
            {state.voteCount}/{state.players.length} {t("votes")}
          </span>
        </div>
        <div className="text-2xl font-bold text-gray-900">📷 Real or AI 🍌</div>
      </header>

      {/* Timer */}
      {state.status === "playing" && (
        <div className="mb-6">
          <Timer timeLeft={state.timeLeft} />
        </div>
      )}

      {/* Image */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {state.currentImage && (
          <GameImage
            src={state.currentImage.src}
            alt={state.currentImage.alt}
            showResult={state.status === "showing-result"}
            isReal={state.correctAnswer === "real"}
          />
        )}

        {/* Result info */}
        {state.status === "showing-result" && (
          <div className="mt-6 text-center">
            <p className="text-xl text-gray-600">
              {state.correctAnswer === "real"
                ? tGame("wasReal")
                : tGame("wasAI")}
            </p>
          </div>
        )}
      </div>

      {/* Player vote status */}
      <div className="mt-6">
        <PlayerList
          players={state.players}
          showVoteStatus={state.status === "playing"}
        />
      </div>
    </main>
  );
}
