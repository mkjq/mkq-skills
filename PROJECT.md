# Project: Books Library Feature for MKQ Skills

## Architecture
The Books Library feature is built into the existing `skills-manager` Next.js application using Next.js App Router (version 16) and Cloudflare R2 for local PDF storage.

```
                  ┌───────────────────┐
                  │   User Browser    │
                  └─────────┬─────────┘
                            │
              HTTP GET      │  HTTP GET
              /library      │  /api/books/download?key=...
                            ▼
              ┌──────────────────────────┐
              │      Next.js Server      │
              │  (App Router API Route)  │
              └─────────────┬────────────┘
                            │
                            │  GetObjectCommand
                            ▼
              ┌──────────────────────────┐
              │    Cloudflare R2 Bucket  │
              │      (mkq-skills)        │
              └──────────────────────────┘
```

- **Frontend**: A modern, glassmorphic dark-themed page `/library` showing a grid of 45 books with search and filter capabilities. It includes an in-browser responsive PDF reader component using `react-pdf` and a local download mechanism.
- **Backend**: API routes to fetch books JSON metadata (`/api/books`) and stream PDF documents directly from Cloudflare R2 (`/api/books/download`).
- **Cloudflare R2**: Used to store and retrieve the PDF files securely using the credentials in `.env.local`.

## Milestones

| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| 1 | R2 Connection Script (`verify_r2.js`) | Create verification script using `@aws-sdk/client-s3` to prove read/write to the `mkq-skills` R2 bucket using environment variables. | None | PLANNED | TBD |
| 2 | Books Metadata Definition | Define hardcoded books JSON dataset containing exactly 45 specific books with titles, authors, categories, and R2 file keys. | None | PLANNED | TBD |
| 3 | Backend API Endpoint | Create `/api/books` for metadata and `/api/books/download` to stream PDFs from R2. | M1, M2 | PLANNED | TBD |
| 4 | Responsive PDF Viewer Component | Create a responsive React PDF viewer utilizing `react-pdf` with zoom, paging, and mobile layout. | None | PLANNED | TBD |
| 5 | Books Library UI & Integration | Build `/library` page displaying the grid, integrating search/filter, download buttons, and viewer. | M3, M4 | PLANNED | TBD |
| 6 | E2E Testing Suite | Build requirement-driven E2E tests covering Tiers 1-4. | None | IN_PROGRESS | e2211f09-a26b-4188-891d-e22cc059c5b6 |
| 7 | Adversarial Hardening (Tier 5) | Identify coverage gaps and add adversarial tests. | M5, M6 | PLANNED | 2398a75f-3508-4c1c-9b8e-7d2e35fe08c7 |

## Interface Contracts

### 1. Books Metadata Schema (`/api/books`)
Returns a list of books.
- **Method**: `GET`
- **Response Format**: `JSON`
- **Properties**:
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "author": "string",
      "category": "string",
      "description": "string",
      "fileKey": "string"
    }
  ]
  ```

### 2. PDF Download Stream (`/api/books/download`)
Streams PDF from R2 directly.
- **Method**: `GET`
- **Query Params**: `key=books/...` or `id=...`
- **Headers**:
  - `Content-Type`: `application/pdf`
  - `Content-Disposition`: `attachment; filename="..."`
  - `Cache-Control`: `public, max-age=3600`

## Code Layout
- `verify_r2.js` - Script to verify R2 credentials and connectivity (project root)
- `src/app/library/page.tsx` - Books library UI page
- `src/app/api/books/route.ts` - Books listing API route
- `src/app/api/books/download/route.ts` - Book PDF download and stream API route
- `src/components/BookViewer.tsx` - Responsive PDF viewer component using `react-pdf`
- `src/components/BookCard.tsx` - Individual book card glassmorphic component
- `public/books.json` - Hardcoded book metadata file (or imported internally)
- `tests/` - E2E tests folder
