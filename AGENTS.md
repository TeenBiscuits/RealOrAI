# Agent Guidelines for Real or AI

A multiplayer/solo game where players guess if an image is real or AI-generated.

## Commands

- `pnpm dev` - Start dev server with WebSocket support (port 3000)
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- No test framework configured

## Code Style

- **TypeScript**: Strict mode, use `@/*` path alias for imports from `src/`
- **Components**: PascalCase named exports, `"use client"` directive for client components
- **Hooks**: camelCase with `use` prefix in `src/hooks/`, return objects not arrays
- **Types**: Define in `src/lib/types.ts`, use `interface` for objects, `type` for unions
- **Styling**: TailwindCSS v4 inline classes, Material UI light theme (bg-white, blue-600 primary)
- **i18n**: Use `useTranslations("namespace")` hook, translations in `src/i18n/{locale}.json`
- **API Routes**: Place in `src/app/api/*/route.ts`, export named GET/POST functions
- **Error Handling**: Use early returns, log errors with `console.error`, return JSON errors with status codes
- **Formatting**: 2-space indent, double quotes, semicolons required, trailing commas in multiline
- **WebSocket**: Real-time events in `server.ts`, message types in `src/lib/types.ts`
