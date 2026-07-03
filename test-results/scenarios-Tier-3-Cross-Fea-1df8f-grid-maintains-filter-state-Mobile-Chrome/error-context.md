# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scenarios.spec.ts >> Tier 3: Cross-Feature Combinations >> T3-4: Download from filtered grid maintains filter state
- Location: tests\scenarios.spec.ts:92:7

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
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Tier 3: Cross-Feature Combinations', () => {
  4   |   test.beforeEach(async ({ page }) => {
> 5   |     await page.goto('/library');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/library
  6   |   });
  7   | 
  8   |   // T3-1: Search + Category Filter
  9   |   test('T3-1: Search + Category Filter interactions', async ({ page }) => {
  10  |     // Filter grid to Technology
  11  |     const technologyTab = page.locator('[data-testid="category-tab"]:has-text("Technology")');
  12  |     await technologyTab.click();
  13  | 
  14  |     // Search for a History book (e.g. "Brief History of Time")
  15  |     const searchInput = page.locator('[data-testid="search-input"]');
  16  |     await searchInput.fill('Brief History of Time');
  17  |     await page.waitForTimeout(300);
  18  | 
  19  |     // Grid should show 0 results since it is a History book, not Technology
  20  |     const bookCards = page.locator('[data-testid="book-card"]');
  21  |     await expect(bookCards).toHaveCount(0);
  22  | 
  23  |     // Reset search
  24  |     await searchInput.fill('');
  25  |     await page.waitForTimeout(300);
  26  | 
  27  |     // Grid should show only Technology books again
  28  |     const count = await bookCards.count();
  29  |     expect(count).toBeGreaterThan(0);
  30  |     for (let i = 0; i < count; i++) {
  31  |       const category = await bookCards.nth(i).locator('[data-testid="book-category"]').innerText();
  32  |       expect(category.toLowerCase()).toBe('technology');
  33  |     }
  34  |   });
  35  | 
  36  |   // T3-2: Viewer + Search preservation
  37  |   test('T3-2: Search query and category filter are preserved after closing viewer', async ({ page }) => {
  38  |     // Filter by Programming
  39  |     const programmingTab = page.locator('[data-testid="category-tab"]:has-text("Programming")');
  40  |     await programmingTab.click();
  41  | 
  42  |     // Search for "Design"
  43  |     const searchInput = page.locator('[data-testid="search-input"]');
  44  |     await searchInput.fill('Design');
  45  |     await page.waitForTimeout(300);
  46  | 
  47  |     // Verify some results exist
  48  |     const bookCards = page.locator('[data-testid="book-card"]');
  49  |     const initialCount = await bookCards.count();
  50  |     expect(initialCount).toBeGreaterThan(0);
  51  | 
  52  |     // Open first book
  53  |     await bookCards.first().click();
  54  |     const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
  55  |     await expect(pdfViewer).toBeVisible();
  56  | 
  57  |     // Close reader
  58  |     const closeBtn = page.locator('[data-testid="close-viewer"]');
  59  |     await closeBtn.click();
  60  |     await expect(pdfViewer).not.toBeVisible();
  61  | 
  62  |     // Verify search query and filter are preserved
  63  |     await expect(searchInput).toHaveValue('Design');
  64  |     
  65  |     // Grid count should be preserved
  66  |     await expect(bookCards).toHaveCount(initialCount);
  67  |   });
  68  | 
  69  |   // T3-3: Viewer + R2 Download
  70  |   test('T3-3: PDF downloads from viewer UI and viewer remains open', async ({ page }) => {
  71  |     const bookCard = page.locator('[data-testid="book-card"]').first();
  72  |     await bookCard.click();
  73  | 
  74  |     const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
  75  |     await expect(pdfViewer).toBeVisible();
  76  | 
  77  |     const downloadButton = pdfViewer.locator('[data-testid="download-button"]');
  78  |     await expect(downloadButton).toBeVisible();
  79  | 
  80  |     // Intercept/wait for download
  81  |     const downloadPromise = page.waitForEvent('download');
  82  |     await downloadButton.click();
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
```