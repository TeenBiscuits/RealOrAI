# Agent Guidelines for Real or AI

## Commands
- `bun install` - Install dependencies
- `bun run dev` - Start dev server with WebSocket support (port 3000)
- `bun run build` - Build for production
- `bun run lint` - Run ESLint
- `bun run setup-images [count]` - Download real + generate AI images
- No test framework configured

## Code Style
- **TypeScript**: Strict mode enabled, use `@/*` path alias for imports from `src/`
- **Components**: PascalCase named exports in `src/components/`, add `'use client'` directive for client components
- **Hooks**: camelCase with `use` prefix in `src/hooks/`, return objects not arrays
- **Types**: Define in `src/lib/types.ts`, use `interface` for objects, `type` for unions
- **Styling**: TailwindCSS classes inline, Material UI light theme (white backgrounds, gray-50/100 surfaces, blue-600 primary)
- **i18n**: Use `useTranslations('namespace')` hook, translations in `src/i18n/{locale}.json` (English: "Real or AI", Spanish: "Real o IA")
- **API Routes**: Place in `src/app/api/*/route.ts`, export GET/POST functions
- **Error Handling**: Return `null` for not-found cases, use early returns, log errors to console
- **Formatting**: 2-space indent, single quotes preferred, semicolons optional (ESLint handles it)
- **Colors**: Use Material Design colors - bg-white, text-gray-900, blue-600 primary, shadow-material-1/2/3
- **WebSocket**: Real-time events in `server.ts`, use custom Bun server with ws library
