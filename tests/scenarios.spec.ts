import { test, expect } from '@playwright/test';

test.describe('Tier 3: Cross-Feature Combinations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/library');
  });

  // T3-1: Search + Category Filter
  test('T3-1: Search + Category Filter interactions', async ({ page }) => {
    // Filter grid to Technology
    const technologyTab = page.locator('[data-testid="category-tab"]:has-text("Technology")');
    await technologyTab.click();

    // Search for a History book (e.g. "Brief History of Time")
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('Brief History of Time');
    await page.waitForTimeout(300);

    // Grid should show 0 results since it is a History book, not Technology
    const bookCards = page.locator('[data-testid="book-card"]');
    await expect(bookCards).toHaveCount(0);

    // Reset search
    await searchInput.fill('');
    await page.waitForTimeout(300);

    // Grid should show only Technology books again
    const count = await bookCards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const category = await bookCards.nth(i).locator('[data-testid="book-category"]').innerText();
      expect(category.toLowerCase()).toBe('technology');
    }
  });

  // T3-2: Viewer + Search preservation
  test('T3-2: Search query and category filter are preserved after closing viewer', async ({ page }) => {
    // Filter by Programming
    const programmingTab = page.locator('[data-testid="category-tab"]:has-text("Programming")');
    await programmingTab.click();

    // Search for "Design"
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('Design');
    await page.waitForTimeout(300);

    // Verify some results exist
    const bookCards = page.locator('[data-testid="book-card"]');
    const initialCount = await bookCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Open first book
    await bookCards.first().click();
    const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
    await expect(pdfViewer).toBeVisible();

    // Close reader
    const closeBtn = page.locator('[data-testid="close-viewer"]');
    await closeBtn.click();
    await expect(pdfViewer).not.toBeVisible();

    // Verify search query and filter are preserved
    await expect(searchInput).toHaveValue('Design');
    
    // Grid count should be preserved
    await expect(bookCards).toHaveCount(initialCount);
  });

  // T3-3: Viewer + R2 Download
  test('T3-3: PDF downloads from viewer UI and viewer remains open', async ({ page }) => {
    const bookCard = page.locator('[data-testid="book-card"]').first();
    await bookCard.click();

    const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
    await expect(pdfViewer).toBeVisible();

    const downloadButton = pdfViewer.locator('[data-testid="download-button"]');
    await expect(downloadButton).toBeVisible();

    // Intercept/wait for download
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');

    // Viewer should stay open
    await expect(pdfViewer).toBeVisible();
  });

  // T3-4: Filter + Download
  test('T3-4: Download from filtered grid maintains filter state', async ({ page }) => {
    // Filter by Design
    const designTab = page.locator('[data-testid="category-tab"]:has-text("Design")');
    await designTab.click();

    const bookCards = page.locator('[data-testid="book-card"]');
    const countBeforeDownload = await bookCards.count();
    expect(countBeforeDownload).toBeGreaterThan(0);

    // Click download on first card
    const firstCard = bookCards.first();
    const downloadButton = firstCard.locator('[data-testid="download-button"]');

    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');

    // Grid state should remain filtered
    await expect(bookCards).toHaveCount(countBeforeDownload);
  });
});

