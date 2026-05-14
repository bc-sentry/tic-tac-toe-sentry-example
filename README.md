# Tic-tac-toe + Sentry (React demo)

This repository is a **small React application** whose main purpose is to show how **Sentry** can be wired into a typical **Vite + React** frontend. The game itself is minimal; the interesting parts are the SDK setup, instrumentation, and build tooling.

## What is integrated from Sentry?

| Area | What this project does |
|------|-------------------------|
| **SDK bootstrap** | `src/instrument.js` calls `Sentry.init()` before the app runs (`src/main.jsx` imports it first). |
| **DSN & environment** | `VITE_SENTRY_DSN` (and optional `VITE_APP_VERSION` for `release`) via Vite env files such as `.env.local`. `environment` follows `import.meta.env.MODE` (for example `development` vs `production`). |
| **Error monitoring** | React 19 root uses `reactErrorHandler()` for uncaught, caught, and recoverable errors. The UI includes a **“Send test error to Sentry”** button that calls `Sentry.captureException()`. |
| **Performance / tracing** | `browserTracingIntegration()` plus `tracesSampleRate` (currently `1.0` for demos—lower in real production). Board moves are wrapped in `Sentry.startSpan()` with a custom name, `op`, and attributes. |
| **Session Replay** | `replayIntegration()` with session and error replay sample rates set in `instrument.js`. Replay privacy options (`maskAllText`, `blockAllMedia`) are configured there—tighten them for production if you capture sensitive UI. |
| **Logs** | `enableLogs: true`, `consoleLoggingIntegration()` (selected `console` levels forwarded to Sentry), and **`Sentry.logger`** calls in the game flow (moves, new game, test-error path). |
| **PII** | `sendDefaultPii: true` is enabled for demonstration; consider your policy before shipping. |
| **Build / releases** | `@sentry/vite-plugin` in `vite.config.js` uploads artifacts when `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` are set (usually in CI, not in the browser bundle). Builds use `sourcemap: "hidden"`. |
| **Security headers (dev / preview)** | Vite `server.headers` and `preview.headers` set a **Content-Security-Policy** tuned for local HMR and Sentry ingest. **Production hosting** must set CSP (and other headers) on its own; the built `dist/` output does not include these headers. |

## Running locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (by default `http://localhost:5173/`).

To send data to Sentry, add a `VITE_SENTRY_DSN` (and optionally `VITE_APP_VERSION`) in `.env.local` or `.env`. Restart the dev server after changing env files.

## Scripts

- **`npm run dev`** — Vite dev server with HMR and the CSP headers from `vite.config.js`.
- **`npm run build`** — Production bundle; Sentry plugin runs if org/project/auth env vars are present.
- **`npm run preview`** — Serves the production build locally (stricter CSP branch than dev).
- **`npm run lint`** — ESLint.

## Notes for developers

- **Sampling**: Tracing and replay rates are set high for visibility in a demo. In production, lower `tracesSampleRate` and replay rates to control cost and volume.
- **`tracePropagationTargets`**: Still contains a placeholder host pattern; point it at your real API origins if you propagate trace headers to backends.
- **CSP vs Sentry**: Your ingest URL must be allowed by `connect-src` (and any worker needs `worker-src` as appropriate). The current Vite CSP is permissive on `http`/`https` for demo flexibility; tighten `connect-src` once your Sentry host is fixed.

For product behavior and limits (Logs, Replay, performance), refer to the [Sentry documentation](https://docs.sentry.io/) for your SDK version (`@sentry/react` in `package.json`).
