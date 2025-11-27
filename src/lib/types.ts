export type ImageType = "real" | "ai";

export interface GameImage {
  id: string;
  src: string;
  type: ImageType;
  alt?: string;
}

export interface Player {
  id: string;
  nickname: string;
  score: number;
  currentVote?: ImageType;
  hasVoted: boolean;
}

export interface GameState {
  status: "lobby" | "playing" | "showing-result" | "finished";
  currentRound: number;
  totalRounds: number;
  currentImage: GameImage | null;
  timeLeft: number;
  players: Player[];
  correctAnswer?: ImageType;
}

export interface RoomState {
  roomId: string;
  hostId: string;
  gameState: GameState;
  images: GameImage[];
}

// WebSocket message types
export type WSMessageType =
  | "room:create"
  | "room:created"
  | "player:join"
  | "player:leave"
  | "player:vote"
  | "game:start"
  | "game:state"
  | "round:start"
  | "round:end"
  | "game:end"
  | "error";

export interface WSMessage {
  type: WSMessageType;
  payload: unknown;
}

export interface PlayerJoinPayload {
  roomId: string;
  nickname: string;
}

export interface PlayerVotePayload {
  vote: ImageType;
}

export interface GameStatePayload {
  gameState: GameState;
}

export interface RoundStartPayload {
  round: number;
  image: GameImage;
  timeLeft: number;
}

export interface RoundEndPayload {
  correctAnswer: ImageType;
  players: Player[];
}

export interface GameEndPayload {
  players: Player[];
}

export interface ErrorPayload {
  message: string;
  code: string;
}
