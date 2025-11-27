import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import {
  createRoom,
  getRoom,
  addPlayer,
  removePlayer,
  startGame,
  submitVote,
  allPlayersVoted,
  endRound,
  nextRound,
  updateTimeLeft,
  getGameState,
} from "./src/lib/game-store";
import type { WSMessage, ImageType, Player, GameState } from "./src/lib/types";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

interface ExtendedWebSocket extends WebSocket {
  roomId?: string;
  playerId?: string;
  isHost?: boolean;
  isAlive?: boolean;
}

// Store WebSocket connections by room
const roomConnections = new Map<string, Set<ExtendedWebSocket>>();
const roomTimers = new Map<string, NodeJS.Timeout>();

function broadcast(
  roomId: string,
  message: WSMessage,
  excludeWs?: ExtendedWebSocket,
) {
  const connections = roomConnections.get(roomId);
  if (!connections) return;

  const data = JSON.stringify(message);
  connections.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

function sendTo(ws: ExtendedWebSocket, message: WSMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function startRoundTimer(roomId: string, wss: WebSocketServer) {
  // Clear any existing timer
  const existingTimer = roomTimers.get(roomId);
  if (existingTimer) {
    clearInterval(existingTimer);
  }

  let timeLeft = 30;
  const timer = setInterval(() => {
    timeLeft -= 1;
    updateTimeLeft(roomId, timeLeft);

    broadcast(roomId, {
      type: "game:state",
      payload: { timeLeft },
    });

    if (timeLeft <= 0 || allPlayersVoted(roomId)) {
      clearInterval(timer);
      roomTimers.delete(roomId);
      handleRoundEnd(roomId);
    }
  }, 1000);

  roomTimers.set(roomId, timer);
}

function handleRoundEnd(roomId: string) {
  const result = endRound(roomId);
  if (!result) return;

  broadcast(roomId, {
    type: "round:end",
    payload: result,
  });

  // After 4 seconds, move to next round or end game
  setTimeout(() => {
    const gameState = nextRound(roomId);
    if (!gameState) return;

    if (gameState.status === "finished") {
      broadcast(roomId, {
        type: "game:end",
        payload: { players: gameState.players },
      });
    } else {
      broadcast(roomId, {
        type: "round:start",
        payload: {
          round: gameState.currentRound,
          image: {
            id: gameState.currentImage?.id,
            src: gameState.currentImage?.src,
            alt: gameState.currentImage?.alt,
          },
          timeLeft: gameState.timeLeft,
        },
      });
      startRoundTimer(roomId, {} as WebSocketServer);
    }
  }, 4000);
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });

  // Handle upgrade requests manually
  server.on("upgrade", (request, socket, head) => {
    const parsedUrl = parse(request.url || "", true);

    // Only handle WebSocket connections on /ws path
    if (parsedUrl.pathname !== "/ws") {
      socket.destroy();
      return;
    }

    // Verify this is a proper WebSocket upgrade request
    const upgrade = request.headers["upgrade"];
    const connection = request.headers["connection"];
    const secWebSocketKey = request.headers["sec-websocket-key"];

    // All WebSocket upgrade requests must have these headers
    if (
      !upgrade ||
      !connection ||
      !secWebSocketKey ||
      upgrade.toLowerCase() !== "websocket" ||
      !connection.toLowerCase().includes("upgrade")
    ) {
      console.log("Rejecting non-WebSocket upgrade request");
      socket.destroy();
      return;
    }

    // Handle the WebSocket upgrade
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  // Heartbeat to detect disconnected clients
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const extWs = ws as ExtendedWebSocket;
      if (extWs.isAlive === false) {
        if (extWs.roomId && extWs.playerId) {
          removePlayer(extWs.roomId, extWs.playerId);
          broadcastPlayerList(extWs.roomId);
        }
        return ws.terminate();
      }
      extWs.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
  });

  function broadcastPlayerList(roomId: string) {
    const gameState = getGameState(roomId);
    if (gameState) {
      broadcast(roomId, {
        type: "game:state",
        payload: { players: gameState.players },
      });
    }
  }

  wss.on("connection", (ws: ExtendedWebSocket) => {
    console.log("WebSocket client connected");
    ws.isAlive = true;

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());

        switch (message.type) {
          case "player:join": {
            const { roomId, nickname, isHost } = message.payload as {
              roomId: string;
              nickname?: string;
              isHost?: boolean;
            };

            if (isHost) {
              // Host is joining/creating room
              ws.roomId = roomId;
              ws.isHost = true;

              if (!roomConnections.has(roomId)) {
                roomConnections.set(roomId, new Set());
              }
              roomConnections.get(roomId)?.add(ws);

              const room = getRoom(roomId);
              if (room) {
                sendTo(ws, {
                  type: "game:state",
                  payload: { gameState: room.gameState },
                });
              }
            } else if (nickname) {
              // Player is joining
              const player = addPlayer(roomId, nickname);

              if (!player) {
                sendTo(ws, {
                  type: "error",
                  payload: {
                    message: "Could not join room",
                    code: "JOIN_FAILED",
                  },
                });
                return;
              }

              ws.roomId = roomId;
              ws.playerId = player.id;
              ws.isHost = false;

              if (!roomConnections.has(roomId)) {
                roomConnections.set(roomId, new Set());
              }
              roomConnections.get(roomId)?.add(ws);

              // Send confirmation to player
              sendTo(ws, {
                type: "player:join",
                payload: { player, success: true },
              });

              // Broadcast updated player list
              broadcastPlayerList(roomId);
            }
            break;
          }

          case "game:start": {
            if (!ws.roomId || !ws.isHost) return;

            const gameState = startGame(ws.roomId);
            if (!gameState) return;

            broadcast(ws.roomId, {
              type: "round:start",
              payload: {
                round: gameState.currentRound,
                image: {
                  id: gameState.currentImage?.id,
                  src: gameState.currentImage?.src,
                  alt: gameState.currentImage?.alt,
                },
                timeLeft: gameState.timeLeft,
              },
            });

            startRoundTimer(ws.roomId, wss);
            break;
          }

          case "player:vote": {
            if (!ws.roomId || !ws.playerId) return;

            const { vote } = message.payload as { vote: ImageType };
            const success = submitVote(ws.roomId, ws.playerId, vote);

            if (success) {
              // Broadcast vote count (not the actual votes)
              const gameState = getGameState(ws.roomId);
              if (gameState) {
                const voteCount = gameState.players.filter(
                  (p) => p.hasVoted,
                ).length;
                broadcast(ws.roomId, {
                  type: "game:state",
                  payload: {
                    voteCount,
                    totalPlayers: gameState.players.length,
                  },
                });
              }

              // Check if all players have voted
              if (allPlayersVoted(ws.roomId)) {
                const timer = roomTimers.get(ws.roomId);
                if (timer) {
                  clearInterval(timer);
                  roomTimers.delete(ws.roomId);
                }
                handleRoundEnd(ws.roomId);
              }
            }
            break;
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      if (ws.roomId) {
        const connections = roomConnections.get(ws.roomId);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            roomConnections.delete(ws.roomId);
            const timer = roomTimers.get(ws.roomId);
            if (timer) {
              clearInterval(timer);
              roomTimers.delete(ws.roomId);
            }
          }
        }

        if (ws.playerId) {
          removePlayer(ws.roomId, ws.playerId);
          broadcastPlayerList(ws.roomId);
        }
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server ready`);
  });
});
