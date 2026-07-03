# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sanity.spec.ts >> Sanity Check >> should load the homepage and display the main title
- Location: tests\sanity.spec.ts:4:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

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
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Sanity Check', () => {
  4  |   test('should load the homepage and display the main title', async ({ page }) => {
  5  |     // Go to homepage
> 6  |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  7  | 
  8  |     // Check that the title containing "الذكاء الاصطناعي" is visible
  9  |     const heading = page.locator('h1');
  10 |     await expect(heading).toContainText('الذكاء الاصطناعي');
  11 | 
  12 |     // Check that the badge is visible
  13 |     const badge = page.locator('text=تجربة كتابة مهارات بصرية مذهلة');
  14 |     await expect(badge).toBeVisible();
  15 |   });
  16 | });
  17 | 
```