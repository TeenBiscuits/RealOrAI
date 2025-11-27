'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePolling } from '@/hooks/usePolling';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { PlayerList } from '@/components/PlayerList';
import { GameImage } from '@/components/GameImage';
import { Timer } from '@/components/Timer';
import { Leaderboard } from '@/components/Leaderboard';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import Link from 'next/link';
import type { Player, GameImage as GameImageType, ImageType, GameState } from '@/lib/types';

type GameStatus = 'creating' | 'lobby' | 'playing' | 'showing-result' | 'finished';

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

export default function HostPollingPage() {
  const t = useTranslations('host');
  const tGame = useTranslations('game');

  const [state, setState] = useState<HostState>({
    status: 'creating',
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

  const { isPolling, sendAction, gameState } = usePolling({
    roomId: state.roomId,
    enabled: !!state.roomId,
    interval: 1000,
    onUpdate: (newGameState: GameState) => {
      console.log('[Host] Game state updated:', newGameState);

      setState(prev => ({
        ...prev,
        players: newGameState.players,
        currentRound: newGameState.currentRound,
        totalRounds: newGameState.totalRounds,
        timeLeft: newGameState.timeLeft,
        currentImage: newGameState.currentImage,
        correctAnswer: newGameState.correctAnswer,
        voteCount: newGameState.players.filter(p => p.hasVoted).length,
        status: newGameState.status === 'lobby' ? 'lobby' :
                newGameState.status === 'playing' ? 'playing' :
                newGameState.status === 'showing-result' ? 'showing-result' :
                newGameState.status === 'finished' ? 'finished' : prev.status,
      }));
    },
  });

  // Create room on mount
  useEffect(() => {
    async function createRoom() {
      console.log('[Host] Creating room...');

      const result = await sendAction('create_room');

      if (result.success) {
        console.log('[Host] Room created:', result.roomId);
        setState(prev => ({
          ...prev,
          status: 'lobby',
          roomId: result.roomId,
          hostId: result.hostId,
        }));
      } else {
        console.error('[Host] Failed to create room:', result.error);
      }
    }

    if (!state.roomId) {
      createRoom();
    }
  }, [state.roomId, sendAction]);

  const startGame = async () => {
    if (state.players.length === 0) return;

    console.log('[Host] Starting game...');
    const result = await sendAction('start_game');

    if (!result.success) {
      console.error('[Host] Failed to start game:', result.error);
    }
  };

  const getJoinUrl = () => {
    if (typeof window === 'undefined' || !state.roomId) return '';
    return `${window.location.origin}/join/${state.roomId}`;
  };

  // Creating room
  if (state.status === 'creating' || !state.roomId) {
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
  if (state.status === 'lobby') {
    return (
      <main className="min-h-screen flex flex-col bg-gray-50">
        <header className="p-4 flex justify-between items-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
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
                  ? 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {state.players.length > 0 ? t('startGame') : t('minPlayers')}
            </button>

            <div className="text-center text-sm text-gray-500">
              {isPolling ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Game finished - show leaderboard
  if (state.status === 'finished') {
    return (
      <main className="min-h-screen flex flex-col bg-gray-50">
        <header className="p-4 flex justify-end">
          <LanguageSwitcher />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Leaderboard players={state.players} totalRounds={state.totalRounds} />

          <div className="mt-8 flex gap-4">
            <Link
              href="/"
              className="px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all"
            >
              {tGame('backToHome')}
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
            {tGame('round')} {state.currentRound} {tGame('of')} {state.totalRounds}
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">
            {state.voteCount}/{state.players.length} {t('votes')}
          </span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          📷 Real or AI 🍌
        </div>
      </header>

      {/* Timer */}
      {state.status === 'playing' && (
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
            showResult={state.status === 'showing-result'}
            isReal={state.correctAnswer === 'real'}
          />
        )}

        {/* Result info */}
        {state.status === 'showing-result' && (
          <div className="mt-6 text-center">
            <p className="text-xl text-gray-600">
              {state.correctAnswer === 'real' ? tGame('wasReal') : tGame('wasAI')}
            </p>
          </div>
        )}
      </div>

      {/* Player vote status */}
      <div className="mt-6">
        <PlayerList players={state.players} showVoteStatus={state.status === 'playing'} />
      </div>
    </main>
  );
}
