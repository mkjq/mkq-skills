import { test, expect } from '@playwright/test';

test.describe('Feature 3: API Endpoints & R2 Download', () => {
  // F3-T1-1: Get Books Metadata
  test('F3-T1-1: GET /api/books should return 200 and list the books', async ({ request }) => {
    const response = await request.get('/api/books');
    expect(response.status()).toBe(200);
    const books = await response.json();
    expect(Array.isArray(books)).toBe(true);
    expect(books.length).toBe(45);
  });

  // F3-T1-2: Metadata Schema check
  test('F3-T1-2: JSON schema of each book contains required properties', async ({ request }) => {
    const response = await request.get('/api/books');
    expect(response.status()).toBe(200);
    const books = await response.json();
    expect(books.length).toBeGreaterThan(0);
    
    for (const book of books) {
      expect(book).toHaveProperty('id');
      expect(book).toHaveProperty('title');
      expect(book).toHaveProperty('author');
      expect(book).toHaveProperty('category');
      expect(book).toHaveProperty('description');
      expect(book).toHaveProperty('fileKey');
      
      expect(typeof book.id).toBe('string');
      expect(typeof book.title).toBe('string');
      expect(typeof book.author).toBe('string');
      expect(typeof book.category).toBe('string');
      expect(typeof book.description).toBe('string');
      expect(typeof book.fileKey).toBe('string');
    }
  });

  // F3-T1-3: Download PDF Stream
  test('F3-T1-3: GET /api/books/download?key=... should return 200 with application/pdf content type', async ({ request }) => {
    // We fetch books to get a valid fileKey
    const booksResponse = await request.get('/api/books');
    expect(booksResponse.status()).toBe(200);
    const books = await booksResponse.json();
    expect(books.length).toBeGreaterThan(0);
    const validKey = books[0].fileKey;

    const response = await request.get(`/api/books/download?key=${encodeURIComponent(validKey)}`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
  });

  // F3-T1-4: Download Headers
  test('F3-T1-4: GET /api/books/download should return correct Content-Disposition and Cache-Control headers', async ({ request }) => {
    const booksResponse = await request.get('/api/books');
    expect(booksResponse.status()).toBe(200);
    const books = await booksResponse.json();
    expect(books.length).toBeGreaterThan(0);
    const validKey = books[0].fileKey;

    const response = await request.get(`/api/books/download?key=${encodeURIComponent(validKey)}`);
    expect(response.status()).toBe(200);
    
    const contentDisposition = response.headers()['content-disposition'];
    const cacheControl = response.headers()['cache-control'];
    
    expect(contentDisposition).toBeDefined();
    expect(contentDisposition).toContain('attachment;');
    expect(contentDisposition).toContain('filename="');
    
    expect(cacheControl).toBeDefined();
    expect(cacheControl).toContain('public');
    expect(cacheControl).toContain('max-age=');
  });

  // F3-T1-5: Trigger local download
  test('F3-T1-5: Clicking UI download button initiates direct stream fetching rather than external redirect', async ({ page }) => {
    await page.goto('/library');
    
    // Wait for the books to render and grab the first book card
    const bookCard = page.locator('[data-testid="book-card"]').first();
    await expect(bookCard).toBeVisible();

    const downloadButton = bookCard.locator('[data-testid="download-button"]');
    await expect(downloadButton).toBeVisible();

    // Listen for direct API stream download request
    const requestPromise = page.waitForRequest(req => req.url().includes('/api/books/download'));
    const downloadPromise = page.waitForEvent('download');

    await downloadButton.click();

    const req = await requestPromise;
    expect(req.url()).toContain('/api/books/download?key=');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  // F3-T2-1: Missing download key
  test('F3-T2-1: GET /api/books/download with no query parameters returns 400 Bad Request', async ({ request }) => {
    const response = await request.get('/api/books/download');
    expect(response.status()).toBe(400);
  });

  // F3-T2-2: Non-existent book download
  test('F3-T2-2: GET /api/books/download with non-existent key returns 404 Not Found', async ({ request }) => {
    const response = await request.get('/api/books/download?key=non-existent-key.pdf');
    expect(response.status()).toBe(404);
  });

  // F3-T2-3: Path traversal attempt
  test('F3-T2-3: GET /api/books/download with path traversal in key returns 400 or 403', async ({ request }) => {
    const response = await request.get('/api/books/download?key=../../etc/passwd');
    const status = response.status();
    expect([400, 403]).toContain(status);
  });

  // F3-T2-4: Unsupported HTTP methods
  test('F3-T2-4: POST or PUT to /api/books returns 405 Method Not Allowed', async ({ request }) => {
    const postResponse = await request.post('/api/books');
    expect(postResponse.status()).toBe(405);

    const putResponse = await request.put('/api/books');
    expect(putResponse.status()).toBe(405);
  });

  // F3-T2-5: R2 Connection Timeout
  test('F3-T2-5: Simulated R2 downstream failure returns 500 Internal Server Error', async ({ request }) => {
    // Send a query or header that flags simulated R2 connection/credentials failure
    const response = await request.get('/api/books/download?key=simulate-r2-failure', {
      headers: {
        'X-Simulate-R2-Failure': 'true'
      }
    });
    expect(response.status()).toBe(500);
  });
});
