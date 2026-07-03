# TEST_INFRA.md

This document outlines the test architecture, features inventory, test case formats, and runner commands for the Books Library feature E2E testing suite in the `skills-manager` project.

---

## 1. Test Architecture & Framework

The E2E test suite is designed as a **requirement-driven, opaque-box** testing framework. It tests the application from the user's perspective, running against the local Next.js instance.

- **Framework**: [Playwright Test](https://playwright.dev/) (`@playwright/test`)
- **Language**: TypeScript
- **Environment Support**:
  - Offline/Restricted Network execution is supported by utilizing pre-installed system browsers (Google Chrome or Microsoft Edge) via Playwright's `channel` configuration. This avoids the need to download Playwright's default browser binaries.
- **Base URL**: Configurable via the `BASE_URL` environment variable, defaulting to `http://localhost:3000`.

### Directory Layout
All tests will be co-located in the `tests/` directory at the project root:
```
skills-manager/
├── tests/
│   ├── api.spec.ts          # API endpoints tests (/api/books, /api/books/download)
│   ├── library.spec.ts      # UI and responsive reader tests (/library)
│   └── scenarios.spec.ts    # Cross-feature and end-to-end scenarios
├── playwright.config.ts     # Playwright configuration
└── package.json
```

---

## 2. Dependencies & Installation

### Install DevDependencies
To set up Playwright, install the test runner:
```bash
npm install -D @playwright/test
```

*Note: Since the environment contains Google Chrome and Microsoft Edge, there is no need to run the heavy `npx playwright install` browser downloader. The configuration will utilize the system-installed Chrome/Edge.*

---

## 3. Playwright Configuration (`playwright.config.ts`)

A configuration that targets the existing system browser to ensure compatibility in network-restricted environments:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    channel: 'chrome', 
    headless: true,
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome' 
      },
    },
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        channel: 'chrome' 
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

---

## 4. Features & Test Case Inventory

### Feature 1: Books Library Grid UI (`/library`)
Testing the books list display, styling, search, and filtering.

| ID | Tier | Test Case Description | Expected Result |
|---|---|---|---|
| F1-T1-1 | Tier 1 | Page load verification | `/library` returns HTTP 200 and loads HTML with glassmorphic dark theme styling. |
| F1-T1-2 | Tier 1 | Grid list verification | Exactly 45 books are rendered in the grid layout. |
| F1-T1-3 | Tier 1 | Search by title | Searching for "Cloud" returns only books containing "Cloud" in their title. |
| F1-T1-4 | Tier 1 | Search by author | Searching for an author's name updates the grid with their books. |
| F1-T1-5 | Tier 1 | Category filtering | Selecting a category filter (e.g. "Programming") hides non-matching books. |
| F1-T2-1 | Tier 2 | Special characters search | Searching for `!@#$%^&*` returns empty results cleanly with a "No books found" message. |
| F1-T2-2 | Tier 2 | No-match search UI | A search query that matches zero books displays a friendly placeholder message. |
| F1-T2-3 | Tier 2 | Long query input | Entering a 200+ character search query handles gracefully without UI distortion. |
| F1-T2-4 | Tier 2 | Rapid filter changes | Rapidly clicking different category tabs doesn't result in race conditions or page crashes. |
| F1-T2-5 | Tier 2 | Category list reset | Selecting a category and then selecting "All" resets the list to exactly 45 books. |

### Feature 2: Responsive PDF Reader (`react-pdf`)
Testing reader display, zoom controls, and responsive styling.

| ID | Tier | Test Case Description | Expected Result |
|---|---|---|---|
| F2-T1-1 | Tier 1 | Open PDF Viewer | Clicking a book card opens the responsive PDF reader viewer. |
| F2-T1-2 | Tier 1 | Check dedicated library | Verify DOM elements confirm the use of a canvas-based dedicated library (like `react-pdf`) instead of `<iframe>`. |
| F2-T1-3 | Tier 1 | Responsive layout checks | Under mobile viewport (375px wide), container controls adapt, zoom is responsive, and no horizontal scroll overflows occur. |
| F2-T1-4 | Tier 1 | Zoom Controls | Zoom In and Zoom Out buttons change canvas scale properties. |
| F2-T1-5 | Tier 1 | Page navigation controls | Next page and Previous page controls successfully navigate pages in the viewer. |
| F2-T2-1 | Tier 2 | Invalid file key error | Opening a book that has an invalid R2 key fails gracefully showing an error alert/message. |
| F2-T2-2 | Tier 2 | Boundary zoom in | Repeatedly clicking Zoom In disables the button at maximum zoom (e.g. 200%). |
| F2-T2-3 | Tier 2 | Boundary zoom out | Repeatedly clicking Zoom Out disables the button at minimum zoom (e.g. 50%). |
| F2-T2-4 | Tier 2 | Under-page boundary | Previous page button is disabled on page 1. |
| F2-T2-5 | Tier 2 | Over-page boundary | Next page button is disabled on the last page of the PDF. |

### Feature 3: API Endpoints & R2 Download
Testing backend routes and the local file downloading mechanism.

