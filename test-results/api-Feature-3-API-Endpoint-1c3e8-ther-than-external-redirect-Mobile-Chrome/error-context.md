# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api.spec.ts >> Feature 3: API Endpoints & R2 Download >> F3-T1-5: Clicking UI download button initiates direct stream fetching rather than external redirect
- Location: tests\api.spec.ts:75:7

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
  3   | test.describe('Feature 3: API Endpoints & R2 Download', () => {
  4   |   // F3-T1-1: Get Books Metadata
  5   |   test('F3-T1-1: GET /api/books should return 200 and list the books', async ({ request }) => {
  6   |     const response = await request.get('/api/books');
  7   |     expect(response.status()).toBe(200);
  8   |     const books = await response.json();
  9   |     expect(Array.isArray(books)).toBe(true);
  10  |     expect(books.length).toBe(45);
  11  |   });
  12  | 
  13  |   // F3-T1-2: Metadata Schema check
  14  |   test('F3-T1-2: JSON schema of each book contains required properties', async ({ request }) => {
  15  |     const response = await request.get('/api/books');
  16  |     expect(response.status()).toBe(200);
  17  |     const books = await response.json();
  18  |     expect(books.length).toBeGreaterThan(0);
  19  |     
  20  |     for (const book of books) {
  21  |       expect(book).toHaveProperty('id');
  22  |       expect(book).toHaveProperty('title');
  23  |       expect(book).toHaveProperty('author');
  24  |       expect(book).toHaveProperty('category');
  25  |       expect(book).toHaveProperty('description');
  26  |       expect(book).toHaveProperty('fileKey');
  27  |       
  28  |       expect(typeof book.id).toBe('string');
  29  |       expect(typeof book.title).toBe('string');
  30  |       expect(typeof book.author).toBe('string');
  31  |       expect(typeof book.category).toBe('string');
  32  |       expect(typeof book.description).toBe('string');
  33  |       expect(typeof book.fileKey).toBe('string');
  34  |     }
  35  |   });
  36  | 
  37  |   // F3-T1-3: Download PDF Stream
  38  |   test('F3-T1-3: GET /api/books/download?key=... should return 200 with application/pdf content type', async ({ request }) => {
  39  |     // We fetch books to get a valid fileKey
  40  |     const booksResponse = await request.get('/api/books');
  41  |     expect(booksResponse.status()).toBe(200);
  42  |     const books = await booksResponse.json();
  43  |     expect(books.length).toBeGreaterThan(0);
  44  |     const validKey = books[0].fileKey;
  45  | 
  46  |     const response = await request.get(`/api/books/download?key=${encodeURIComponent(validKey)}`);
  47  |     expect(response.status()).toBe(200);
  48  |     expect(response.headers()['content-type']).toContain('application/pdf');
  49  |   });
  50  | 
  51  |   // F3-T1-4: Download Headers
  52  |   test('F3-T1-4: GET /api/books/download should return correct Content-Disposition and Cache-Control headers', async ({ request }) => {
  53  |     const booksResponse = await request.get('/api/books');
  54  |     expect(booksResponse.status()).toBe(200);
  55  |     const books = await booksResponse.json();
  56  |     expect(books.length).toBeGreaterThan(0);
  57  |     const validKey = books[0].fileKey;
  58  | 
  59  |     const response = await request.get(`/api/books/download?key=${encodeURIComponent(validKey)}`);
  60  |     expect(response.status()).toBe(200);
  61  |     
  62  |     const contentDisposition = response.headers()['content-disposition'];
  63  |     const cacheControl = response.headers()['cache-control'];
  64  |     
  65  |     expect(contentDisposition).toBeDefined();
  66  |     expect(contentDisposition).toContain('attachment;');
  67  |     expect(contentDisposition).toContain('filename="');
  68  |     
  69  |     expect(cacheControl).toBeDefined();
  70  |     expect(cacheControl).toContain('public');
  71  |     expect(cacheControl).toContain('max-age=');
  72  |   });
  73  | 
  74  |   // F3-T1-5: Trigger local download
  75  |   test('F3-T1-5: Clicking UI download button initiates direct stream fetching rather than external redirect', async ({ page }) => {
> 76  |     await page.goto('/library');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/library
  77  |     
  78  |     // Wait for the books to render and grab the first book card
  79  |     const bookCard = page.locator('[data-testid="book-card"]').first();
  80  |     await expect(bookCard).toBeVisible();
  81  | 
  82  |     const downloadButton = bookCard.locator('[data-testid="download-button"]');
  83  |     await expect(downloadButton).toBeVisible();
  84  | 
  85  |     // Listen for direct API stream download request
  86  |     const requestPromise = page.waitForRequest(req => req.url().includes('/api/books/download'));
  87  |     const downloadPromise = page.waitForEvent('download');
  88  | 
  89  |     await downloadButton.click();
  90  | 
  91  |     const req = await requestPromise;
  92  |     expect(req.url()).toContain('/api/books/download?key=');
  93  | 
  94  |     const download = await downloadPromise;
  95  |     expect(download.suggestedFilename()).toContain('.pdf');
  96  |   });
  97  | 
  98  |   // F3-T2-1: Missing download key
  99  |   test('F3-T2-1: GET /api/books/download with no query parameters returns 400 Bad Request', async ({ request }) => {
  100 |     const response = await request.get('/api/books/download');
  101 |     expect(response.status()).toBe(400);
  102 |   });
  103 | 
  104 |   // F3-T2-2: Non-existent book download
  105 |   test('F3-T2-2: GET /api/books/download with non-existent key returns 404 Not Found', async ({ request }) => {
  106 |     const response = await request.get('/api/books/download?key=non-existent-key.pdf');
  107 |     expect(response.status()).toBe(404);
  108 |   });
  109 | 
  110 |   // F3-T2-3: Path traversal attempt
  111 |   test('F3-T2-3: GET /api/books/download with path traversal in key returns 400 or 403', async ({ request }) => {
  112 |     const response = await request.get('/api/books/download?key=../../etc/passwd');
  113 |     const status = response.status();
  114 |     expect([400, 403]).toContain(status);
  115 |   });
  116 | 
  117 |   // F3-T2-4: Unsupported HTTP methods
  118 |   test('F3-T2-4: POST or PUT to /api/books returns 405 Method Not Allowed', async ({ request }) => {
  119 |     const postResponse = await request.post('/api/books');
  120 |     expect(postResponse.status()).toBe(405);
  121 | 
  122 |     const putResponse = await request.put('/api/books');
  123 |     expect(putResponse.status()).toBe(405);
  124 |   });
  125 | 
  126 |   // F3-T2-5: R2 Connection Timeout
  127 |   test('F3-T2-5: Simulated R2 downstream failure returns 500 Internal Server Error', async ({ request }) => {
  128 |     // Send a query or header that flags simulated R2 connection/credentials failure
  129 |     const response = await request.get('/api/books/download?key=simulate-r2-failure', {
  130 |       headers: {
  131 |         'X-Simulate-R2-Failure': 'true'
  132 |       }
  133 |     });
  134 |     expect(response.status()).toBe(500);
  135 |   });
  136 | });
  137 | 
```