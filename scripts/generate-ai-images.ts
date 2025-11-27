/**
 * Script to generate AI images using Google's Imagen API (Gemini with image generation)
 * 
 * Usage: bun run scripts/generate-ai-images.ts [count]
 * 
 * Environment variables required:
 * - GOOGLE_API_KEY: Your Google AI API key
 * 
 * Example: GOOGLE_API_KEY=your_key bun run scripts/generate-ai-images.ts 10
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'ai');
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
];

async function processImage(imageBuffer: Buffer, outputPath: string): Promise<void> {
  await sharp(imageBuffer)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: 'cover',
      position: 'center',
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
    console.error('Error: GOOGLE_API_KEY environment variable is required');
    console.log('Usage: GOOGLE_API_KEY=your_key bun run scripts/generate-ai-images.ts [count]');
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Use Imagen 3 model for image generation
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp-image-generation",
    generationConfig: {
      responseModalities: ["image", "text"],
    } as any,
  });

  console.log(`\n🍌 Generating ${count} AI images...\n`);

  // Get existing images to determine starting index
  const existingFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.jpg'));
  let startIndex = existingFiles.length;

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < count; i++) {
    const promptIndex = (startIndex + i) % IMAGE_PROMPTS.length;
    const prompt = IMAGE_PROMPTS[promptIndex];
    const filename = `ai_${String(startIndex + i).padStart(4, '0')}.jpg`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    console.log(`[${i + 1}/${count}] Generating: "${prompt.substring(0, 50)}..."`);

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      
      // Extract image from response
      const parts = response.candidates?.[0]?.content?.parts;
      if (!parts) {
        throw new Error('No response parts received');
      }

      let imageData: Buffer | null = null;
      
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          imageData = Buffer.from(part.inlineData.data, 'base64');
          break;
        }
      }

      if (!imageData) {
        throw new Error('No image data in response');
      }

      // Process and save image
      await processImage(imageData, outputPath);
      
      console.log(`   ✅ Saved: ${filename}`);
      successCount++;

      // Rate limiting - wait between requests
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      failCount++;
      
      // Wait longer after errors
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📁 Output: ${OUTPUT_DIR}\n`);
}

// Parse command line arguments
const count = parseInt(process.argv[2] || '10', 10);

if (isNaN(count) || count < 1) {
  console.error('Error: Please provide a valid number of images to generate');
  process.exit(1);
}

generateImages(count);
