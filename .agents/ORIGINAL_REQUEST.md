# Original User Request

## Initial Request — 2026-07-03T07:37:59+03:00

Add a books library feature to the existing `skills-manager` Next.js project. The library must display a grid of 45 specific books, allow reading the books directly on the site with a responsive (mobile-first) PDF viewer, and host the downloadable PDF files locally on the site via Cloudflare R2 rather than linking to external sources.

Working directory: c:\Apps\Skills\skills-manager
Integrity mode: development

## Requirements

### R1. Books Library Page
Create a new `/library` page that displays a grid of 45 specific books. The books data (titles and authors) should be hardcoded or loaded from a local JSON file. The UI must match the existing modern, glassmorphic dark theme of the `skills-manager` platform.

### R2. Responsive Reading Experience
Implement an in-browser PDF reader component using a dedicated library (e.g., `react-pdf`) that is heavily optimized for mobile phones, but also scales gracefully to tablets and desktop screens. 

### R3. Cloudflare R2 Integration for Files
Serve the book PDF files from the configured Cloudflare R2 bucket (`mkq-skills`) using the credentials already present in `.env.local`. Implement a download feature that fetches the file directly from the site's R2 infrastructure, preventing the need for external links.

## Acceptance Criteria

### Books Library Page
- [ ] Running `npm run build` completes successfully with no type or lint errors.
- [ ] A programmatic fetch to `http://localhost:3000/library` returns HTTP 200 and includes the title of at least one of the 45 books in the HTML payload.

### Responsive Reading Experience
- [ ] The PDF viewer component code explicitly utilizes a dedicated library (like `react-pdf`) rather than a simple `<iframe>`.
- [ ] The layout uses responsive CSS (e.g., Tailwind or vanilla CSS media queries) to adapt the PDF reader to mobile viewports.

### Local File Hosting and Downloading
- [ ] A verification script (`verify_r2.js`) is written and successfully executed, proving that the app can connect to the R2 bucket using the `.env.local` credentials and retrieve a file.
- [ ] The UI contains a download button that triggers a download from the local backend or R2 endpoint, without redirecting the user to a third-party site.
