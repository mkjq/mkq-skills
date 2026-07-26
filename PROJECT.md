# Project: MKQ Skills Comprehensive Audit & Fix

## Architecture
MKQ Skills is an Arabic RTL platform for managing AI skills, prompts, and books library built with Next.js 16 (App Router), React 19, Cloudflare Workers, R2 Storage, and D1 Database.

- **Frontend**: Glassmorphic dark/light UI, Arabic RTL layout, sidebar navigation (`/`, `/dashboard`, `/dashboard/editor`, `/vault`, `/admin`, `/about/settings`, `/library`).
- **Backend**: Next.js App Router API endpoints and Cloudflare Workers for authentication, vault data, skill management, admin management, and PDF streaming.
- **Storage**: Cloudflare R2 bucket (`mkq-skills`) & D1 database.

## Milestones

| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| 1 | Comprehensive Exploration & Audit | Audit design, colors, CSS variables, dark/light theme, sticky sidebar, RTL, Arabic UX, build errors, and security (auth, secret exposure, 1010 passcode removal, input validation). | None | PLANNED | TBD |
| 2 | Design, UI & UX Fixes | Implement CSS variable usage, dark/light theme adaptation, sticky sidebar, overflow fixes, visual consistency, and Arabic RTL alignment. | M1 | PLANNED | TBD |
| 3 | Security & Auth Fixes | Protect all admin/vault routes, remove any exposure of default passcode (`1010`) or secrets in UI/APIs, enforce server-side input validation. | M1 | PLANNED | TBD |
| 4 | Build Verification & Forensic Audit | Run `npm run build` to guarantee zero errors/warnings, run static & forensic audits to confirm clean code. | M2, M3 | PLANNED | TBD |
| 5 | GitHub Deployment | Push all modified files (including package-lock.json if updated) to `mkjq/mkq-skills` via GitHub API. | M4 | PLANNED | TBD |

## Interface & Security Contracts
- All `/api/vault/*` endpoints must require valid authorization session/passcode.
- All `/api/admin/*` endpoints must require authenticated admin session.
- No default passcode `1010` or raw secrets permitted in UI, placeholders, tooltips, or error responses.
- Input validation on all mutated endpoints (`POST`/`PUT`/`DELETE`/`PATCH`).
- Theme support via `--bg-base`, `--bg-surface`, `--text-main`, `--text-muted`, `--brand-primary`, etc.

## Code Layout
- `src/app/` - App router pages (`/`, `/dashboard`, `/vault`, `/admin`, `/about/settings`, `/library`, etc.)
- `src/components/` - Glassmorphic UI components, Sidebar, Header, Readers, Modals
- `src/lib/` or `src/utils/` - Auth, D1/R2 clients, security helpers
- `src/app/api/` - Next.js API routes

