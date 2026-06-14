# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bolt_verify.spec.ts >> verify tactical map and markers
- Location: bolt_verify.spec.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('UAV_UPLINK_CONSOLE')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('UAV_UPLINK_CONSOLE')

```

```yaml
- text: SYSTEM OFFLINE Missing or invalid environment configuration Critical Errors
- list:
  - listitem: • VITE_SUPABASE_URL is missing
  - listitem: • VITE_SUPABASE_ANON_KEY is missing
- text: Warnings
- list:
  - listitem: • GEMINI_API_KEY is not set (AI features may be limited)
- button "COPY .env.local TEMPLATE"
- button "RETRY AFTER UPDATING .env.local"
- link "Open Supabase API Settings":
  - /url: https://supabase.com/dashboard/project/_/settings/api
- text: DROPPIN OPS • v1.0 • SECURE MODE
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test('verify tactical map and markers', async ({ page }) => {
  4  |   // Go to the map test page
  5  |   await page.goto('http://localhost:5173/map', { waitUntil: 'networkidle' });
  6  |
  7  |   // Wait longer for the map to be ready
  8  |   await page.waitForTimeout(5000);
  9  |
  10 |   // Take a screenshot to see what's happening
  11 |   await page.screenshot({ path: 'tactical-map-debug.png' });
  12 |
  13 |   // Check for HUD elements
> 14 |   await expect(page.getByText('UAV_UPLINK_CONSOLE')).toBeVisible();
     |                                                      ^ Error: expect(locator).toBeVisible() failed
  15 |
  16 |   // Check for the map container
  17 |   await expect(page.locator('.tactical-map')).toBeVisible();
  18 | });
  19 |
```