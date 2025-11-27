/**
 * Script to create placeholder images for testing
 * 
 * Usage: bun run scripts/create-placeholders.ts
 * 
 * This creates simple colored placeholder images so you can test the app
 * before downloading/generating real images.
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const REAL_DIR = path.join(process.cwd(), 'public', 'images', 'real');
const AI_DIR = path.join(process.cwd(), 'public', 'images', 'ai');
const WIDTH = 1280;
const HEIGHT = 720;
const COUNT = 6; // 6 of each type = 12 total

async function createPlaceholder(
  outputPath: string,
  color: string,
  text: string
): Promise<void> {
  // Create an SVG with text
  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif" 
        font-size="48" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >
        ${text}
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 85 })
    .toFile(outputPath);
}

async function main(): Promise<void> {
  // Ensure directories exist
  if (!fs.existsSync(REAL_DIR)) {
    fs.mkdirSync(REAL_DIR, { recursive: true });
  }
  if (!fs.existsSync(AI_DIR)) {
    fs.mkdirSync(AI_DIR, { recursive: true });
  }

  console.log('\n📷 Creating placeholder images...\n');

  // Create real placeholders (blue-ish colors)
  const realColors = ['#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];
  for (let i = 0; i < COUNT; i++) {
    const filename = `real_${String(i).padStart(4, '0')}.jpg`;
    const filepath = path.join(REAL_DIR, filename);
    await createPlaceholder(filepath, realColors[i], `REAL IMAGE ${i + 1}`);
    console.log(`   ✅ Created: real/${filename}`);
  }

  // Create AI placeholders (purple-ish colors)
  const aiColors = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#6d28d9', '#5b21b6'];
  for (let i = 0; i < COUNT; i++) {
    const filename = `ai_${String(i).padStart(4, '0')}.jpg`;
    const filepath = path.join(AI_DIR, filename);
    await createPlaceholder(filepath, aiColors[i], `AI IMAGE ${i + 1}`);
    console.log(`   ✅ Created: ai/${filename}`);
  }

  console.log('\n✅ Placeholder images created!');
  console.log('   You can now run: bun run dev\n');
  console.log('   To get real images, run: bun run setup-images 24\n');
}

main();
