# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scenarios.spec.ts >> Tier 4: Real-World Scenarios >> T4-3: Reader switching resets/preserves state correctly
- Location: tests\scenarios.spec.ts:182:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/library
Call log:
  - navigating to "http://localhost:3000/library", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e6]:
    - heading "This site can’t be reached" [level=1] [ref=e7]
    - paragraph [ref=e8]:
      - strong [ref=e9]: localhost
      - text: refused to connect.
    - generic [ref=e10]:
      - paragraph [ref=e11]: "Try:"
      - list [ref=e12]:
        - listitem [ref=e13]: Checking the connection
        - listitem [ref=e14]:
          - link "Checking the proxy and the firewall" [ref=e15] [cursor=pointer]:
            - /url: "#buttons"
    - generic [ref=e16]: ERR_CONNECTION_REFUSED
  - generic [ref=e17]:
    - button "Reload" [ref=e19] [cursor=pointer]
    - button "Details" [ref=e20] [cursor=pointer]
```

# Test source

```ts
  83  | 
  84  |     const download = await downloadPromise;
  85  |     expect(download.suggestedFilename()).toContain('.pdf');
  86  | 
  87  |     // Viewer should stay open
  88  |     await expect(pdfViewer).toBeVisible();
  89  |   });
  90  | 
  91  |   // T3-4: Filter + Download
  92  |   test('T3-4: Download from filtered grid maintains filter state', async ({ page }) => {
  93  |     // Filter by Design
  94  |     const designTab = page.locator('[data-testid="category-tab"]:has-text("Design")');
  95  |     await designTab.click();
  96  | 
  97  |     const bookCards = page.locator('[data-testid="book-card"]');
  98  |     const countBeforeDownload = await bookCards.count();
  99  |     expect(countBeforeDownload).toBeGreaterThan(0);
  100 | 
  101 |     // Click download on first card
  102 |     const firstCard = bookCards.first();
  103 |     const downloadButton = firstCard.locator('[data-testid="download-button"]');
  104 | 
  105 |     const downloadPromise = page.waitForEvent('download');
  106 |     await downloadButton.click();
  107 |     
  108 |     const download = await downloadPromise;
  109 |     expect(download.suggestedFilename()).toContain('.pdf');
  110 | 
  111 |     // Grid state should remain filtered
  112 |     await expect(bookCards).toHaveCount(countBeforeDownload);
  113 |   });
  114 | });
  115 | 
  116 | test.describe('Tier 4: Real-World Scenarios', () => {
  117 |   // T4-1: Desktop Happy Path
  118 |   test('T4-1: Desktop Happy Path', async ({ page }) => {
  119 |     await page.setViewportSize({ width: 1280, height: 800 });
  120 |     await page.goto('/library');
  121 | 
  122 |     // Search for "Next.js"
  123 |     const searchInput = page.locator('[data-testid="search-input"]');
  124 |     await searchInput.fill('Next.js');
  125 |     await page.waitForTimeout(300);
  126 | 
  127 |     // Verify results exist
  128 |     const bookCards = page.locator('[data-testid="book-card"]');
  129 |     await expect(bookCards.first()).toBeVisible();
  130 | 
  131 |     // Click the book to open the reader
  132 |     await bookCards.first().click();
  133 |     const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
  134 |     await expect(pdfViewer).toBeVisible();
  135 | 
  136 |     // Zoom in
  137 |     const zoomIn = page.locator('[data-testid="zoom-in"]');
  138 |     await zoomIn.click();
  139 | 
  140 |     // Click download
  141 |     const downloadButton = pdfViewer.locator('[data-testid="download-button"]');
  142 |     const downloadPromise = page.waitForEvent('download');
  143 |     await downloadButton.click();
  144 | 
  145 |     const download = await downloadPromise;
  146 |     expect(download.suggestedFilename()).toContain('.pdf');
  147 |   });
  148 | 
  149 |   // T4-2: Mobile Happy Path
  150 |   test('T4-2: Mobile Happy Path', async ({ page }) => {
  151 |     await page.setViewportSize({ width: 375, height: 667 });
  152 |     await page.goto('/library');
  153 | 
  154 |     // Filter by Programming
  155 |     const programmingTab = page.locator('[data-testid="category-tab"]:has-text("Programming")');
  156 |     await programmingTab.click();
  157 | 
  158 |     // Tap first card
  159 |     const bookCards = page.locator('[data-testid="book-card"]');
  160 |     await bookCards.first().click();
  161 | 
  162 |     const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
  163 |     await expect(pdfViewer).toBeVisible();
  164 | 
  165 |     // Navigate page
  166 |     const nextPage = page.locator('[data-testid="next-page"]');
  167 |     await nextPage.click();
  168 |     
  169 |     const pageInfo = page.locator('[data-testid="page-info"]');
  170 |     await expect(pageInfo).toContainText('2');
  171 | 
  172 |     // Download PDF locally
  173 |     const downloadButton = pdfViewer.locator('[data-testid="download-button"]');
  174 |     const downloadPromise = page.waitForEvent('download');
  175 |     await downloadButton.click();
  176 | 
  177 |     const download = await downloadPromise;
  178 |     expect(download.suggestedFilename()).toContain('.pdf');
  179 |   });
  180 | 
  181 |   // T4-3: Reader Switching & State Preservation
  182 |   test('T4-3: Reader switching resets/preserves state correctly', async ({ page }) => {
> 183 |     await page.goto('/library');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/library
  184 | 
  185 |     // Open Book A
  186 |     const bookCards = page.locator('[data-testid="book-card"]');
  187 |     const bookA = bookCards.nth(0);
  188 |     const bookB = bookCards.nth(1);
  189 | 
  190 |     await bookA.click();
  191 |     const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
  192 |     await expect(pdfViewer).toBeVisible();
  193 | 
  194 |     // Change zoom level
  195 |     const zoomIn = page.locator('[data-testid="zoom-in"]');
  196 |     await zoomIn.click();
  197 |     await zoomIn.click();
  198 | 
  199 |     // Close reader
  200 |     const closeBtn = page.locator('[data-testid="close-viewer"]');
  201 |     await closeBtn.click();
  202 |     await expect(pdfViewer).not.toBeVisible();
  203 | 
  204 |     // Open Book B
  205 |     await bookB.click();
  206 |     await expect(pdfViewer).toBeVisible();
  207 | 
  208 |     // Zoom level should be reset to default zoom (expect zoomIn to be enabled again)
  209 |     await expect(zoomIn).toBeEnabled();
  210 | 
  211 |     // Close Book B and reopen Book A
  212 |     await closeBtn.click();
  213 |     await bookA.click();
  214 |     await expect(pdfViewer).toBeVisible();
  215 | 
  216 |     // State of Book A should either be preserved or clean depending on design spec.
  217 |     // Usually we expect a clean/default load for newly opened/reopened sessions,
  218 |     // or if the spec asks to preserve zoom state of Book A, we verify that.
  219 |     // Let's assume standard behavior where zoom resets to default, but the grid state remains.
  220 |   });
  221 | 
  222 |   // T4-4: Error Recovery
  223 |   test('T4-4: UI displays fallback error gracefully on API/R2 failure and user can retry', async ({ page }) => {
  224 |     // 1. Simulate API failure for `/api/books`
  225 |     await page.route('**/api/books', async route => {
  226 |       await route.fulfill({
  227 |         status: 500,
  228 |         contentType: 'application/json',
  229 |         body: JSON.stringify({ error: 'Database connection failed' })
  230 |       });
  231 |     });
  232 | 
  233 |     await page.goto('/library');
  234 | 
  235 |     // UI should show an error state/fallback
  236 |     const errorAlert = page.locator('[data-testid="error-alert"]');
  237 |     await expect(errorAlert).toBeVisible();
  238 |     await expect(errorAlert).toContainText(/Failed to load books/i);
  239 | 
  240 |     // 2. Recover from error (restore normal routing and retry)
  241 |     await page.route('**/api/books', async route => {
  242 |       await route.fulfill({
  243 |         status: 200,
  244 |         contentType: 'application/json',
  245 |         body: JSON.stringify([
  246 |           {
  247 |             id: 'book-1',
  248 |             title: 'Refactoring',
  249 |             author: 'Martin Fowler',
  250 |             category: 'Programming',
  251 |             description: 'Improving the design of existing code',
  252 |             fileKey: 'books/refactoring.pdf'
  253 |           }
  254 |         ])
  255 |       });
  256 |     });
  257 | 
  258 |     const retryButton = page.locator('[data-testid="retry-button"]');
  259 |     await retryButton.click();
  260 | 
  261 |     // Error alert should be hidden and card rendered
  262 |     await expect(errorAlert).not.toBeVisible();
  263 |     await expect(page.locator('[data-testid="book-card"]')).toHaveCount(1);
  264 |   });
  265 | 
  266 |   // T4-5: Empty Search Recovery
  267 |   test('T4-5: Empty search displays recovery options and restores full grid', async ({ page }) => {
  268 |     await page.goto('/library');
  269 | 
  270 |     const searchInput = page.locator('[data-testid="search-input"]');
  271 |     await searchInput.fill('NonExistentBookNamexyz123');
  272 |     await page.waitForTimeout(300);
  273 | 
  274 |     // Expect empty search UI
  275 |     const noResults = page.locator('[data-testid="no-results"]');
  276 |     await expect(noResults).toBeVisible();
  277 | 
  278 |     const clearSearchBtn = page.locator('[data-testid="clear-search-button"]');
  279 |     await expect(clearSearchBtn).toBeVisible();
  280 | 
  281 |     // Click clear search
  282 |     await clearSearchBtn.click();
  283 | 
```