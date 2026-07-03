import { test, expect } from '@playwright/test';

test.describe('Sanity Check', () => {
  test('should load the homepage and display the main title', async ({ page }) => {
    // Go to homepage
    await page.goto('/');

    // Check that the title containing "الذكاء الاصطناعي" is visible
    const heading = page.locator('h1');
    await expect(heading).toContainText('الذكاء الاصطناعي');

    // Check that the badge is visible
    const badge = page.locator('text=تجربة كتابة مهارات بصرية مذهلة');
    await expect(badge).toBeVisible();
  });
});
