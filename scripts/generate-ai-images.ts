/**
 * Script to generate AI images using Google's Gemini 3 Pro Image API
 *
 * Usage: bun run scripts/generate-ai-images.ts [count]
 *
 * Environment variables required:
 * - GOOGLE_API_KEY: Your Google AI API key
 *
 * Example: GOOGLE_API_KEY=your_key bun run scripts/generate-ai-images.ts 10
 */

import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "public", "images", "ai");
const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720; // 16:9 aspect ratio

// Diverse prompts for generating varied AI images
const IMAGE_PROMPTS = [
  "A photorealistic landscape of mountains at sunset with a lake reflection",
  "A realistic portrait of a person in natural lighting, casual setting",
  "A photorealistic city street scene at night with neon lights",
  "A realistic food photograph of a gourmet dish on a restaurant table",
  "A photorealistic wildlife photo of a bird in its natural habitat",
  "A realistic interior design photo of a modern living room",
  "A photorealistic beach scene with waves and palm trees",
  "A realistic photograph of a cute dog playing in a park",
  "A photorealistic forest path with sunlight filtering through trees",
  "A realistic urban architecture photograph of a modern building",
  "A photorealistic coffee shop interior with warm lighting",
  "A realistic photograph of flowers in a garden with morning dew",
  "A photorealistic snowy mountain peak at sunrise",
  "A realistic street photography scene in a busy market",
  "A photorealistic underwater coral reef scene",
  "A realistic photograph of a cat sleeping on a couch",
  "A photorealistic autumn forest with colorful leaves",
  "A realistic food photograph of fresh sushi on a wooden board",
  "A photorealistic desert landscape with sand dunes at golden hour",
  "A realistic photograph of a waterfall in a tropical jungle",
  "A photorealistic vintage car parked on a city street",
  "A realistic portrait photograph in black and white",
  "A photorealistic aerial view of a coastal town",
  "A realistic photograph of a rainy city street with reflections",
  "A photorealistic meadow with wildflowers and butterflies",
  "A photorealistic night sky filled with stars and the Milky Way over a calm lake",
  "A realistic macro photograph of a single raindrop on a leaf",
  "A photorealistic aerial view of a dense forest with mist between the trees",
  "A realistic photograph of a cyclist riding on a mountain road at sunrise",
  "A photorealistic close-up of a human eye with detailed reflections",
  "A realistic photograph of a child flying a colorful kite in a field",
  "A photorealistic city skyline at dawn with soft pastel colors",
  "A realistic photograph of a chef cooking in a professional kitchen",
  "A photorealistic stormy ocean scene with large crashing waves",
  "A realistic photograph of an elderly couple walking hand in hand in a park",
  "A photorealistic aerial view of farmland with geometric crop patterns",
  "A realistic photograph of a musician playing an acoustic guitar on stage",
  "A photorealistic close-up of a bee pollinating a flower",
  "A realistic photograph of a person reading a book near a window with soft light",
  "A photorealistic winter forest with snow-covered trees and soft fog",
  "A realistic photograph of a bustling train station during rush hour",
  "A photorealistic city park in spring with cherry blossoms in full bloom",
  "A realistic photograph of a hot air balloon floating over rolling hills",
  "A photorealistic lake cabin at dusk with warm lights glowing inside",
  "A realistic photograph of a surfer riding a wave at sunset",
  "A photorealistic macro shot of colorful butterfly wings in detail",
  "A realistic photograph of a barista preparing latte art in a café",
  "A photorealistic rainy window with city lights bokeh in the background",
  "A realistic photograph of a person standing on a cliff overlooking the sea",
  "A photorealistic night-time camping scene with a tent under starry skies",
  "A realistic photograph of a street food vendor cooking over an open flame",
  "A photorealistic aerial view of a winding river through green mountains",
  "A realistic photograph of a group of friends laughing at an outdoor café",
  "A photorealistic close-up of melting ice cubes with water droplets",
  "A realistic photograph of a runner on a track captured in mid-stride",
  "A photorealistic city alleyway with puddles reflecting neon signs",
  "A realistic photograph of a horse running across an open field",
  "A photorealistic sunrise over a foggy valley with rays of light streaming through",
  "A realistic photograph of a person working late at a computer in a dark room",
  "A photorealistic underwater scene of a diver swimming with tropical fish",
  "A realistic photograph of a couple dancing together at an outdoor festival",
  "A photorealistic close-up of coffee beans and ground coffee on a rustic table",
  "A realistic photograph of a skyline reflected in a glass building façade",
  "A photorealistic scene of a narrow European street with old stone buildings",
  "A realistic photograph of a person standing in the rain under a bright umbrella",
  "A photorealistic sunset over a field of lavender with distant mountains",
  "A realistic photograph of a dog running along a sandy beach",
  "A photorealistic macro photograph of snowflakes on a dark fabric",
  "A realistic photograph of a busy open-plan office with people collaborating",
  "A photorealistic cityscape during golden hour with long building shadows",
];

async function processImage(
  imageBuffer: Buffer,
  outputPath: string,
): Promise<void> {
  await sharp(imageBuffer)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: "cover",
      position: "center",
    })
    .jpeg({
      quality: 85,
      progressive: true,
    })
    .toFile(outputPath);
}

async function generateImages(count: number): Promise<void> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("Error: GOOGLE_API_KEY environment variable is required");
    console.log(
      "Usage: GOOGLE_API_KEY=your_key bun run scripts/generate-ai-images.ts [count]",
    );
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  const model = "gemini-3-pro-image-preview";

  console.log(`\n🍌 Generating ${count} AI images...\n`);

  // Get existing images to determine starting index
  const existingFiles = fs
    .readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith(".jpg"));
  const startIndex = existingFiles.length;

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < count; i++) {
    const promptIndex = (startIndex + i) % IMAGE_PROMPTS.length;
    const prompt = IMAGE_PROMPTS[promptIndex];
    const filename = `ai_${String(startIndex + i).padStart(4, "0")}.jpg`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    console.log(
      `[${i + 1}/${count}] Generating: "${prompt.substring(0, 50)}..."`,
    );

    try {
      const tools = [
        {
          googleSearch: {},
        },
      ];

      const config = {
        responseModalities: ["IMAGE", "TEXT"],
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K",
        },
        tools,
      };

      const contents = [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ];

      const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
      });

      let imageData: Buffer | null = null;

      for await (const chunk of response) {
        if (
          !chunk.candidates ||
          !chunk.candidates[0].content ||
          !chunk.candidates[0].content.parts
        ) {
          continue;
        }

        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          if (inlineData.mimeType?.startsWith("image/")) {
            imageData = Buffer.from(inlineData.data || "", "base64");
            break;
          }
        }
      }

      if (!imageData) {
        throw new Error("No image data in response");
      }

      // Process and save image
      await processImage(imageData, outputPath);

      console.log(`   ✅ Saved: ${filename}`);
      successCount++;

      // Rate limiting - wait between requests
      if (i < count - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.log(
        `   ❌ Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      failCount++;

      // Wait longer after errors
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📁 Output: ${OUTPUT_DIR}\n`);
}

// Parse command line arguments
const count = parseInt(process.argv[2] || "10", 10);

if (isNaN(count) || count < 1) {
  console.error("Error: Please provide a valid number of images to generate");
  process.exit(1);
}

generateImages(count);
