import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/login_page.png' });
    console.log('Screenshot saved to screenshots/login_page.png');

    const title = await page.textContent('h1');
    console.log('Page title:', title);

    if (title?.includes('The Drop')) {
      console.log('✅ UI Verification successful: "The Drop" found.');
    } else {
      console.log('❌ UI Verification failed: "The Drop" not found.');
    }
  } catch (err) {
    console.error('Error during UI verification:', err);
  } finally {
    await browser.close();
  }
})();
