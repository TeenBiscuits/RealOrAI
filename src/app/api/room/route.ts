import { NextRequest, NextResponse } from "next/server";
import { createRoom, getRoom } from "@/lib/game-store";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const hostId = uuidv4();
    const room = createRoom(hostId);

    console.log(
      `[API] Room created - roomId: ${room.roomId}, hostId: ${hostId}`,
    );

    return NextResponse.json({
      roomId: room.roomId,
      hostId: room.hostId,
    });
  } catch (error) {
    console.error("[API] Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    console.log("[API] GET room - missing roomId");
    return NextResponse.json({ error: "Room ID required" }, { status: 400 });
  }

  const room = getRoom(roomId);
  console.log(`[API] GET room ${roomId} - exists: ${!!room}`);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({
    roomId: room.roomId,
    status: room.gameState.status,
    playerCount: room.gameState.players.length,
  });
}
