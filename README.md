# RockHound

A community field-notes platform for rockhounds, prospectors, fossil hunters, and outdoor explorers. RockHound is built as a static React app with a Convex backend.

## Features

- Public feed and visitor-friendly landing pages.
- Basecamp dashboard for trip planning and field workflows.
- Collection tracker for specimen records.
- Saved locations for access notes and future scouting.
- Log-a-find workflow for field notes.
- Community and admin dashboard foundations.
- Convex Auth with Resend email codes.

## Tech Stack

- Frontend: React, Vite, TypeScript, React Router
- Backend: Convex
- Auth: Convex Auth and Resend
- Styling: Plain CSS

## Local Development

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env.local` and set your Convex URL:

```bash
VITE_CONVEX_URL=https://tough-emu-800.convex.cloud
```

Run the local app:

```bash
npm run dev
```

## Development Auth Bypass

While Resend DNS propagation and email delivery are being configured, local development can use a mock authenticated admin user.

Add this to `.env.local`:

```bash
VITE_DEV_AUTH_BYPASS=true
```

The bypass only activates when both conditions are true:

- Vite is running in local development mode.
- `VITE_DEV_AUTH_BYPASS=true`.

The mock user is:

```text
id: dev-user
username: chickensweets87
displayName: Krista
email: dev@rockhoundapp.app
role: admin
```

Never enable this for production. Production builds do not activate the bypass because the code also checks `import.meta.env.DEV`.

## Production Build

Build the static app:

```bash
npm run build
```

The output is written to `dist`.

## Deployment

For Vercel or Netlify:

- Build command: `npm run build`
- Output directory: `dist`
- Required frontend env var: `VITE_CONVEX_URL`
- Do not set `VITE_DEV_AUTH_BYPASS=true` in production.

Convex backend environment variables are managed separately with the Convex CLI or dashboard. Auth email delivery requires `SITE_URL` and `RESEND_API_KEY`.
