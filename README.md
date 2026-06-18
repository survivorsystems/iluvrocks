# RockHound

A community field-notes platform for rockhounds, prospectors, fossil hunters, and outdoor explorers. RockHound is built as a static React app with a Convex backend.

Built by rockhounds, for rockhounds.

Official domain: iluvrocks.rocks

## Features

- Public feed and visitor-friendly landing pages.
- Basecamp dashboard for trip planning and field workflows.
- Collection tracker for specimen records.
- Saved locations for access notes and future scouting.
- Log-a-find workflow for field notes.
- Community and admin dashboard foundations.
- Convex Auth email + password accounts.

## Tech Stack

- Frontend: React, Vite, TypeScript, React Router
- Backend: Convex
- Auth: Convex Auth Password provider
- Styling: Plain CSS

## Local Development

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env.local` and set your Convex URL:

```bash
VITE_CONVEX_URL=https://outstanding-chicken-449.convex.cloud
```

Run the local app:

```bash
npm run dev
```

## Account Flow

- Public visitors land on the homepage and can choose **Create your Basecamp**.
- `/create-basecamp` opens email + password account creation.
- Passwords must be at least 9 characters and include 1 uppercase letter, 1 number, and 1 special character.
- New accounts create email + password login credentials first, then continue to profile setup.
- `/login` handles returning-user email + password sign-in.
- Verification-code auth is not used for login, signup, or password reset.

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
email: dev@iluvrocks.rocks
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
- Required frontend env var: `VITE_CONVEX_URL=https://outstanding-chicken-449.convex.cloud`
- Do not set `VITE_DEV_AUTH_BYPASS=true` in production.
- The Vercel project can remain named `rock-app-ygqf`; the public app domain is `https://iluvrocks.rocks`.

Convex backend environment variables are managed separately with the Convex CLI or dashboard.

Required for Convex Auth session/token generation:

```text
JWT_PRIVATE_KEY=...
JWKS=...
AUTH_SECRET=...
CONVEX_SITE_URL=https://outstanding-chicken-449.convex.site
SITE_URL=https://iluvrocks.rocks
```

Do not put backend secrets in Vercel. Vercel only needs the frontend `VITE_CONVEX_URL`.