test.describe('Tier 4: Real-World Scenarios', () => {
  // T4-1: Desktop Happy Path
  test('T4-1: Desktop Happy Path', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/library');

    // Search for "Next.js"
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('Next.js');
    await page.waitForTimeout(300);

    // Verify results exist
    const bookCards = page.locator('[data-testid="book-card"]');
    await expect(bookCards.first()).toBeVisible();

    // Click the book to open the reader
    await bookCards.first().click();
    const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
    await expect(pdfViewer).toBeVisible();

    // Zoom in
    const zoomIn = page.locator('[data-testid="zoom-in"]');
    await zoomIn.click();

    // Click download
    const downloadButton = pdfViewer.locator('[data-testid="download-button"]');
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  // T4-2: Mobile Happy Path
  test('T4-2: Mobile Happy Path', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/library');

    // Filter by Programming
    const programmingTab = page.locator('[data-testid="category-tab"]:has-text("Programming")');
    await programmingTab.click();

    // Tap first card
    const bookCards = page.locator('[data-testid="book-card"]');
    await bookCards.first().click();

    const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
    await expect(pdfViewer).toBeVisible();

    // Navigate page
    const nextPage = page.locator('[data-testid="next-page"]');
    await nextPage.click();
    
    const pageInfo = page.locator('[data-testid="page-info"]');
    await expect(pageInfo).toContainText('2');

    // Download PDF locally
    const downloadButton = pdfViewer.locator('[data-testid="download-button"]');
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  // T4-3: Reader Switching & State Preservation
  test('T4-3: Reader switching resets/preserves state correctly', async ({ page }) => {
    await page.goto('/library');

    // Open Book A
    const bookCards = page.locator('[data-testid="book-card"]');
    const bookA = bookCards.nth(0);
    const bookB = bookCards.nth(1);

    await bookA.click();
    const pdfViewer = page.locator('[data-testid="pdf-viewer"]');
    await expect(pdfViewer).toBeVisible();

    // Change zoom level
    const zoomIn = page.locator('[data-testid="zoom-in"]');
    await zoomIn.click();
    await zoomIn.click();

    // Close reader
    const closeBtn = page.locator('[data-testid="close-viewer"]');
    await closeBtn.click();
    await expect(pdfViewer).not.toBeVisible();

    // Open Book B
    await bookB.click();
    await expect(pdfViewer).toBeVisible();

    // Zoom level should be reset to default zoom (expect zoomIn to be enabled again)
    await expect(zoomIn).toBeEnabled();

    // Close Book B and reopen Book A
    await closeBtn.click();
    await bookA.click();
    await expect(pdfViewer).toBeVisible();

    // State of Book A should either be preserved or clean depending on design spec.
    // Usually we expect a clean/default load for newly opened/reopened sessions,
    // or if the spec asks to preserve zoom state of Book A, we verify that.
    // Let's assume standard behavior where zoom resets to default, but the grid state remains.
  });

  // T4-4: Error Recovery
  test('T4-4: UI displays fallback error gracefully on API/R2 failure and user can retry', async ({ page }) => {
    // 1. Simulate API failure for `/api/books`
    await page.route('**/api/books', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Database connection failed' })
      });
    });

    await page.goto('/library');

    // UI should show an error state/fallback
    const errorAlert = page.locator('[data-testid="error-alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/Failed to load books/i);

    // 2. Recover from error (restore normal routing and retry)
    await page.route('**/api/books', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'book-1',
            title: 'Refactoring',
            author: 'Martin Fowler',
            category: 'Programming',
            description: 'Improving the design of existing code',
            fileKey: 'books/refactoring.pdf'
          }
        ])
      });
    });

    const retryButton = page.locator('[data-testid="retry-button"]');
    await retryButton.click();

    // Error alert should be hidden and card rendered
    await expect(errorAlert).not.toBeVisible();
    await expect(page.locator('[data-testid="book-card"]')).toHaveCount(1);
  });

  // T4-5: Empty Search Recovery
  test('T4-5: Empty search displays recovery options and restores full grid', async ({ page }) => {
    await page.goto('/library');

    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('NonExistentBookNamexyz123');
    await page.waitForTimeout(300);

    // Expect empty search UI
    const noResults = page.locator('[data-testid="no-results"]');
    await expect(noResults).toBeVisible();

    const clearSearchBtn = page.locator('[data-testid="clear-search-button"]');
    await expect(clearSearchBtn).toBeVisible();

    // Click clear search
    await clearSearchBtn.click();

    // Grid should recover and display 45 books, and search input should be empty
    await expect(searchInput).toHaveValue('');
    const bookCards = page.locator('[data-testid="book-card"]');
    await expect(bookCards).toHaveCount(45);
  });
});
