import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function captureScreenshots() {
  const artifactDir = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/fcb9ca49-a977-4248-9149-0572ae69e214/screenshots';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // 1. Screenshot during hero intro: sound button at top-right (opacity 0.7), skip button at bottom-right
  console.log('Capturing intro screenshot...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400); // Intro active
  await page.screenshot({ path: path.join(artifactDir, 'sound_button_intro.png') });

  // 2. Skip intro and capture post-intro caption
  console.log('Capturing post-intro caption screenshot...');
  const skipBtn = page.locator('button:has-text("Skip")');
  if (await skipBtn.count() > 0 && await skipBtn.isVisible()) {
    await skipBtn.click();
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: path.join(artifactDir, 'sound_button_caption.png') });

  // 3. Hover sound button to show tooltip
  console.log('Capturing sound button tooltip...');
  const soundBtn = page.locator('button[aria-label*="sound effects"]');
  await soundBtn.hover();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(artifactDir, 'sound_button_tooltip.png') });

  // 4. Click sound button to mute (shows VolumeX)
  console.log('Capturing muted sound button...');
  await soundBtn.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(artifactDir, 'sound_button_muted.png') });

  // 5. Navigate to Dev Sound Lab
  console.log('Capturing Dev Sound Lab...');
  await page.goto('http://localhost:5173/sound-lab', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'dev_sound_lab_top.png') });

  // Scroll down to group mapping rows
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(artifactDir, 'dev_sound_lab_groups.png') });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

captureScreenshots().catch((err) => {
  console.error(err);
  process.exit(1);
});
