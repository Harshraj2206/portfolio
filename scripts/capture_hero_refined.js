import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/1f9f5805-9b22-48cc-b50f-157ceb35e9ef';

async function main() {
  console.log('Capturing refined hero at 1440px, 1920px, 390px and zoomed face...');
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop 1440x900
  console.log('Capturing 1440x900...');
  const ctx1440 = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });
  const page1440 = await ctx1440.newPage();
  await page1440.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page1440.evaluate(() => document.documentElement.classList.add('dark'));
  await page1440.waitForTimeout(1000);

  const hero1440Path = path.join(ARTIFACT_DIR, 'hero_1440_refined.png');
  await page1440.screenshot({
    path: hero1440Path,
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  });
  console.log('Saved:', hero1440Path);

  // Zoomed-in face crop on 1440px
  const imgLocator = page1440.locator('img[alt="Harsh Raj, CSE (AI & ML) student"]');
  const imgBox = await imgLocator.boundingBox();
  console.log('Image Bounding Box on 1440:', imgBox);

  if (imgBox) {
    const faceClip = {
      x: Math.max(0, imgBox.x + imgBox.width * 0.15),
      y: Math.max(0, imgBox.y + imgBox.height * 0.05),
      width: imgBox.width * 0.65,
      height: imgBox.height * 0.65,
    };
    const faceZoomPath = path.join(ARTIFACT_DIR, 'hero_face_zoom_refined.png');
    await page1440.screenshot({
      path: faceZoomPath,
      clip: faceClip,
    });
    console.log('Saved Face Zoom:', faceZoomPath);
  }

  await ctx1440.close();

  // 2. Desktop 1920x1080
  console.log('Capturing 1920x1080...');
  const ctx1920 = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });
  const page1920 = await ctx1920.newPage();
  await page1920.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page1920.evaluate(() => document.documentElement.classList.add('dark'));
  await page1920.waitForTimeout(1000);

  const hero1920Path = path.join(ARTIFACT_DIR, 'hero_1920_refined.png');
  await page1920.screenshot({
    path: hero1920Path,
    clip: { x: 0, y: 0, width: 1920, height: 1080 },
  });
  console.log('Saved:', hero1920Path);
  await ctx1920.close();

  // 3. Mobile 390x844
  console.log('Capturing 390x844...');
  const ctx390 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
  });
  const page390 = await ctx390.newPage();
  await page390.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page390.evaluate(() => document.documentElement.classList.add('dark'));
  await page390.waitForTimeout(1000);

  const hero390Path = path.join(ARTIFACT_DIR, 'hero_390_refined.png');
  await page390.screenshot({
    path: hero390Path,
    fullPage: false,
  });
  console.log('Saved:', hero390Path);
  await ctx390.close();

  await browser.close();
  console.log('All refined screenshots captured successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
