# 📷 Real or AI 🍌

A multiplayer game where players try to distinguish between real photos and AI-generated images. Test your skills solo or compete with friends in real-time! Inspired by games like LinkedIn, Interpol, and the cooperative style of Kahoot.

## Features

- **Solo Mode**: Play alone with 12 images, 30 seconds each - track previously seen images
- **With Friends Mode**: Host a game session where friends can join via QR code and vote from their mobile devices in real-time
- **Multilingual**: Supports English and Spanish (easily extensible to other languages)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Leaderboard**: See scores update live during multiplayer games
- **Smart Image Pool**: Images are tracked to avoid repetition in solo mode

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 4 with Material Design principles
- **Real-time**: WebSockets (ws library) for multiplayer synchronization
- **i18n**: next-intl for internationalization
- **Image Processing**: Sharp for optimization
- **QR Codes**: qrcode.react for room sharing

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0+ installed ([Installation guide](https://bun.sh/docs/installation))
- Node.js knowledge helpful but not required
- (Optional) Unsplash API key for downloading real images
- (Optional) Google AI API key (Gemini/Imagen) for generating AI images

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd real-or-ia

# Install dependencies
bun install

# Create placeholder images for testing
bun run scripts/create-placeholders.ts

# Start the development server
bun run dev
```

The app will be available at `http://localhost:3000`

### Setting Up Real Images

To replace placeholder images with real photos and AI-generated images:

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Add your API keys to `.env`:
   - Get Unsplash API key at: https://unsplash.com/developers
   - Get Google AI API key at: https://aistudio.google.com/app/apikey

3. Run the setup script:
   ```bash
   bun run setup-images 24  # Downloads 12 real + generates 12 AI images
   ```

### Individual Image Scripts

```bash
# Download only real images from Unsplash
UNSPLASH_ACCESS_KEY=your_key bun run download-real 10

# Generate only AI images using Google Imagen
GOOGLE_API_KEY=your_key bun run generate-ai 10
```

## Game Modes

### Solo Mode

1. Click "Solo" on the home page
2. Each round shows an image for 30 seconds
3. Click "📷 Real" or "🍌 AI" to vote
4. See if you were correct
5. After 12 rounds, view your final score

### With Friends Mode

**Host (on computer/TV):**

1. Click "With Friends" on the home page
2. A QR code and room code will be displayed
3. Wait for players to join
4. Click "Start Game" when ready
5. The game displays images and collects votes from all players
6. After 12 rounds, see the leaderboard

**Players (on mobile):**

1. Scan the QR code or enter the URL
2. Enter a nickname and join
3. When the game starts, vote on each image
4. See your results and final ranking

## Project Structure

```
real-or-ia/
├── src/
│   ├── app/
│   │   ├── [locale]/           # Internationalized pages
│   │   │   ├── page.tsx        # Home page
│   │   │   ├── solo/           # Solo game mode
│   │   │   ├── host/           # Host screen for multiplayer
│   │   │   └── join/[roomId]/  # Player join screen
│   │   └── api/                # API routes
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and game logic
│   └── i18n/                   # Translations
├── public/
│   └── images/
│       ├── real/               # Real photographs
│       └── ai/                 # AI-generated images
├── scripts/                    # Image generation/download scripts
└── server.ts                   # Custom server with WebSocket support
```

## Adding New Languages

1. Create a new translation file in `src/i18n/` (e.g., `fr.json`)
2. Copy the structure from `en.json` and translate
3. Add the locale to `src/i18n/config.ts`:
   ```typescript
   export const locales = ["en", "es", "fr"] as const;
   export const localeNames: Record<Locale, string> = {
     en: "English",
     es: "Español",
     fr: "Français",
   };
   ```

## Image Specifications

All images are processed to:

- **Resolution**: 1280x720 pixels (16:9 aspect ratio)
- **Format**: JPEG (85% quality, progressive)
- **Optimized** for fast web loading

## Development

### Available Scripts

| Script                          | Description                                     |
| ------------------------------- | ----------------------------------------------- |
| `bun run dev`                   | Start development server with WebSocket support |
| `bun run build`                 | Build for production                            |
| `bun run start`                 | Start production server with WebSocket          |
| `bun run lint`                  | Run ESLint to check code quality                |
| `bun run setup-images [count]`  | Download real + generate AI images              |
| `bun run download-real [count]` | Download images from Unsplash                   |
| `bun run generate-ai [count]`   | Generate images with Google Imagen              |

### Environment Variables

See `.env.example` for all available environment variables:

- `UNSPLASH_ACCESS_KEY` - For downloading real photos
- `GOOGLE_API_KEY` - For generating AI images
- `NEXT_PUBLIC_SITE_URL` - Your site URL (production domain)

## Deployment

The app includes a `Dockerfile` and `docker-compose.yml` for easy deployment:

```bash
# Build and run with Docker
docker-compose up --build
```

For production deployment:

1. Set `NEXT_PUBLIC_SITE_URL` to your domain
2. Ensure WebSocket connections are properly configured in your reverse proxy
3. The app runs on port 3000 by default

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Image Attribution

Real images are sourced from [Unsplash](https://unsplash.com). See `public/images/real/ATTRIBUTION.md` for photo credits.

## License

MIT
