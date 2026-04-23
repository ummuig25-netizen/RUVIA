# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Hosts the **RUVIA** taxi-hailing PWA.

## Artifacts

- **RUVIA** (`artifacts/ruvia/`, served at `/`) — Dark-mode, mobile-first taxi-hailing PWA with dual Passenger / Driver dashboards, Leaflet map, and BroadcastChannel-based realtime engine.
- **API Server** (`artifacts/api-server/`, served at `/api`) — shared Express scaffold (currently only health check).
- **Canvas** (`artifacts/mockup-sandbox/`) — design sandbox.

## RUVIA architecture

- React + Vite + Tailwind v4, shadcn/ui primitives, framer-motion, sonner.
- Map: `react-leaflet` with CartoDB Dark Matter tiles, custom DivIcon markers (yellow car for drivers, pulsing dot for passenger, yellow pin for destination).
- State: Zustand store (`src/store/useAppStore.ts`).
- Realtime: BroadcastChannel `ruvia-realtime` mirrored to localStorage. Driver heartbeats every 5s. A simulated 4-driver fleet drifts every 5s and auto-accepts ride requests after 2-3s if no real driver tab claims them.
- Pricing: `Fare = max(MIN, BASE + distanceKm * RATE)` with `BASE=2.50, RATE=1.20, MIN=4.00`. Distance via haversine.
- Auth: mocked, persists profiles in localStorage. Role selector (passenger / driver) on register routes user to the correct dashboard.
- Folder layout: `/components`, `/components/map`, `/hooks`, `/services`, `/store`, `/types`, `/pages`.
- SQL schema for porting to a real backend lives at `artifacts/ruvia/src/services/schema.sql` (profiles, taxis, trips).

To demo the live trip flow, open the app in two browser windows: register one as Passenger, the other as Driver.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Express 5, PostgreSQL + Drizzle ORM (available but unused by RUVIA's first build)
- Zod, Orval-generated API client (used by api-server scaffold)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/ruvia run dev` — runs through the workflow `artifacts/ruvia: web`
