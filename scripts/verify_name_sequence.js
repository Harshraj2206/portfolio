import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/1f9f5805-9b22-48cc-b50f-157ceb35e9ef';
const STILLS_DIR = path.join(ARTIFACT_DIR, 'sequence_stills');

if (!fs.existsSync(STILLS_DIR)) {
  fs.mkdirSync(STILLS_DIR, { recursive: true });
}

async function main() {
  console.log('=== Starting Name Sequence Verification (0s to 8s) ===');

  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    recordVideo: {
      dir: ARTIFACT_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  // Clear storage
  await page.addInitScript(() => {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch (e) {}
  });

  console.log('Navigating to http://localhost:5173...');
  const startTime = Date.now();
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

  // Stills every 0.25s from 0.0s to 6.0s (total 25 keyframes)
  const timestamps = [];
  for (let s = 0.0; s <= 6.01; s += 0.25) {
    timestamps.push(Math.round(s * 1000));
  }

  console.log(`Capturing ${timestamps.length} milestone stills every 0.25s...`);

  for (const targetMs of timestamps) {
    const elapsed = Date.now() - startTime;
    if (elapsed < targetMs) {
      await page.waitForTimeout(targetMs - elapsed);
    }
    const secStr = (targetMs / 1000).toFixed(2).replace('.', '_');
    const stillFilename = `still_${secStr}s.png`;
    const stillPath = path.join(STILLS_DIR, stillFilename);
    await page.screenshot({ path: stillPath });
  }

  // Also capture at 7.0s and 8.0s to complete the 8-second recording
  const elapsedTo7 = Date.now() - startTime;
  if (elapsedTo7 < 7000) await page.waitForTimeout(7000 - elapsedTo7);
  await page.screenshot({ path: path.join(STILLS_DIR, 'still_7_00s.png') });

  const elapsedTo8 = Date.now() - startTime;
  if (elapsedTo8 < 8000) await page.waitForTimeout(8000 - elapsedTo8);
  await page.screenshot({ path: path.join(STILLS_DIR, 'still_8_00s.png') });

  // Inspect state of dot in DOM at 8.0s
  const dotCheck = await page.evaluate(() => {
    const dotInNameLine = document.querySelector('#portfolio-word-display div.w-\\[14px\\]');
    const all14pxDots = Array.from(document.querySelectorAll('*')).filter((el) => {
      const cls = el.className || '';
      return typeof cls === 'string' && cls.includes('w-[14px]');
    });
    return {
      dotExistsInNameLine: !!dotInNameLine,
      total14pxDotsInPage: all14pxDots.length,
    };
  });

  console.log('Dot Presence Check at 8.0s:', dotCheck);

  const video = page.video();
  const rawVideoPath = await video.path();

  await context.close();

  // Copy video to standardized artifact name
  const finalVideoPath = path.join(ARTIFACT_DIR, 'name_sequence_8s_recording.webm');
  try {
    fs.copyFileSync(rawVideoPath, finalVideoPath);
    console.log('✓ Saved 8-second video artifact to:', finalVideoPath);
  } catch (err) {
    console.warn('Could not copy video:', err);
  }

  // Responsive Check at 390px (Mobile)
  console.log('\nVerifying 390px Mobile Viewport...');
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: 'dark',
  });
  const mPage = await mobileCtx.newPage();
  await mPage.addInitScript(() => {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch (e) {}
  });
  await mPage.goto('http://localhost:5173');

  // Wait until full name is assembled at ~3.5s
  await mPage.waitForTimeout(3500);

  const mobileCheck = await mPage.evaluate(() => {
    const nameLine = document.getElementById('portfolio-word-display');
    const hero = document.getElementById('hero');
    if (!nameLine || !hero) return null;
    const slots = Array.from(nameLine.querySelectorAll(':scope > div'));
    const totalSlotsWidth = slots.reduce((acc, s) => acc + s.getBoundingClientRect().width, 0);
    const heroRect = hero.getBoundingClientRect();
    const firstSlotRect = slots[0]?.getBoundingClientRect();
    const lastSlotRect = slots[slots.length - 1]?.getBoundingClientRect();
    return {
      totalSlotsWidth: Math.round(totalSlotsWidth),
      heroWidth: heroRect.width,
      leftMargin: Math.round(firstSlotRect ? firstSlotRect.left - heroRect.left : 0),
      rightMargin: Math.round(lastSlotRect ? heroRect.right - lastSlotRect.right : 0),
      fontSize: window.getComputedStyle(nameLine).fontSize,
    };
  });

  console.log('Mobile Check at 3.5s ("HARSH RAJ"):', mobileCheck);
  await mPage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_harsh_raj_390.png') });

  // Wait until shuffle to PORTFOLIO lands and moves to bottom at ~6.5s
  await mPage.waitForTimeout(3000);
  const mobilePortCheck = await mPage.evaluate(() => {
    const nameLine = document.getElementById('portfolio-word-display');
    const hero = document.getElementById('hero');
    if (!nameLine || !hero) return null;
    const slots = Array.from(nameLine.querySelectorAll(':scope > div'));
    const totalSlotsWidth = slots.reduce((acc, s) => acc + s.getBoundingClientRect().width, 0);
    const heroRect = hero.getBoundingClientRect();
    const firstSlotRect = slots[0]?.getBoundingClientRect();
    const lastSlotRect = slots[slots.length - 1]?.getBoundingClientRect();
    return {
      totalSlotsWidth: Math.round(totalSlotsWidth),
      heroWidth: heroRect.width,
      leftMargin: Math.round(firstSlotRect ? firstSlotRect.left - heroRect.left : 0),
      rightMargin: Math.round(lastSlotRect ? heroRect.right - lastSlotRect.right : 0),
    };
  });

  console.log('Mobile Check at 6.5s ("PORTFOLIO"):', mobilePortCheck);
  await mPage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_portfolio_390.png') });

  await mobileCtx.close();
  await browser.close();

  console.log('=== All Verification Captures Completed! ===');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
