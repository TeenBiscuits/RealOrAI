import { NextRequest, NextResponse } from 'next/server';
import { getGameState } from '@/lib/game-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const { searchParams } = new URL(request.url);
  const lastUpdate = searchParams.get('lastUpdate');

  console.log(`[API] Poll request for room ${roomId}, lastUpdate: ${lastUpdate}`);

  const gameState = getGameState(roomId);

  if (!gameState) {
    return NextResponse.json(
      { error: 'Room not found' },
      { status: 404 }
    );
  }

  // Return current game state
  return NextResponse.json({
    gameState,
    timestamp: Date.now(),
  });
}
