import { test, expect } from '@playwright/test';

test('CreateDropper page renders correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/create-dropper');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'create_dropper_initial.png' });
  const denied = await page.getByText('Access Denied').isVisible();
  if (denied) {
    console.log('Access Denied visible - Role protection active.');
  } else {
    console.log('Access Denied not visible - might be rendering or redirected.');
  }
});
