<p align="center"><img src=".github/assets/logo.svg" width="96" alt="MKQ Skills logo"></p>

<h1 align="center">MKQ Skills</h1>

<p align="center">
  An Arabic-first platform for writing, refining and organising AI skills (prompt files), with a private vault and a books library.<br>
  <sub>منصة عربية لكتابة مهارات الذكاء الاصطناعي وتنظيمها، مع خزنة خاصة ومكتبة كتب</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white" alt="React 19">
  <img src="https://img.shields.io/badge/Cloudflare-Workers%20%C2%B7%20D1%20%C2%B7%20R2-f38020?logo=cloudflare&logoColor=white" alt="Cloudflare Workers, D1, R2">
  <img src="https://img.shields.io/badge/UI-Arabic%20RTL-7c3aed" alt="Arabic RTL">
</p>

## Features

- **Skills editor** — write Markdown prompt files with a built-in AI assistant that helps structure and improve them.
- **Public library** — browse and download skills shared on the platform.
- **Private vault** — passcode-protected personal storage on Cloudflare R2, with lockout after repeated failed attempts.
- **Books library** — PDF reading streamed from R2.
- **Accounts and admin** — sign-up/login with salted PBKDF2 password hashes, session cookies, and an admin dashboard for platform settings.
- **Design** — glassmorphic dark/light theme, fully right-to-left Arabic layout.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS · Cloudflare Workers via OpenNext · D1 (SQLite) · R2 object storage

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

The app expects these environment variables (`.env.local` locally, Worker secrets in production):

| Variable | Purpose |
|---|---|
| `CF_ACCOUNT_ID`, `CF_DATABASE_ID`, `CF_API_TOKEN` | D1 database access |
| `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Vault and library storage |
| `PASSWORD_ITERATIONS` *(optional)* | PBKDF2 cost; default fits the Workers free plan |

Deploy with `npm run deploy` (OpenNext build + `wrangler deploy`).

---

<p align="center"><sub>A hobby project by <a href="https://github.com/mkjq">@mkjq</a></sub></p>
