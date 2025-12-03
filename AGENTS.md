# Agent Guidelines for Real or AI

A multiplayer/solo game where players guess if an image is real or AI-generated.

## Commands

- `bun run dev` - Start dev server with WebSocket support (port 3000)
- `bun run build` - Build for production
- `bun run start` - Run production server with WebSocket
- `bun run lint` - Run ESLint (no fix flag configured)
- No test framework configured

## Code Style

- **TypeScript**: Strict mode enabled, use `@/*` path alias for imports from `src/`
- **Runtime**: Uses Bun, not Node.js; prefer Bun APIs where applicable
- **Components**: PascalCase named exports, `"use client"` directive for client components
- **Hooks**: camelCase with `use` prefix in `src/hooks/`, return objects not arrays
- **Types**: Define in `src/lib/types.ts`, use `interface` for objects, `type` for unions/literals
- **Styling**: TailwindCSS v4 inline classes, Material UI light theme (bg-white, blue-600 primary, shadow-material-3)
- **i18n**: Use `useTranslations("namespace")` from next-intl, translations in `src/i18n/{locale}.json`
- **API Routes**: Place in `src/app/api/*/route.ts`, export named GET/POST functions, use NextRequest/NextResponse
- **Error Handling**: Use early returns, log errors with `console.error`, return JSON errors with status codes
- **Formatting**: 2-space indent, double quotes, semicolons required, trailing commas in multiline
- **WebSocket**: Real-time events in `server.ts`, message types prefixed with namespace (e.g. `room:create`)
- **Images**: Images stored in `public/images/{real,ai}/`, use Next.js Image component with fill prop
