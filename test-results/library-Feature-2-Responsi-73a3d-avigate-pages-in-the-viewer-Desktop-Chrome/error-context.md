# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: library.spec.ts >> Feature 2: Responsive PDF Reader >> F2-T1-5: Next page and Previous page controls successfully navigate pages in the viewer
- Location: tests\library.spec.ts:250:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="book-card"]').first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e15]:
    - heading "404" [level=1] [ref=e16]
    - heading "This page could not be found." [level=2] [ref=e18]
  - button [ref=e19] [cursor=pointer]:
    - img [ref=e20]
  - generic [ref=e23]:
    - generic [ref=e24]:
      - heading "تخصيص المظهر" [level=3] [ref=e25]:
        - img [ref=e26]
        - text: تخصيص المظهر
      - button [ref=e32] [cursor=pointer]:
        - img [ref=e33]
    - generic [ref=e36]:
      - generic [ref=e37]: الوضع (Mode)
      - generic [ref=e38]:
        - button "داكن" [ref=e39] [cursor=pointer]
        - button "فاتح" [ref=e40] [cursor=pointer]
    - generic [ref=e41]:
      - generic [ref=e42]: الاتجاه (Direction)
      - generic [ref=e43]:
        - button "RTL (عربي)" [ref=e44] [cursor=pointer]
        - button "LTR (English)" [ref=e45] [cursor=pointer]
    - generic [ref=e46]:
      - generic [ref=e47]: الألوان (Colors)
      - generic [ref=e48]:
        - button [ref=e49] [cursor=pointer]
        - button [ref=e50] [cursor=pointer]
        - button [ref=e51] [cursor=pointer]
        - button [ref=e52] [cursor=pointer]
    - generic [ref=e53]:
      - generic [ref=e54]: الأشكال (Shapes)
      - generic [ref=e55]:
        - button "حادة" [ref=e56] [cursor=pointer]
        - button "ناعمة" [ref=e57] [cursor=pointer]
        - button "دائرية" [ref=e58] [cursor=pointer]
    - generic [ref=e59]:
      - generic [ref=e60]: الحجم (Size)
      - generic [ref=e61]:
        - button "صغير" [ref=e62] [cursor=pointer]
        - button "متوسط" [ref=e63] [cursor=pointer]
        - button "كبير" [ref=e64] [cursor=pointer]
```

# Test source

```ts
  152 |     // Verify list reset to 45 books
  153 |     bookCards = page.locator('[data-testid="book-card"]');
  154 |     await expect(bookCards).toHaveCount(45);
  155 |   });
  156 | });
  157 | 
  158 | test.describe('Feature 2: Responsive PDF Reader', () => {
  159 |   test.beforeEach(async ({ page }) => {
  160 |     await page.goto('/library');
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
> 252 |     await bookCard.click();
      |                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
  253 | 
  254 |     const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
  255 |     await expect(pdfViewer).toBeVisible();
  256 | 
  257 |     const pageInfo = page.locator('[data-testid="page-info"]');
  258 |     await expect(pageInfo).toBeVisible();
  259 |     let text = await pageInfo.innerText();
  260 |     expect(text).toContain('1'); // Starts on page 1
  261 | 
  262 |     const nextPage = page.locator('[data-testid="next-page"]');
  263 |     await nextPage.click();
  264 |     
  265 |     // Page count should change
  266 |     await expect(pageInfo).toContainText('2');
  267 | 
  268 |     const prevPage = page.locator('[data-testid="prev-page"]');
  269 |     await prevPage.click();
  270 | 
  271 |     await expect(pageInfo).toContainText('1');
  272 |   });
  273 | 
  274 |   // F2-T2-1: Invalid file key error
  275 |   test('F2-T2-1: Opening a book that has an invalid R2 key fails gracefully showing an error alert/message', async ({ page }) => {
  276 |     // For this test, we can mock/stub the API call `/api/books` to return a book card with an invalid fileKey,
  277 |     // or intercept the API call to `/api/books/download` to return a 404/500, and check if UI shows error.
  278 |     await page.route('**/api/books/download?key=**', async route => {
  279 |       await route.fulfill({
  280 |         status: 404,
  281 |         contentType: 'application/json',
  282 |         body: JSON.stringify({ error: 'Book not found' })
  283 |       });
  284 |     });
  285 | 
  286 |     // Click first book card
  287 |     const bookCard = page.locator('[data-testid="book-card"]').first();
  288 |     await bookCard.click();
  289 | 
  290 |     // Check if error fallback is shown
  291 |     const errorAlert = page.locator('[data-testid="viewer-error"]');
  292 |     await expect(errorAlert).toBeVisible();
  293 |     await expect(errorAlert).toContainText(/failed to load/i);
  294 |   });
  295 | 
  296 |   // F2-T2-2: Boundary zoom in
  297 |   test('F2-T2-2: Repeatedly clicking Zoom In disables the button at maximum zoom (200%)', async ({ page }) => {
  298 |     const bookCard = page.locator('[data-testid="book-card"]').first();
  299 |     await bookCard.click();
  300 | 
  301 |     const zoomIn = page.locator('[data-testid="zoom-in"]');
  302 |     // Zoom in multiple times until max zoom (e.g. 10 times should hit 200% if scale step is 10% or 15%)
  303 |     for (let i = 0; i < 15; i++) {
  304 |       if (await zoomIn.isDisabled()) {
  305 |         break;
  306 |       }
  307 |       await zoomIn.click();
  308 |     }
  309 |     await expect(zoomIn).toBeDisabled();
  310 |   });
  311 | 
  312 |   // F2-T2-3: Boundary zoom out
  313 |   test('F2-T2-3: Repeatedly clicking Zoom Out disables the button at minimum zoom (50%)', async ({ page }) => {
  314 |     const bookCard = page.locator('[data-testid="book-card"]').first();
  315 |     await bookCard.click();
  316 | 
  317 |     const zoomOut = page.locator('[data-testid="zoom-out"]');
  318 |     // Zoom out multiple times until min zoom
  319 |     for (let i = 0; i < 15; i++) {
  320 |       if (await zoomOut.isDisabled()) {
  321 |         break;
  322 |       }
  323 |       await zoomOut.click();
  324 |     }
  325 |     await expect(zoomOut).toBeDisabled();
  326 |   });
  327 | 
  328 |   // F2-T2-4: Under-page boundary
  329 |   test('F2-T2-4: Previous page button is disabled on page 1', async ({ page }) => {
  330 |     const bookCard = page.locator('[data-testid="book-card"]').first();
  331 |     await bookCard.click();
  332 | 
  333 |     const prevPage = page.locator('[data-testid="prev-page"]');
  334 |     await expect(prevPage).toBeDisabled();
  335 |   });
  336 | 
  337 |   // F2-T2-5: Over-page boundary
  338 |   test('F2-T2-5: Next page button is disabled on the last page of the PDF', async ({ page }) => {
  339 |     // Mock the PDF loading so it returns 2 pages, and we can easily click to the end.
  340 |     // Or we mock page count via some test logic. If we can't mock pdf length,
  341 |     // we can navigate to the last page.
  342 |     const bookCard = page.locator('[data-testid="book-card"]').first();
  343 |     await bookCard.click();
  344 | 
  345 |     const pageInfo = page.locator('[data-testid="page-info"]');
  346 |     await expect(pageInfo).toBeVisible();
  347 | 
  348 |     const nextPage = page.locator('[data-testid="next-page"]');
  349 | 
  350 |     // Keep clicking next page until we hit the last page
  351 |     let isLast = false;
  352 |     for (let i = 0; i < 1000; i++) {
```