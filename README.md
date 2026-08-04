# GitHub Profile Explorer

A Next.js + TypeScript app for searching, comparing, and exploring GitHub profiles and repositories — with AI-powered summaries and a grounded chat assistant for individual repos.

**Live demo:** [(https://github-profile-explorer-git-main-yaraalhussany-3270s-projects.vercel.app/)]

## Features

- **Search** — look up any GitHub username and view their profile and repositories
- **Compare** — view two GitHub users side by side
- **AI Profile Summary** — ask an AI model to summarize a developer's profile, or ask a specific question about them
- **AI Comparison Summary** — same idea, applied to two users at once
- **Grounded Repo Chat** — ask questions about a specific repository; responses are grounded in that repo's actual README, top-level file structure, and recent commit history, and stream in real time
- **Notes** — save personal notes on any user profile or repository
- **README Preview** — view a rendered version of a repo's README (including images) directly on its chat page, so it's clear exactly what context the AI is working from

## Tech Stack

- **Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS
- **AI:** Groq (`llama-3.3-70b-versatile`) via the Vercel AI SDK, using `streamText` for streaming chat and `generateText` for summaries
- **Data source:** GitHub REST API, proxied through Next.js Route Handlers so the GitHub token never reaches the browser
- **Markdown rendering:** `react-markdown` + `remark-gfm` for repo README previews
- **Persistence:** Browser `localStorage` for notes and chat history (see tradeoffs below)
- **Deployment:** Vercel

## Getting Started

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/yaraalhussany/github-profile-explorer.git
   cd github-profile-explorer
   npm install
   ```

2. Create a `.env.local` file in the project root:
   ```
   GITHUB_TOKEN=your_github_personal_access_token
   GROQ_API_KEY=your_groq_api_key
   ```
   - GitHub token: [github.com/settings/tokens](https://github.com/settings/tokens) — no special scopes needed for public data, but a token raises your rate limit from 60 to 5,000 requests/hour.
   - Groq key: [console.groq.com/keys](https://console.groq.com/keys) — free tier, no card required.

3. Run the dev server:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

## Architecture Notes & Tradeoffs

**Server-side API proxying.** All GitHub API calls are routed through Next.js Route Handlers (`app/api/...`) rather than called directly from the browser. This keeps the GitHub token server-side only, since anything sent from a client component is visible to end users.

**localStorage for notes and chat history.** Rather than standing up a database for this scope, notes and repo chat history are persisted in the browser's `localStorage`. This was a deliberate scope tradeoff for a take-home timeline:
- ✅ Zero backend/database setup, works immediately after deployment
- ✅ No auth system needed to associate data with a user
- ❌ Data is local to one browser/device only — it won't sync across devices or persist if the user clears their browser storage
- ❌ Not suitable as-is for a real multi-user product

In a production version, this would move to a proper database (e.g. Postgres via Vercel Postgres or Supabase) with user accounts, so notes and chat history could persist across sessions and devices.

**AI provider.** The project originally targeted Anthropic's API, but switched to Groq's free tier to keep the project cost-free during development. Swapping providers is a small change thanks to the Vercel AI SDK's shared interface — only the import and model string differ between providers.

## Known Limitations

- Repo READMEs are truncated to keep AI prompts a reasonable size, so very long READMEs may have context cut off in chat (though the full rendered README preview is not truncated).
- Image rendering in READMEs assumes the repository's default branch is `main`; repos using `master` or another default branch name may not resolve relative image paths correctly.
- No authentication — notes and chat history are shared across anyone using the same browser.