| ID | Tier | Test Case Description | Expected Result |
|---|---|---|---|
| F3-T1-1 | Tier 1 | Get Books Metadata | `GET /api/books` returns HTTP 200 with JSON payload listing the books. |
| F3-T1-2 | Tier 1 | Metadata Schema check | The JSON schema of each book in `/api/books` contains `id`, `title`, `author`, `category`, `description`, and `fileKey`. |
| F3-T1-3 | Tier 1 | Download PDF Stream | `GET /api/books/download?key=...` returns HTTP 200 with `application/pdf` contentType. |
| F3-T1-4 | Tier 1 | Download Headers | `GET /api/books/download?key=...` returns `Content-Disposition` header set to `attachment; filename="..."` and `Cache-Control` header. |
| F3-T1-5 | Tier 1 | Trigger local download | Clicking the UI download button initiates direct stream fetching from the backend rather than an external redirect. |
| F3-T2-1 | Tier 2 | Missing download key | `GET /api/books/download` with no query parameters returns HTTP 400 Bad Request. |
| F3-T2-2 | Tier 2 | Non-existent book download | `GET /api/books/download?key=non-existent-key.pdf` returns HTTP 404 Not Found. |
| F3-T2-3 | Tier 2 | Path traversal attempt | `GET /api/books/download?key=../../etc/passwd` is sanitized/rejected, returning HTTP 400 or 403. |
| F3-T2-4 | Tier 2 | Unsupported HTTP methods | Sending `POST` or `PUT` to `/api/books` returns HTTP 405 Method Not Allowed. |
| F3-T2-5 | Tier 2 | R2 Connection Timeout | Simulating R2 downstream failure (e.g. invalid endpoint or credentials) returns HTTP 500 Internal Server Error. |

### Tier 3: Cross-Feature Combinations (Pairwise)

| ID | Test Case Description | Expected Result |
|---|---|---|
| T3-1 | Search + Category Filter | Filter grid to "Technology", then search for a "History" book. Grid should show 0 results. Reset search, correct list shows. |
| T3-2 | Viewer + Search preservation | Open PDF viewer, close it, check that any previously entered search query and active category filter are preserved on the grid. |
| T3-3 | Viewer + R2 Download | Open PDF viewer, click the Download button from the viewer UI. PDF downloads, and the viewer stays open. |
| T3-4 | Filter + Download | Filter books, click download on a book card in the filtered grid. File downloads, grid state remains filtered. |

### Tier 4: Real-World Scenarios

| ID | Test Case Description | Expected Result |
|---|---|---|
| T4-1 | Desktop Happy Path | User enters `/library`, searches for "Next.js", clicks the book, opens reader, zooms in, clicks download, and verifies download content. |
| T4-2 | Mobile Happy Path | Under iPhone viewport, user filters by category, taps book card, reads in mobile responsive reader, navigates pages, and downloads PDF locally. |
| T4-3 | Reader Switching & State Preservation | User opens Book A in reader, changes zoom level, closes reader. User opens Book B, verifies zoom is reset to default. User closes Book B, opens Book A again, and verifies that Book A's page/zoom state or grid state is properly preserved/reset according to design spec. |
| T4-4 | Error Recovery | Simulating API/R2 failure when fetching books or downloading ensures UI displays error fallback gracefully and user can retry after connection is restored. |
| T4-5 | Empty Search Recovery | User searches for a non-existent term, gets empty search UI, clicks "Clear Search" or deletes the term, and the grid successfully recovers and displays all 45 books. |

---

## 5. Test Case Formats & Code Examples

### UI Test Case (Playwright)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Books Library Grid UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/library');
  });

  test('should render exactly 45 book cards', async ({ page }) => {
    const bookCards = page.locator('[data-testid="book-card"]');
    await expect(bookCards).toHaveCount(45);
  });

  test('should filter books by category', async ({ page }) => {
    await page.click('button:has-text("Programming")');
    const bookCards = page.locator('[data-testid="book-card"]');
    // Verify that every card's category matches
    const counts = await bookCards.count();
    for (let i = 0; i < counts; i++) {
      const category = await bookCards.nth(i).locator('[data-testid="book-category"]').innerText();
      expect(category).toBe('Programming');
    }
  });
});
```

### API Test Case (Playwright)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Books Library API Endpoints', () => {
  test('GET /api/books should return metadata for 45 books', async ({ request }) => {
    const response = await request.get('/api/books');
    expect(response.status()).toBe(200);
    
    const books = await response.json();
    expect(Array.isArray(books)).toBe(true);
    expect(books.length).toBe(45);
    
    // Schema check for the first item
    const firstBook = books[0];
    expect(firstBook).toHaveProperty('id');
    expect(firstBook).toHaveProperty('title');
    expect(firstBook).toHaveProperty('author');
    expect(firstBook).toHaveProperty('category');
    expect(firstBook).toHaveProperty('description');
    expect(firstBook).toHaveProperty('fileKey');
  });

  test('GET /api/books/download with invalid key should return 404', async ({ request }) => {
    const response = await request.get('/api/books/download?key=non-existent-file.pdf');
    expect(response.status()).toBe(404);
  });
});
```

---

## 6. Test Runner Command

To execute the test suite:
- **Run all tests**:
  ```bash
  npx playwright test
  ```
- **Run UI tests only**:
  ```bash
  npx playwright test library.spec.ts
  ```
- **Run API tests only**:
  ```bash
  npx playwright test api.spec.ts
  ```
- **Run in headful mode (UI debug)**:
  ```bash
  npx playwright test --headed
  ```
