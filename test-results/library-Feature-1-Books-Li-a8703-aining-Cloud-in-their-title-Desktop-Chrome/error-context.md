# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: library.spec.ts >> Feature 1: Books Library Grid UI >> F1-T1-3: Searching for "Cloud" returns only books containing "Cloud" in their title
- Location: tests\library.spec.ts:28:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="search-input"]')

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
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Feature 1: Books Library Grid UI', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto('/library');
  6   |   });
  7   | 
  8   |   // F1-T1-1: Page load verification
  9   |   test('F1-T1-1: /library returns HTTP 200 and loads HTML with glassmorphic dark theme styling', async ({ page }) => {
  10  |     // Check that we loaded the page successfully
  11  |     const title = page.locator('h1');
  12  |     await expect(title).toBeVisible();
  13  | 
  14  |     // Verify dark theme / glassmorphic styling is present in body/main classes or CSS properties
  15  |     const mainContainer = page.locator('main');
  16  |     // Expect typical dark background style classes like dark, bg-black, bg-zinc, etc.
  17  |     const classes = await mainContainer.getAttribute('class') || '';
  18  |     expect(classes.toLowerCase()).toMatch(/(bg-|dark|black|zinc|slate|neutral)/);
  19  |   });
  20  | 
  21  |   // F1-T1-2: Grid list verification
  22  |   test('F1-T1-2: Exactly 45 books are rendered in the grid layout', async ({ page }) => {
  23  |     const bookCards = page.locator('[data-testid="book-card"]');
  24  |     await expect(bookCards).toHaveCount(45);
  25  |   });
  26  | 
  27  |   // F1-T1-3: Search by title
  28  |   test('F1-T1-3: Searching for "Cloud" returns only books containing "Cloud" in their title', async ({ page }) => {
  29  |     const searchInput = page.locator('[data-testid="search-input"]');
> 30  |     await searchInput.fill('Cloud');
      |                       ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  31  |     await page.waitForTimeout(300); // Wait for debounce if any
  32  | 
  33  |     const bookCards = page.locator('[data-testid="book-card"]');
  34  |     const count = await bookCards.count();
  35  |     expect(count).toBeGreaterThan(0);
  36  | 
  37  |     for (let i = 0; i < count; i++) {
  38  |       const title = await bookCards.nth(i).locator('[data-testid="book-title"]').innerText();
  39  |       expect(title.toLowerCase()).toContain('cloud');
  40  |     }
  41  |   });
  42  | 
  43  |   // F1-T1-4: Search by author
  44  |   test('F1-T1-4: Searching for an author\'s name updates the grid with their books', async ({ page }) => {
  45  |     // Search for a specific author
  46  |     const searchInput = page.locator('[data-testid="search-input"]');
  47  |     await searchInput.fill('Martin Fowler');
  48  |     await page.waitForTimeout(300);
  49  | 
  50  |     const bookCards = page.locator('[data-testid="book-card"]');
  51  |     const count = await bookCards.count();
  52  |     expect(count).toBeGreaterThan(0);
  53  | 
  54  |     for (let i = 0; i < count; i++) {
  55  |       const author = await bookCards.nth(i).locator('[data-testid="book-author"]').innerText();
  56  |       expect(author.toLowerCase()).toContain('martin fowler');
  57  |     }
  58  |   });
  59  | 
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
```