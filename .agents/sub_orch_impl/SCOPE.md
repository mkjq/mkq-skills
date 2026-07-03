# Scope: Books Library Implementation

## Architecture
- Frontend: Next.js (App Router) on /library rendering a glassmorphic grid of 45 books with search, filter, download, and mobile-first PDF viewer component utilizing `react-pdf`.
- Backend: API endpoint `/api/books` listing book metadata, and `/api/books/download` streaming PDF files directly from Cloudflare R2 bucket (`mkq-skills`) using credentials from `.env.local` with S3 SDK client.
- Cloudflare R2: Credentials stored in `.env.local`.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| M1 | R2 connection verification script (verify_r2.js) | Create verification script using `@aws-sdk/client-s3` to prove read/write to the `mkq-skills` R2 bucket using environment variables. | None | DONE | da41ba93-dc2b-429a-9690-ffe76243d695 |
| M2 | Books JSON data generation (45 books) | Define hardcoded books JSON dataset containing exactly 45 specific books with titles, authors, categories, and R2 file keys. | None | IN_PROGRESS | ad2d5a40-7836-4492-94d1-e7ac2050a2ee |
| M3 | Backend API routes (/api/books and /api/books/download) | Create `/api/books` for metadata and `/api/books/download` to stream PDFs from R2. | M1, M2 | PLANNED | TBD |
| M4 | Responsive PDF viewer component using react-pdf | Create a responsive React PDF viewer utilizing `react-pdf` with zoom, paging, and mobile layout. | None | PLANNED | TBD |
| M5 | Books library page (/library) UI matching glassmorphic dark theme. | Build `/library` page displaying the grid, integrating search/filter, download buttons, and viewer. | M3, M4 | PLANNED | TBD |

## Interface Contracts
### Books Metadata Schema (`/api/books`)
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

### PDF Download Stream (`/api/books/download`)
Streams PDF from R2 directly.
- **Method**: `GET`
- **Query Params**: `key=books/...` or `id=...`
- **Headers**:
  - `Content-Type`: `application/pdf`
  - `Content-Disposition`: `attachment; filename="..."`
  - `Cache-Control`: `public, max-age=3600`
