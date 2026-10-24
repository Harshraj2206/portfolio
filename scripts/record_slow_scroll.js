import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/8f74d384-3a58-46be-87bb-22b7cb19de15';
const VIDEO_DIR = path.join(ARTIFACT_DIR, 'videos');

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

async function recordScroll() {
  console.log('Starting Playwright session to record slow scroll video...');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Dismiss intro if skip button is available
  try {
    const skipBtn = await page.waitForSelector('button:has-text("Skip intro")', { timeout: 2500 });
    if (skipBtn) {
      await skipBtn.click();
      console.log('Skipped intro');
    }
  } catch {}

  await page.waitForTimeout(1500);

  // Smooth slow scroll down through each section
  const totalHeight = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
  const steps = 60;
  const stepDelay = 200; // Total scroll time ~12 seconds
  const stepSize = totalHeight / steps;

  console.log(`Scrolling ${totalHeight}px across ${steps} steps...`);
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), i * stepSize);
    await page.waitForTimeout(stepDelay);
  }

  // Pause at the bottom to view footer & wordmark
  await page.waitForTimeout(2000);

  // Click back to top
  const backToTopBtn = await page.$('button[aria-label="Back to top"]');
  if (backToTopBtn) {
    console.log('Clicking Back to top...');
    await backToTopBtn.click();
    await page.waitForTimeout(2000);
  } else {
    // Scroll back to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
  }

  // Close context to finish video writing
  await context.close();
  await browser.close();

  // Find the generated video file and rename/report
  const videoFiles = fs.readdirSync(VIDEO_DIR).filter((f) => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    const latestVideo = path.join(VIDEO_DIR, videoFiles[videoFiles.length - 1]);
    const finalVideoPath = path.join(VIDEO_DIR, 'slow_scroll_demo.webm');
    fs.copyFileSync(latestVideo, finalVideoPath);
    console.log(`Video saved successfully at: ${finalVideoPath}`);
  }
}

recordScroll().catch((err) => {
  console.error('Recording failed:', err);
  process.exit(1);
});
