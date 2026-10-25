import { chromium } from 'playwright';
import * as path from 'path';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);

  // Scroll to #beyond-code
  const section = page.locator('#beyond-code');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const outPath = path.resolve(process.cwd(), 'screenshots_verification/beyond_code_dev.png');
  await section.screenshot({ path: outPath });
  console.log('Screenshot saved to:', outPath);

  // Also verify links and attributes
  const photoBtn = page.locator('#beyond-code a[href="/photography"]');
  const artBtn = page.locator('#beyond-code a[href="/art-craft"]');
  const previewBadges = page.locator('#beyond-code span:has-text("Preview"), #beyond-code div:has-text("Preview")');

  console.log('Photography button visible:', await photoBtn.isVisible());
  console.log('Photography target:', await photoBtn.getAttribute('target'));
  console.log('Photography rel:', await photoBtn.getAttribute('rel'));
  console.log('Photography sound:', await photoBtn.getAttribute('data-sound'));
  console.log('Art & Craft button visible:', await artBtn.isVisible());
  console.log('Preview badges count:', await previewBadges.count());

  await browser.close();
}

capture().catch((err) => {
  console.error('Error capturing screenshot:', err);
  process.exit(1);
});
