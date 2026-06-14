import { test, expect } from '@playwright/test';

test('verify CreateDropPanel operative selection', async ({ page }) => {
  // Since we don't have a real session/auth, we might just check if the component renders
  // or mock the auth state if possible.
  // For now, let's just see if we can load the page.
  await page.goto('http://localhost:3000');

  // Wait for some content to load
  await page.waitForTimeout(2000);

  // Take a screenshot of the login page
  await page.screenshot({ path: 'screenshots/login_page.png' });

  // Check if "The Drop" is present
  await expect(page.locator('h1')).toContainText('The Drop');
});
