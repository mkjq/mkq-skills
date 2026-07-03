# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scenarios.spec.ts >> Tier 4: Real-World Scenarios >> T4-1: Desktop Happy Path
- Location: tests\scenarios.spec.ts:118:7

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
> 120 |     await page.goto('/library');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/library
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
  183 |     await page.goto('/library');
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
```