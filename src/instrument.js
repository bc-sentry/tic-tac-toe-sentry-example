import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,

  sendDefaultPii: true,
  enableLogs: true,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.consoleLoggingIntegration({
      levels: ["debug", "info", "warn", "error", "log", "assert"],
    }),
  ],

  // Tracing
  tracesSampleRate: 1.0, // lower to 0.1–0.2 in production
  tracePropagationTargets: ["localhost", /^https:\/\/yourapi\.io/],

  // Session Replay
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
});
