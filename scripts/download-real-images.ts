/**
 * Script to download real images from Unsplash API
 * 
 * Usage: bun run scripts/download-real-images.ts [count]
 * 
 * Environment variables required:
 * - UNSPLASH_ACCESS_KEY: Your Unsplash API access key
 * 
 * Example: UNSPLASH_ACCESS_KEY=your_key bun run scripts/download-real-images.ts 10
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'real');
const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720; // 16:9 aspect ratio

// Topics for diverse real images
const TOPICS = [
  'nature',
  'architecture',
  'people',
  'animals',
  'food',
  'travel',
  'street-photography',
  'landscape',
  'portraits',
  'city',
  'ocean',
  'mountains',
  'forest',
  'wildlife',
  'flowers',
];

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
  };
  user: {
    name: string;
    username: string;
  };
}

interface UnsplashResponse {
  results: UnsplashPhoto[];
}

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

async function fetchRandomPhotos(accessKey: string, query: string, count: number): Promise<UnsplashPhoto[]> {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Client-ID ${accessKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Unsplash API error: ${response.status} - ${error}`);
  }

  const data: UnsplashResponse = await response.json();
  return data.results;
}

async function downloadAndProcessImage(photo: UnsplashPhoto, outputPath: string): Promise<void> {
  // Use the raw URL with parameters for optimal quality
  const imageUrl = `${photo.urls.raw}&w=${TARGET_WIDTH * 2}&h=${TARGET_HEIGHT * 2}&fit=crop&crop=entropy`;
  
  const response = await fetch(imageUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());
  await processImage(imageBuffer, outputPath);
}

async function downloadImages(count: number): Promise<void> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!accessKey) {
    console.error('Error: UNSPLASH_ACCESS_KEY environment variable is required');
    console.log('Usage: UNSPLASH_ACCESS_KEY=your_key bun run scripts/download-real-images.ts [count]');
    console.log('\nGet your API key at: https://unsplash.com/developers');
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`\n📷 Downloading ${count} real images from Unsplash...\n`);

  // Get existing images to determine starting index
  const existingFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.jpg'));
  let startIndex = existingFiles.length;

  // Track already downloaded image IDs to avoid duplicates
  const downloadedIds = new Set<string>();

  let successCount = 0;
  let failCount = 0;
  let currentIndex = startIndex;

  // Calculate how many images to fetch per topic
  const imagesPerTopic = Math.ceil(count / TOPICS.length);

  for (const topic of TOPICS) {
    if (successCount >= count) break;

    console.log(`\n🔍 Fetching "${topic}" images...`);

    try {
      const photos = await fetchRandomPhotos(accessKey, topic, imagesPerTopic);
      
      for (const photo of photos) {
        if (successCount >= count) break;
        if (downloadedIds.has(photo.id)) continue;

        const filename = `real_${String(currentIndex).padStart(4, '0')}.jpg`;
        const outputPath = path.join(OUTPUT_DIR, filename);

        console.log(`   [${successCount + 1}/${count}] Downloading from @${photo.user.username}...`);

        try {
          await downloadAndProcessImage(photo, outputPath);
          downloadedIds.add(photo.id);
          
          console.log(`   ✅ Saved: ${filename}`);
          successCount++;
          currentIndex++;

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.log(`   ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          failCount++;
        }
      }

      // Rate limiting between topics
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`   ❌ Topic failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create attribution file
  const attributionPath = path.join(OUTPUT_DIR, 'ATTRIBUTION.md');
  const attributionContent = `# Image Attribution

These images are sourced from [Unsplash](https://unsplash.com) and are used under the [Unsplash License](https://unsplash.com/license).

All photos on Unsplash can be used for free for commercial and non-commercial purposes.

Downloaded: ${new Date().toISOString()}
Total images: ${successCount}
`;
  fs.writeFileSync(attributionPath, attributionContent);

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📁 Output: ${OUTPUT_DIR}`);
  console.log(`   📄 Attribution: ${attributionPath}\n`);
}

// Parse command line arguments
const count = parseInt(process.argv[2] || '10', 10);

if (isNaN(count) || count < 1) {
  console.error('Error: Please provide a valid number of images to download');
  process.exit(1);
}

downloadImages(count);
