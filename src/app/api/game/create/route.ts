import { NextRequest, NextResponse } from 'next/server';
import { createRoom } from '@/lib/game-store';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const hostId = uuidv4();
    const room = createRoom(hostId);
    console.log(`[API] Room created - roomId: ${room.roomId}, hostId: ${hostId}`);

    return NextResponse.json({
      success: true,
      roomId: room.roomId,
      hostId: room.hostId,
      gameState: room.gameState,
    });
  } catch (error) {
    console.error('[API] Error creating room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
