import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  console.log('--- Starting Add/Remove Live Test ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Initial state (no files in src/assets/photography)
  await page.goto('http://localhost:5173/photography');
  await page.waitForTimeout(1000); // Wait for page load or skip intro if button appears
  const skipBtn = await page.$('button:has-text("Skip intro")');
  if (skipBtn) {
    await skipBtn.click();
    await page.waitForTimeout(500);
  } else {
    await page.waitForTimeout(4500);
  }

  // Helper to query chips
  async function getChipStates() {
    const demoChip = await page.$('footer .badge-chip, footer span:has-text("Demo"), footer div:has-text("Demo")');
    const frameChip = await page.locator('footer div:has-text("frame"), footer span:has-text("frame")').first().textContent();
    const cardButtons = await page.$$('main button[aria-label*="Open frame"]');
    return {
      hasDemoChip: !!demoChip,
      frameText: frameChip?.trim() || '',
      cardCount: cardButtons.length,
    };
  }

  // 1. Initial State
  const state1 = await getChipStates();
  console.log(`[Initial State] Demo: ${state1.hasDemoChip}, Text: "${state1.frameText}", Card buttons: ${state1.cardCount}`);

  // 2. Add a test real image
  const testImgPath = path.resolve(process.cwd(), 'src/assets/photography/test_real_shot.png');
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  fs.writeFileSync(testImgPath, Buffer.from(base64Png, 'base64'));
  console.log('[Added File] Created src/assets/photography/test_real_shot.png');

  // Wait for Vite HMR (allow up to 3s)
  await page.waitForTimeout(3000);

  const state2 = await getChipStates();
  console.log(`[After Add] Demo: ${state2.hasDemoChip}, Text: "${state2.frameText}", Card buttons: ${state2.cardCount}`);

  // 3. Remove test file
  if (fs.existsSync(testImgPath)) {
    fs.unlinkSync(testImgPath);
    console.log('[Removed File] Deleted src/assets/photography/test_real_shot.png');
  }

  // Wait for Vite HMR
  await page.waitForTimeout(3000);

  const state3 = await getChipStates();
  console.log(`[After Removal] Demo: ${state3.hasDemoChip}, Text: "${state3.frameText}", Card buttons: ${state3.cardCount}`);

  if (!state3.hasDemoChip) {
    console.error('FAIL: Demo chip should be restored!');
    process.exit(1);
  }

  // Check frame count text specifically
  const finalFrameChipText = await page.locator('footer div:has-text("frame")').last().textContent();
  console.log(`[Verified Frame Count] "${finalFrameChipText?.trim()}"`);

  await browser.close();
  console.log('--- Add/Remove Live Test Completed Successfully ---');
}

run().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
