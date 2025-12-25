# Multi-Shop Billing System — Frontend App

## Overview

This repository contains the frontend for a multi-shop billing system built with the Next.js App Router and styled with the Ocean Professional theme (modern, clean, blue/amber accents). The application is structured for scale with routed layouts, reusable UI components, and a small set of libraries for environment configuration, logging, and API access.

The app is configured for static export (output: "export") so it can be deployed to any static hosting environment or CDN. All dynamic data is fetched client-side from either a real backend or a built-in mock client, depending on environment settings.

Core routes are organized under a dashboard group:
- /dashboard
- /shops
- /shops/[shopId]
  - Overview (landing)
  - Invoices
  - Customers
  - Payments

Each area includes loading and error boundaries for resilient UX.

## Environment Variables

Only environment variables prefixed with NEXT_PUBLIC_ are consumed by the browser. Below is the full set used or supported by this frontend. Unless otherwise noted, these are optional and have reasonable defaults for local development.

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| NEXT_PUBLIC_API_BASE | Optional | https://api.example.com | Base URL for the REST API. If empty or unset, the app automatically falls back to the in-memory mock client. |
| NEXT_PUBLIC_BACKEND_URL | Optional | http://localhost:4000 | A canonical backend URL (not directly used by the app). Useful for documentation or build-time templating. |
| NEXT_PUBLIC_FRONTEND_URL | Optional | http://localhost:3000 | The canonical URL for this web app (not used at runtime by the app). |
| NEXT_PUBLIC_WS_URL | Optional | ws://localhost:4000 | WebSocket endpoint for real-time features (not used by this app today). |
| NEXT_PUBLIC_NODE_ENV | Optional | development | Exposed environment (development, production, test). Influences the default log level. |
| NEXT_PUBLIC_NEXT_TELEMETRY_DISABLED | Optional | true | Allows disabling Next telemetry in certain environments. |
| NEXT_PUBLIC_ENABLE_SOURCE_MAPS | Optional | true | Marker for enabling source maps in certain environments (not used by the runtime code). |
| NEXT_PUBLIC_PORT | Optional | 3000 | Port hint for development environments (not used directly by Next dev). |
| NEXT_PUBLIC_TRUST_PROXY | Optional | false | For proxy-aware deployments (not used by this frontend at runtime). |
| NEXT_PUBLIC_LOG_LEVEL | Optional | debug | Runtime log level for the client logger. One of: silent, error, warn, info, debug. Defaults to debug in development, warn in test, info otherwise. |
| NEXT_PUBLIC_HEALTHCHECK_PATH | Optional | /healthz | Path hint for container health checks (not used by this frontend at runtime). |
| NEXT_PUBLIC_FEATURE_FLAGS | Optional | mock_api | Space- or comma-separated flags. Supported: mock_api. |
| NEXT_PUBLIC_EXPERIMENTS_ENABLED | Optional | false | Enables experimental UI or behaviors when set to "true". |

Notes:
- The app only references NEXT_PUBLIC_* variables (see src/lib/env.ts).
- If NEXT_PUBLIC_API_BASE is empty, the app uses the mock client automatically.
- Logger honors NEXT_PUBLIC_LOG_LEVEL via src/lib/logger.ts.

## Feature Flags

Feature flags are set via NEXT_PUBLIC_FEATURE_FLAGS. Flags can be separated by spaces or commas.

- mock_api
  - When enabled, the app uses the in-memory mock client instead of a remote API.
  - The app also automatically uses mocks if NEXT_PUBLIC_API_BASE is empty.
  - See src/lib/env.ts and src/lib/apiClient.ts for the switching logic.

Examples:
- Enable mock mode explicitly:
  - NEXT_PUBLIC_FEATURE_FLAGS="mock_api"
- Implicit mock fallback (no API base configured):
  - Leave NEXT_PUBLIC_API_BASE empty, and the app auto-falls back to the mock client.

## Local Development

### Quick start
1) Copy environment defaults:
- cp frontend_app/.env.example frontend_app/.env.local

2) Install dependencies and run the dev server inside frontend_app:
- cd frontend_app
- npm install
- npm run dev
- Open http://localhost:3000

### Switching between mock mode and real backend
- Mock mode (default):
  - Leave NEXT_PUBLIC_API_BASE empty (or set NEXT_PUBLIC_FEATURE_FLAGS="mock_api").
  - Data is served from in-memory mocks in src/mocks via src/lib/mockClient.ts.
- Real backend:
  - Set NEXT_PUBLIC_API_BASE to your backend origin (e.g., http://localhost:4000).
  - Ensure your backend exposes REST routes compatible with src/lib/apiClient.ts:
    - GET /shops
    - GET /shops/:shopId
    - GET/POST /shops/:shopId/invoices
    - GET/PATCH/DELETE /shops/:shopId/invoices/:invoiceId
    - GET/POST /shops/:shopId/customers
    - GET/PATCH/DELETE /customers/:customerId
    - GET/POST /shops/:shopId/payments
    - GET/PATCH/DELETE /payments/:paymentId

If your backend uses different routes, update the functions and paths in src/lib/apiClient.ts to match your service.

## Static Export and Deployment

This project uses static export via next.config.ts:
- output: "export"

Build:
- cd frontend_app
- npm run build
- The static site is emitted to frontend_app/out

You can deploy the out directory to any static host or CDN. At runtime, the browser will call the configured NEXT_PUBLIC_API_BASE for data (or use the mock client if not set or mock_api is enabled).

## Client-side Data Fetching

Because the application is statically exported, all data fetching happens on the client. Components use the apiClient abstraction (src/lib/apiClient.ts), which delegates to either the real backend or the mock client. You will commonly see "...Client.tsx" components under route folders that fetch or mutate data using apiClient.

- Real API calls use fetch() against NEXT_PUBLIC_API_BASE.
- Mock mode uses in-memory data defined under src/mocks with the same surface.

## Logging

The client logger (src/lib/logger.ts) supports scoped loggers and honors NEXT_PUBLIC_LOG_LEVEL:
- Levels: silent, error, warn, info, debug
- Default level:
  - development: debug
  - test: warn
  - otherwise: info

Usage:
- import { createLogger } from "@/lib/logger";
- const log = createLogger("MyComponent");
- log.debug("message", { extra: true });

## Project Structure

- src/app
  - Next.js App Router structure. Contains top-level layout.tsx and group routes such as (dashboard)/ with nested pages and boundaries (loading.tsx, error.tsx, not-found).
- src/components/layout
  - AppShell, TopNav, Sidebar. AppShell wraps the UI in a consistent shell and mounts the global toast provider.
- src/components/ui
  - Reusable UI components (Ocean Professional theme) and ToastProvider; see README in this folder for usage.
- src/contexts
  - ShopContext supplies selected shop state (synced to URL and localStorage) and responsive sidebar state.
- src/lib
  - env.ts: Parses NEXT_PUBLIC_* variables and flags.
  - apiClient.ts: Real REST endpoints (switches to mock when appropriate).
  - mockClient.ts: In-memory mock services mirroring the real client surface.
  - logger.ts: Scoped, level-aware logger.
- src/mocks
  - Mock data and helpers for shops, invoices, customers, and payments.

## Where to Align Routes with a New Backend

When connecting a real backend, start by aligning the endpoints in src/lib/apiClient.ts. The buildUrl() helper composes URLs using NEXT_PUBLIC_API_BASE. Adjust route paths or payload shapes to match your backend. Keep the mock client (src/lib/mockClient.ts) in sync to preserve mock parity for local development and demos.
