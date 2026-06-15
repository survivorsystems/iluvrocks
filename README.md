# RockHound ⚒️

A professional, community-driven social platform for rockhounds, prospectors, fossil hunters, and outdoor explorers. Built with TanStack Start, Convex, and Tailwind CSS v4.

## 🚀 Features

- **Live Social Feed**: Discover finds, trip reports, and local intel in real-time.
- **Interactive Mapping**: Explore verified collecting sites across the American West.
- **Digital Field Journal**: Maintain a personal log of discoveries and collections.
- **Community Hubs**: Join regional chapters and connect with local experts.
- **AI Identification**: Instant mineral identification using advanced vision models.
- **Safety Check-in**: Specialized tools for outdoor safety and trip planning.

## 🛠️ Tech Stack

- **Frontend**: [TanStack Start](https://tanstack.com/router/latest/docs/framework/react/start/overview) (React, File-based Routing)
- **Backend**: [Convex](https://convex.dev/) (Real-time Database, Server Functions)
- **Auth**: [Convex Auth](https://labs.convex.dev/auth)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI**: [Convex Agent](https://github.com/get-convex/agent) + OpenRouter

## 🏃 Local Development

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up Convex**:
   If you haven't already, install the Convex CLI and log in:
   ```bash
   npx convex dev
   ```
4. **Environment Variables**:
   Copy `.env.example` to `.env.local` and add your Convex URL.
5. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🏗️ Production Build

To build the application for production:

```bash
npm run build
```

The output will be in the `.output` directory (for the server) and `dist` (for static assets), ready for deployment on platforms like Vercel.

## 📦 Deployment (Vercel)

1. Connect your GitHub repository to Vercel.
2. Set the following build settings:
   - **Framework Preset**: Other (Vite-based)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.output/public`
   - **Install Command**: `npm install`
3. Add your environment variables:
   - `VITE_CONVEX_URL`: Your production Convex URL.
   - `AUTH_SECRET`: A secure random string for authentication.
   - `OPENROUTER_API_KEY`: (Optional) For AI features.

---

Built with ❤️ for the Rockhounding community.
