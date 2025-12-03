/**
 * Client-side utility for tracking which images a user has seen
 * Uses localStorage to persist across sessions
 */

const SEEN_IMAGES_KEY = "realoria_seen_images";

export interface SeenImagesData {
  seenIds: string[];
  lastUpdated: number;
}

/**
 * Get the list of image IDs that the user has already seen
 */
export function getSeenImageIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(SEEN_IMAGES_KEY);
    if (!data) return [];

    const parsed: SeenImagesData = JSON.parse(data);
    return parsed.seenIds || [];
  } catch (error) {
    console.error("Error reading seen images:", error);
    return [];
  }
}

/**
 * Mark a list of image IDs as seen
 */
export function markImagesAsSeen(imageIds: string[]): void {
  if (typeof window === "undefined") return;

  try {
    const currentSeen = getSeenImageIds();
    const updatedSeen = [...new Set([...currentSeen, ...imageIds])];

    const data: SeenImagesData = {
      seenIds: updatedSeen,
      lastUpdated: Date.now(),
    };

    localStorage.setItem(SEEN_IMAGES_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving seen images:", error);
  }
}

/**
 * Reset the list of seen images (start fresh)
 */
export function resetSeenImages(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(SEEN_IMAGES_KEY);
  } catch (error) {
    console.error("Error resetting seen images:", error);
  }
}

/**
 * Check if we need to reset (when user has seen all or most images)
 * Returns true if we should reset the seen list
 */
export function shouldResetSeenImages(
  totalAvailableImages: number,
  seenCount: number,
): boolean {
  // If user has seen 90% or more of available images, reset
  return seenCount >= totalAvailableImages * 0.9;
}
