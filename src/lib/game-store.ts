import { RoomState, GameState, Player, GameImage, ImageType } from "./types";
import { v4 as uuidv4 } from "uuid";
import { selectGameImages } from "./images";

// In-memory store for rooms (in production, use Redis or similar)
const rooms = new Map<string, RoomState>();

const TOTAL_ROUNDS = 12;
const TIME_PER_ROUND = 30;

export function createRoom(hostId: string): RoomState {
  const roomId = generateRoomCode();
  const images = selectGameImages(TOTAL_ROUNDS);

  const room: RoomState = {
    roomId,
    hostId,
    images,
    gameState: {
      status: "lobby",
      currentRound: 0,
      totalRounds: TOTAL_ROUNDS,
      currentImage: null,
      timeLeft: TIME_PER_ROUND,
      players: [],
    },
  };

  rooms.set(roomId, room);
  return room;
}

export function getRoom(roomId: string): RoomState | undefined {
  return rooms.get(roomId);
}

export function deleteRoom(roomId: string): void {
  rooms.delete(roomId);
}

export function addPlayer(roomId: string, nickname: string): Player | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  // Check if nickname is taken
  if (
    room.gameState.players.some(
      (p) => p.nickname.toLowerCase() === nickname.toLowerCase(),
    )
  ) {
    return null;
  }

  // Don't allow joining if game is in progress
  if (room.gameState.status !== "lobby") {
    return null;
  }

  const player: Player = {
    id: uuidv4(),
    nickname,
    score: 0,
    hasVoted: false,
  };

  room.gameState.players.push(player);
  return player;
}

export function removePlayer(roomId: string, playerId: string): void {
  const room = rooms.get(roomId);
  if (!room) return;

  room.gameState.players = room.gameState.players.filter(
    (p) => p.id !== playerId,
  );
}

export function startGame(roomId: string): GameState | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.gameState.status = "playing";
  room.gameState.currentRound = 1;
  room.gameState.currentImage = room.images[0];
  room.gameState.timeLeft = TIME_PER_ROUND;

  // Reset all player votes
  room.gameState.players.forEach((p) => {
    p.hasVoted = false;
    p.currentVote = undefined;
  });

  return room.gameState;
}

export function submitVote(
  roomId: string,
  playerId: string,
  vote: ImageType,
): boolean {
  const room = rooms.get(roomId);
  if (!room) return false;

  const player = room.gameState.players.find((p) => p.id === playerId);
  if (!player || player.hasVoted) return false;

  player.currentVote = vote;
  player.hasVoted = true;

  return true;
}

export function allPlayersVoted(roomId: string): boolean {
  const room = rooms.get(roomId);
  if (!room) return false;

  return room.gameState.players.every((p) => p.hasVoted);
}

export function endRound(
  roomId: string,
): { correctAnswer: ImageType; players: Player[] } | null {
  const room = rooms.get(roomId);
  if (!room || !room.gameState.currentImage) return null;

  const correctAnswer = room.gameState.currentImage.type;
  room.gameState.correctAnswer = correctAnswer;
  room.gameState.status = "showing-result";

  // Update scores
  room.gameState.players.forEach((player) => {
    if (player.currentVote === correctAnswer) {
      player.score += 1;
    }
  });

  return {
    correctAnswer,
    players: room.gameState.players,
  };
}

export function nextRound(roomId: string): GameState | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  const nextRoundNum = room.gameState.currentRound + 1;

  if (nextRoundNum > TOTAL_ROUNDS) {
    room.gameState.status = "finished";
    return room.gameState;
  }

  room.gameState.currentRound = nextRoundNum;
  room.gameState.currentImage = room.images[nextRoundNum - 1];
  room.gameState.timeLeft = TIME_PER_ROUND;
  room.gameState.status = "playing";
  room.gameState.correctAnswer = undefined;

  // Reset votes
  room.gameState.players.forEach((p) => {
    p.hasVoted = false;
    p.currentVote = undefined;
  });

  return room.gameState;
}

export function updateTimeLeft(roomId: string, timeLeft: number): void {
  const room = rooms.get(roomId);
  if (room) {
    room.gameState.timeLeft = timeLeft;
  }
}

export function getGameState(roomId: string): GameState | null {
  const room = rooms.get(roomId);
  return room?.gameState || null;
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Ensure uniqueness
  if (rooms.has(code)) {
    return generateRoomCode();
  }
  return code;
}
