import { NextRequest, NextResponse } from "next/server";
import { selectGameImages } from "@/lib/images";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeTypes = searchParams.get("includeTypes") === "true";
    const excludeIdsParam = searchParams.get("excludeIds");

    // Parse excluded image IDs from query parameter
    const excludeIds: string[] = excludeIdsParam
      ? JSON.parse(decodeURIComponent(excludeIdsParam))
      : [];

    const images = selectGameImages(12, excludeIds);

    if (includeTypes) {
      // For solo mode - include types (secure since it's all client-side)
      return NextResponse.json(images);
    }

    // For multiplayer - remove types to prevent cheating
    const sanitizedImages = images.map((img) => ({
      id: img.id,
      src: img.src,
      alt: img.alt,
    }));

    return NextResponse.json(sanitizedImages);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 },
    );
  }
}
