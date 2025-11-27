import { useEffect, useRef, useState, useCallback } from "react";
import type { GameState } from "@/lib/types";

interface UsePollingOptions {
  roomId: string | null;
  onUpdate?: (gameState: GameState) => void;
  enabled?: boolean;
  interval?: number;
}

export function usePolling(options: UsePollingOptions) {
  const { roomId, onUpdate, enabled = true, interval = 1000 } = options;
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const poll = useCallback(async () => {
    if (!roomId || !enabled) return;

    try {
      const response = await fetch(
        `/api/game/${roomId}/poll?lastUpdate=${lastUpdateRef.current}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError("Room not found");
          return;
        }
        throw new Error("Failed to poll");
      }

      const data = await response.json();
      lastUpdateRef.current = data.timestamp;

      setGameState(data.gameState);
      setError(null);

      if (onUpdate) {
        onUpdate(data.gameState);
      }
    } catch (err) {
      console.error("[Polling] Error:", err);
      setError("Connection error");
    }
  }, [roomId, enabled, onUpdate]);

  useEffect(() => {
    if (!enabled || !roomId) {
      setIsPolling(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    setIsPolling(true);

    // Poll immediately
    poll();

    // Then poll at interval
    intervalRef.current = setInterval(poll, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPolling(false);
    };
  }, [enabled, roomId, interval, poll]);

  const sendAction = useCallback(
    async (action: string, payload: any = {}) => {
      try {
        console.log("[Polling] Sending action:", action, payload);

        // Special handling for room creation (no roomId needed)
        let url: string;
        if (action === "create_room") {
          url = "/api/game/create";
        } else {
          if (!roomId) {
            console.error("[Polling] No roomId provided");
            return { success: false, error: "No room ID" };
          }
          url = `/api/game/${roomId}/action`;
        }

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, payload }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Action failed");
          return { success: false, error: data.error };
        }

        // Update game state immediately after action
        if (data.gameState) {
          setGameState(data.gameState);
          if (onUpdate) {
            onUpdate(data.gameState);
          }
        }

        setError(null);
        return { success: true, ...data };
      } catch (err) {
        console.error("[Polling] Error sending action:", err);
        setError("Failed to send action");
        return { success: false, error: "Network error" };
      }
    },
    [roomId, onUpdate],
  );

  return {
    isPolling,
    error,
    gameState,
    sendAction,
  };
}
