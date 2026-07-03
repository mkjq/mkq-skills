# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: library.spec.ts >> Feature 2: Responsive PDF Reader >> F2-T1-1: Clicking a book card opens the responsive PDF reader viewer
- Location: tests\library.spec.ts:164:7

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
  60  |   // F1-T1-5: Category filtering
  61  |   test('F1-T1-5: Selecting a category filter (e.g. "Programming") hides non-matching books', async ({ page }) => {
  62  |     // Find category button/tab for "Programming"
  63  |     const categoryTab = page.locator('[data-testid="category-tab"]:has-text("Programming")');
  64  |     await categoryTab.click();
  65  | 
  66  |     const bookCards = page.locator('[data-testid="book-card"]');
  67  |     const count = await bookCards.count();
  68  |     expect(count).toBeGreaterThan(0);
  69  | 
  70  |     for (let i = 0; i < count; i++) {
  71  |       const category = await bookCards.nth(i).locator('[data-testid="book-category"]').innerText();
  72  |       expect(category.toLowerCase()).toBe('programming');
  73  |     }
  74  |   });
  75  | 
  76  |   // F1-T2-1: Special characters search
  77  |   test('F1-T2-1: Searching for special characters returns empty results cleanly with a "No books found" message', async ({ page }) => {
  78  |     const searchInput = page.locator('[data-testid="search-input"]');
  79  |     await searchInput.fill('!@#$%^&*');
  80  |     await page.waitForTimeout(300);
  81  | 
  82  |     const bookCards = page.locator('[data-testid="book-card"]');
  83  |     await expect(bookCards).toHaveCount(0);
  84  | 
  85  |     const noResults = page.locator('[data-testid="no-results"]');
  86  |     await expect(noResults).toBeVisible();
  87  |     await expect(noResults).toContainText(/No books found/i);
  88  |   });
  89  | 
  90  |   // F1-T2-2: No-match search UI
  91  |   test('F1-T2-2: A search query that matches zero books displays a friendly placeholder message', async ({ page }) => {
  92  |     const searchInput = page.locator('[data-testid="search-input"]');
  93  |     await searchInput.fill('NonExistentBookNamexyz123');
  94  |     await page.waitForTimeout(300);
  95  | 
  96  |     const noResults = page.locator('[data-testid="no-results"]');
  97  |     await expect(noResults).toBeVisible();
  98  |     // Verify it is a friendly placeholder message
  99  |     await expect(noResults).toContainText(/We couldn't find any books matching your search/i);
  100 |   });
  101 | 
  102 |   // F1-T2-3: Long query input
  103 |   test('F1-T2-3: Entering a 200+ character search query handles gracefully without UI distortion', async ({ page }) => {
  104 |     const longQuery = 'a'.repeat(250);
  105 |     const searchInput = page.locator('[data-testid="search-input"]');
  106 |     await searchInput.fill(longQuery);
  107 |     await page.waitForTimeout(300);
  108 | 
  109 |     // Verify search input still fits or is styled correctly and hasn't broken layout
  110 |     const box = await searchInput.boundingBox();
  111 |     expect(box).not.toBeNull();
  112 |     expect(box!.width).toBeGreaterThan(50); // shouldn't shrink to zero
  113 | 
  114 |     // Grid should show no results cleanly
  115 |     const noResults = page.locator('[data-testid="no-results"]');
  116 |     await expect(noResults).toBeVisible();
  117 |   });
  118 | 
  119 |   // F1-T2-4: Rapid filter changes
  120 |   test('F1-T2-4: Rapidly clicking different category tabs does not result in race conditions or page crashes', async ({ page }) => {
  121 |     const categories = ['Programming', 'Technology', 'All', 'Design', 'Programming'];
  122 |     
  123 |     // Perform rapid clicks
  124 |     for (const cat of categories) {
  125 |       const tab = page.locator(`[data-testid="category-tab"]:has-text("${cat}")`);
  126 |       // Use force click or check tab is visible, then click immediately without waiting
  127 |       if (await tab.count() > 0) {
  128 |         await tab.first().click();
  129 |       }
  130 |     }
  131 | 
  132 |     // Verify page has not crashed and main title is still visible and responsive
  133 |     const title = page.locator('h1');
  134 |     await expect(title).toBeVisible();
  135 |   });
  136 | 
  137 |   // F1-T2-5: Category list reset
  138 |   test('F1-T2-5: Selecting a category and then selecting "All" resets the list to exactly 45 books', async ({ page }) => {
  139 |     // Select Programming first
  140 |     const programmingTab = page.locator('[data-testid="category-tab"]:has-text("Programming")');
  141 |     await programmingTab.click();
  142 |     
  143 |     // Verify list is filtered (less than 45 books)
  144 |     let bookCards = page.locator('[data-testid="book-card"]');
  145 |     let count = await bookCards.count();
  146 |     expect(count).toBeLessThan(45);
  147 | 
  148 |     // Select All
  149 |     const allTab = page.locator('[data-testid="category-tab"]:has-text("All")');
  150 |     await allTab.click();
  151 | 
  152 |     // Verify list reset to 45 books
  153 |     bookCards = page.locator('[data-testid="book-card"]');
  154 |     await expect(bookCards).toHaveCount(45);
  155 |   });
  156 | });
  157 | 
  158 | test.describe('Feature 2: Responsive PDF Reader', () => {
  159 |   test.beforeEach(async ({ page }) => {
> 160 |     await page.goto('/library');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/library
  161 |   });
  162 | 
  163 |   // F2-T1-1: Open PDF Viewer
  164 |   test('F2-T1-1: Clicking a book card opens the responsive PDF reader viewer', async ({ page }) => {
  165 |     const bookCard = page.locator('[data-testid="book-card"]').first();
  166 |     await bookCard.click();
  167 | 
  168 |     const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
  169 |     await expect(pdfViewer).toBeVisible();
  170 |   });
  171 | 
  172 |   // F2-T1-2: Check dedicated library
  173 |   test('F2-T1-2: Verify DOM elements confirm use of canvas-based react-pdf instead of iframe', async ({ page }) => {
  174 |     const bookCard = page.locator('[data-testid="book-card"]').first();
  175 |     await bookCard.click();
  176 | 
  177 |     const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
  178 |     await expect(pdfViewer).toBeVisible();
  179 | 
  180 |     // The viewer should contain a canvas element for rendering PDF pages
  181 |     const canvas = pdfViewer.locator('canvas');
  182 |     await expect(canvas).toBeVisible();
  183 | 
  184 |     // The viewer must NOT contain an iframe
  185 |     const iframe = pdfViewer.locator('iframe');
  186 |     await expect(iframe).toHaveCount(0);
  187 |   });
  188 | 
  189 |   // F2-T1-3: Responsive layout checks
  190 |   test('F2-T1-3: Under mobile viewport, container controls adapt and no horizontal scroll overflows occur', async ({ page }) => {
  191 |     // Set viewport to a small mobile screen (iPhone SE size or similar)
  192 |     await page.setViewportSize({ width: 375, height: 667 });
  193 | 
  194 |     const bookCard = page.locator('[data-testid="book-card"]').first();
  195 |     await bookCard.click();
  196 | 
  197 |     const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
  198 |     await expect(pdfViewer).toBeVisible();
  199 | 
  200 |     // Zoom controls should be visible and adapt (we'll check bounding box / overlap if needed)
  201 |     const zoomIn = page.locator('[data-testid="zoom-in"]');
  202 |     const zoomOut = page.locator('[data-testid="zoom-out"]');
  203 |     await expect(zoomIn).toBeVisible();
  204 |     await expect(zoomOut).toBeVisible();
  205 | 
  206 |     // Verify no horizontal overflow in the viewer element
  207 |     const overflow = await page.evaluate(() => {
  208 |       const el = document.querySelector('[data-testid="pdf-viewer"]');
  209 |       if (!el) return false;
  210 |       return el.scrollWidth > el.clientWidth;
  211 |     });
  212 |     expect(overflow).toBe(false);
  213 |   });
  214 | 
  215 |   // F2-T1-4: Zoom Controls
  216 |   test('F2-T1-4: Zoom In and Zoom Out buttons change canvas scale properties', async ({ page }) => {
  217 |     const bookCard = page.locator('[data-testid="book-card"]').first();
  218 |     await bookCard.click();
  219 | 
  220 |     const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
  221 |     await expect(pdfViewer).toBeVisible();
  222 | 
  223 |     const canvas = pdfViewer.locator('canvas');
  224 |     await expect(canvas).toBeVisible();
  225 | 
  226 |     // Get initial dimensions
  227 |     const initialBox = await canvas.boundingBox();
  228 |     expect(initialBox).not.toBeNull();
  229 |     const initialWidth = initialBox!.width;
  230 | 
  231 |     // Zoom In
  232 |     const zoomIn = page.locator('[data-testid="zoom-in"]');
  233 |     await zoomIn.click();
  234 |     await page.waitForTimeout(100); // Allow scale change to render
  235 | 
  236 |     const zoomedInBox = await canvas.boundingBox();
  237 |     expect(zoomedInBox!.width).toBeGreaterThan(initialWidth);
  238 | 
  239 |     // Zoom Out
  240 |     const zoomOut = page.locator('[data-testid="zoom-out"]');
  241 |     await zoomOut.click();
  242 |     await zoomOut.click();
  243 |     await page.waitForTimeout(100);
  244 | 
  245 |     const zoomedOutBox = await canvas.boundingBox();
  246 |     expect(zoomedOutBox!.width).toBeLessThan(zoomedInBox!.width);
  247 |   });
  248 | 
  249 |   // F2-T1-5: Page navigation controls
  250 |   test('F2-T1-5: Next page and Previous page controls successfully navigate pages in the viewer', async ({ page }) => {
  251 |     const bookCard = page.locator('[data-testid="book-card"]').first();
  252 |     await bookCard.click();
  253 | 
  254 |     const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
  255 |     await expect(pdfViewer).toBeVisible();
  256 | 
  257 |     const pageInfo = page.locator('[data-testid="page-info"]');
  258 |     await expect(pageInfo).toBeVisible();
  259 |     let text = await pageInfo.innerText();
  260 |     expect(text).toContain('1'); // Starts on page 1
```