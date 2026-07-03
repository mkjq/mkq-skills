# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: library.spec.ts >> Feature 1: Books Library Grid UI >> F1-T2-5: Selecting a category and then selecting "All" resets the list to exactly 45 books
- Location: tests\library.spec.ts:138:7

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
  3   | test.describe('Feature 1: Books Library Grid UI', () => {
  4   |   test.beforeEach(async ({ page }) => {
> 5   |     await page.goto('/library');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/library
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
  30  |     await searchInput.fill('Cloud');
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
```