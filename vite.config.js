import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from "@sentry/vite-plugin"

// https://vite.dev/config/server-options.html#server-headers
// For static hosting (Netlify, nginx, etc.), send the same header on HTML responses in production.
function contentSecurityPolicy(mode) {
  const base =
    "default-src 'self'; " +
    "worker-src 'self' blob:; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self' data:; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'; " +
    "connect-src 'self' ws: wss: http: https: data: blob:"

  if (mode === 'development') {
    return `${base}; script-src 'self' 'unsafe-inline' 'unsafe-eval'`
  }

  return `${base}; script-src 'self'`
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  build: { sourcemap: "hidden" },
  server: {
    headers: {
      "Content-Security-Policy": contentSecurityPolicy(mode),
    },
  },
  preview: {
    headers: {
      "Content-Security-Policy": contentSecurityPolicy(mode),
    },
  },
  plugins: [
    react(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
}))
