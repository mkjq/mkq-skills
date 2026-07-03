import { test, expect } from '@playwright/test';

test.describe('Feature 1: Books Library Grid UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/library');
  });

  // F1-T1-1: Page load verification
  test('F1-T1-1: /library returns HTTP 200 and loads HTML with glassmorphic dark theme styling', async ({ page }) => {
    // Check that we loaded the page successfully
    const title = page.locator('h1');
    await expect(title).toBeVisible();

    // Verify dark theme / glassmorphic styling is present in body/main classes or CSS properties
    const mainContainer = page.locator('main');
    // Expect typical dark background style classes like dark, bg-black, bg-zinc, etc.
    const classes = await mainContainer.getAttribute('class') || '';
    expect(classes.toLowerCase()).toMatch(/(bg-|dark|black|zinc|slate|neutral)/);
  });

  // F1-T1-2: Grid list verification
  test('F1-T1-2: Exactly 45 books are rendered in the grid layout', async ({ page }) => {
    const bookCards = page.locator('[data-testid="book-card"]');
    await expect(bookCards).toHaveCount(45);
  });

  // F1-T1-3: Search by title
  test('F1-T1-3: Searching for "Cloud" returns only books containing "Cloud" in their title', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('Cloud');
    await page.waitForTimeout(300); // Wait for debounce if any

    const bookCards = page.locator('[data-testid="book-card"]');
    const count = await bookCards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const title = await bookCards.nth(i).locator('[data-testid="book-title"]').innerText();
      expect(title.toLowerCase()).toContain('cloud');
    }
  });

  // F1-T1-4: Search by author
  test('F1-T1-4: Searching for an author\'s name updates the grid with their books', async ({ page }) => {
    // Search for a specific author
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('Martin Fowler');
    await page.waitForTimeout(300);

    const bookCards = page.locator('[data-testid="book-card"]');
    const count = await bookCards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const author = await bookCards.nth(i).locator('[data-testid="book-author"]').innerText();
      expect(author.toLowerCase()).toContain('martin fowler');
    }
  });

  // F1-T1-5: Category filtering
  test('F1-T1-5: Selecting a category filter (e.g. "Programming") hides non-matching books', async ({ page }) => {
    // Find category button/tab for "Programming"
    const categoryTab = page.locator('[data-testid="category-tab"]:has-text("Programming")');
    await categoryTab.click();

    const bookCards = page.locator('[data-testid="book-card"]');
    const count = await bookCards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const category = await bookCards.nth(i).locator('[data-testid="book-category"]').innerText();
      expect(category.toLowerCase()).toBe('programming');
    }
  });

  // F1-T2-1: Special characters search
  test('F1-T2-1: Searching for special characters returns empty results cleanly with a "No books found" message', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('!@#$%^&*');
    await page.waitForTimeout(300);

    const bookCards = page.locator('[data-testid="book-card"]');
    await expect(bookCards).toHaveCount(0);

    const noResults = page.locator('[data-testid="no-results"]');
    await expect(noResults).toBeVisible();
    await expect(noResults).toContainText(/No books found/i);
  });

  // F1-T2-2: No-match search UI
  test('F1-T2-2: A search query that matches zero books displays a friendly placeholder message', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('NonExistentBookNamexyz123');
    await page.waitForTimeout(300);

    const noResults = page.locator('[data-testid="no-results"]');
    await expect(noResults).toBeVisible();
    // Verify it is a friendly placeholder message
    await expect(noResults).toContainText(/We couldn't find any books matching your search/i);
  });

  // F1-T2-3: Long query input
  test('F1-T2-3: Entering a 200+ character search query handles gracefully without UI distortion', async ({ page }) => {
    const longQuery = 'a'.repeat(250);
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill(longQuery);
    await page.waitForTimeout(300);

    // Verify search input still fits or is styled correctly and hasn't broken layout
    const box = await searchInput.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(50); // shouldn't shrink to zero

    // Grid should show no results cleanly
    const noResults = page.locator('[data-testid="no-results"]');
    await expect(noResults).toBeVisible();
  });

  // F1-T2-4: Rapid filter changes
  test('F1-T2-4: Rapidly clicking different category tabs does not result in race conditions or page crashes', async ({ page }) => {
    const categories = ['Programming', 'Technology', 'All', 'Design', 'Programming'];
    
    // Perform rapid clicks
    for (const cat of categories) {
      const tab = page.locator(`[data-testid="category-tab"]:has-text("${cat}")`);
      // Use force click or check tab is visible, then click immediately without waiting
      if (await tab.count() > 0) {
        await tab.first().click();
      }
    }

    // Verify page has not crashed and main title is still visible and responsive
    const title = page.locator('h1');
    await expect(title).toBeVisible();
  });

  // F1-T2-5: Category list reset
  test('F1-T2-5: Selecting a category and then selecting "All" resets the list to exactly 45 books', async ({ page }) => {
    // Select Programming first
    const programmingTab = page.locator('[data-testid="category-tab"]:has-text("Programming")');
    await programmingTab.click();
    
    // Verify list is filtered (less than 45 books)
    let bookCards = page.locator('[data-testid="book-card"]');
    let count = await bookCards.count();
    expect(count).toBeLessThan(45);

    // Select All
    const allTab = page.locator('[data-testid="category-tab"]:has-text("All")');
    await allTab.click();

    // Verify list reset to 45 books
    bookCards = page.locator('[data-testid="book-card"]');
    await expect(bookCards).toHaveCount(45);
  });
});

