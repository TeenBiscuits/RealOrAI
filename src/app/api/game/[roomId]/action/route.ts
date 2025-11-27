import { NextRequest, NextResponse } from 'next/server';
import {
  createRoom,
  getRoom,
  addPlayer,
  startGame,
  submitVote,
  getGameState,
} from '@/lib/game-store';
import type { ImageType } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const body = await request.json();
  const { action, payload } = body;

  console.log(`[API] Action in room ${roomId}:`, action, payload);

  try {
    switch (action) {
      case 'create_room': {
        const hostId = uuidv4();
        const room = createRoom(hostId);
        console.log(`[API] Room created - roomId: ${room.roomId}, hostId: ${hostId}`);

        return NextResponse.json({
          success: true,
          roomId: room.roomId,
          hostId: room.hostId,
          gameState: room.gameState,
        });
      }

      case 'join': {
        const { nickname } = payload;

        const room = getRoom(roomId);
        if (!room) {
          return NextResponse.json(
            { error: 'Room not found' },
            { status: 404 }
          );
        }

        const player = addPlayer(roomId, nickname);

        if (!player) {
          return NextResponse.json(
            { error: 'Could not join room. Name might be taken or game already started.' },
            { status: 400 }
          );
        }

        console.log(`[API] Player ${nickname} (${player.id}) joined room ${roomId}`);

        return NextResponse.json({
          success: true,
          player,
          gameState: room.gameState,
        });
      }

      case 'start_game': {
        const gameState = startGame(roomId);

        if (!gameState) {
          return NextResponse.json(
            { error: 'Could not start game' },
            { status: 400 }
          );
        }

        console.log(`[API] Game started in room ${roomId}`);

        return NextResponse.json({
          success: true,
          gameState,
        });
      }

      case 'vote': {
        const { playerId, vote } = payload as { playerId: string; vote: ImageType };

        const success = submitVote(roomId, playerId, vote);

        if (!success) {
          return NextResponse.json(
            { error: 'Could not submit vote' },
            { status: 400 }
          );
        }

        console.log(`[API] Player ${playerId} voted ${vote} in room ${roomId}`);

        const gameState = getGameState(roomId);

        return NextResponse.json({
          success: true,
          gameState,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(`[API] Error handling action in room ${roomId}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
