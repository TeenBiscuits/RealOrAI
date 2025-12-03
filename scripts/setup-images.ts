/**
 * Script to set up a balanced set of real and AI images
 *
 * Usage: bun run scripts/setup-images.ts [total_count]
 *
 * This script will:
 * 1. Download N/2 real images from Unsplash
 * 2. Generate N/2 AI images using Google Imagen
 *
 * Environment variables required:
 * - UNSPLASH_ACCESS_KEY: Your Unsplash API access key
 * - GOOGLE_API_KEY: Your Google AI API key
 *
 * Example: UNSPLASH_ACCESS_KEY=key1 GOOGLE_API_KEY=key2 bun run scripts/setup-images.ts 24
 */

import { spawn } from "child_process";
import path from "path";

async function runScript(scriptName: string, count: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "scripts", scriptName);
    const proc = spawn("bun", ["run", scriptPath, count.toString()], {
      stdio: "inherit",
      env: process.env,
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script ${scriptName} exited with code ${code}`));
      }
    });

    proc.on("error", reject);
  });
}

async function main() {
  const totalCount = parseInt(process.argv[2] || "24", 10);

  if (isNaN(totalCount) || totalCount < 2) {
    console.error("Error: Please provide a valid total count (minimum 2)");
    process.exit(1);
  }

  const halfCount = Math.floor(totalCount / 2);

  console.log(`\n🎮 Setting up ${totalCount} images for Real or AI\n`);
  console.log(`   📷 Real images: ${halfCount}`);
  console.log(`   🍌 AI images: ${totalCount - halfCount}\n`);

  // Check for required environment variables
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.error(
      "❌ Error: UNSPLASH_ACCESS_KEY environment variable is required",
    );
    process.exit(1);
  }

  if (!process.env.GOOGLE_API_KEY) {
    console.error("❌ Error: GOOGLE_API_KEY environment variable is required");
    process.exit(1);
  }

  try {
    // Download real images
    console.log("📷 Step 1/2: Downloading real images from Unsplash...\n");
    await runScript("download-real-images.ts", halfCount);

    // Generate AI images
    console.log("\n🍌 Step 2/2: Generating AI images...\n");
    await runScript("generate-ai-images.ts", totalCount - halfCount);

    console.log("\n✅ Image setup complete!");
    console.log("   You can now run: bun run dev\n");
  } catch (error) {
    console.error(
      "\n❌ Setup failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

main();