test.describe('Feature 2: Responsive PDF Reader', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/library');
  });

  // F2-T1-1: Open PDF Viewer
  test('F2-T1-1: Clicking a book card opens the responsive PDF reader viewer', async ({ page }) => {
    const bookCard = page.locator('[data-testid="book-card"]').first();
    await bookCard.click();

    const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
    await expect(pdfViewer).toBeVisible();
  });

  // F2-T1-2: Check dedicated library
  test('F2-T1-2: Verify DOM elements confirm use of canvas-based react-pdf instead of iframe', async ({ page }) => {
    const bookCard = page.locator('[data-testid="book-card"]').first();
    await bookCard.click();

    const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
    await expect(pdfViewer).toBeVisible();

    // The viewer should contain a canvas element for rendering PDF pages
    const canvas = pdfViewer.locator('canvas');
    await expect(canvas).toBeVisible();

    // The viewer must NOT contain an iframe
    const iframe = pdfViewer.locator('iframe');
    await expect(iframe).toHaveCount(0);
  });

  // F2-T1-3: Responsive layout checks
  test('F2-T1-3: Under mobile viewport, container controls adapt and no horizontal scroll overflows occur', async ({ page }) => {
    // Set viewport to a small mobile screen (iPhone SE size or similar)
    await page.setViewportSize({ width: 375, height: 667 });

    const bookCard = page.locator('[data-testid="book-card"]').first();
    await bookCard.click();

    const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
    await expect(pdfViewer).toBeVisible();

    // Zoom controls should be visible and adapt (we'll check bounding box / overlap if needed)
    const zoomIn = page.locator('[data-testid="zoom-in"]');
    const zoomOut = page.locator('[data-testid="zoom-out"]');
    await expect(zoomIn).toBeVisible();
    await expect(zoomOut).toBeVisible();

    // Verify no horizontal overflow in the viewer element
    const overflow = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="pdf-viewer"]');
      if (!el) return false;
      return el.scrollWidth > el.clientWidth;
    });
    expect(overflow).toBe(false);
  });

  // F2-T1-4: Zoom Controls
  test('F2-T1-4: Zoom In and Zoom Out buttons change canvas scale properties', async ({ page }) => {
    const bookCard = page.locator('[data-testid="book-card"]').first();
    await bookCard.click();

    const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
    await expect(pdfViewer).toBeVisible();

    const canvas = pdfViewer.locator('canvas');
    await expect(canvas).toBeVisible();

    // Get initial dimensions
    const initialBox = await canvas.boundingBox();
    expect(initialBox).not.toBeNull();
    const initialWidth = initialBox!.width;

    // Zoom In
    const zoomIn = page.locator('[data-testid="zoom-in"]');
    await zoomIn.click();
    await page.waitForTimeout(100); // Allow scale change to render

    const zoomedInBox = await canvas.boundingBox();
    expect(zoomedInBox!.width).toBeGreaterThan(initialWidth);

    // Zoom Out
    const zoomOut = page.locator('[data-testid="zoom-out"]');
    await zoomOut.click();
    await zoomOut.click();
    await page.waitForTimeout(100);

    const zoomedOutBox = await canvas.boundingBox();
    expect(zoomedOutBox!.width).toBeLessThan(zoomedInBox!.width);
  });

  // F2-T1-5: Page navigation controls
  test('F2-T1-5: Next page and Previous page controls successfully navigate pages in the viewer', async ({ page }) => {
    const bookCard = page.locator('[data-testid="book-card"]').first();
    await bookCard.click();

    const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
    await expect(pdfViewer).toBeVisible();

    const pageInfo = page.locator('[data-testid="page-info"]');
    await expect(pageInfo).toBeVisible();
    let text = await pageInfo.innerText();
    expect(text).toContain('1'); // Starts on page 1

    const nextPage = page.locator('[data-testid="next-page"]');
    await nextPage.click();
    
    // Page count should change
    await expect(pageInfo).toContainText('2');

    const prevPage = page.locator('[data-testid="prev-page"]');
    await prevPage.click();

    await expect(pageInfo).toContainText('1');
  });

  // F2-T2-1: Invalid file key error
  test('F2-T2-1: Opening a book that has an invalid R2 key fails gracefully showing an error alert/message', async ({ page }) => {
    // For this test, we can mock/stub the API call `/api/books` to return a book card with an invalid fileKey,
    // or intercept the API call to `/api/books/download` to return a 404/500, and check if UI shows error.
    await page.route('**/api/books/download?key=**', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Book not found' })
      });
    });

    // Click first book card
    const bookCard = page.locator('[data-testid="book-card"]').first();
    await bookCard.click();

    // Check if error fallback is shown
    const errorAlert = page.locator('[data-testid="viewer-error"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/failed to load/i);
  });

  // F2-T2-2: Boundary zoom in
  test('F2-T2-2: Repeatedly clicking Zoom In disables the button at maximum zoom (200%)', async ({ page }) => {
    const bookCard = page.locator('[data-testid="book-card"]').first();
    await bookCard.click();

    const zoomIn = page.locator('[data-testid="zoom-in"]');
    // Zoom in multiple times until max zoom (e.g. 10 times should hit 200% if scale step is 10% or 15%)
    for (let i = 0; i < 15; i++) {
      if (await zoomIn.isDisabled()) {
        break;
      }
      await zoomIn.click();
    }
    await expect(zoomIn).toBeDisabled();
  });

  // F2-T2-3: Boundary zoom out
  test('F2-T2-3: Repeatedly clicking Zoom Out disables the button at minimum zoom (50%)', async ({ page }) => {
    const bookCard = page.locator('[data-testid="book-card"]').first();
    await bookCard.click();

    const zoomOut = page.locator('[data-testid="zoom-out"]');
    // Zoom out multiple times until min zoom
    for (let i = 0; i < 15; i++) {
      if (await zoomOut.isDisabled()) {
        break;
      }
      await zoomOut.click();
    }
    await expect(zoomOut).toBeDisabled();
  });

  // F2-T2-4: Under-page boundary
  test('F2-T2-4: Previous page button is disabled on page 1', async ({ page }) => {
    const bookCard = page.locator('[data-testid="book-card"]').first();
    await bookCard.click();

    const prevPage = page.locator('[data-testid="prev-page"]');
    await expect(prevPage).toBeDisabled();
  });

  // F2-T2-5: Over-page boundary
  test('F2-T2-5: Next page button is disabled on the last page of the PDF', async ({ page }) => {
    // Mock the PDF loading so it returns 2 pages, and we can easily click to the end.
    // Or we mock page count via some test logic. If we can't mock pdf length,
    // we can navigate to the last page.
    const bookCard = page.locator('[data-testid="book-card"]').first();
    await bookCard.click();

    const pageInfo = page.locator('[data-testid="page-info"]');
    await expect(pageInfo).toBeVisible();

    const nextPage = page.locator('[data-testid="next-page"]');

    // Keep clicking next page until we hit the last page
    let isLast = false;
    for (let i = 0; i < 1000; i++) {
      if (await nextPage.isDisabled()) {
        isLast = true;
        break;
      }
      await nextPage.click();
    }
    expect(isLast).toBe(true);
    await expect(nextPage).toBeDisabled();
  });
});
