import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/1f9f5805-9b22-48cc-b50f-157ceb35e9ef';
const STILLS_DIR = path.join(ARTIFACT_DIR, 'sequence_stills');

if (!fs.existsSync(STILLS_DIR)) {
  fs.mkdirSync(STILLS_DIR, { recursive: true });
}

async function main() {
  console.log('=== Starting Name Sequence Verification (0s to 8s, stills every 0.1s from 0s to 3.5s) ===');

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

  const consoleLogs = [];
  const assertionErrors = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error' || text.includes('Assertion') || text.includes('assert')) {
      assertionErrors.push(text);
      console.log('PAGE LOG:', text);
    }
  });

  // Clear storage so intro plays from beginning
  await page.addInitScript(() => {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch (e) {}
  });

  console.log('Navigating to http://localhost:5173...');
  const startTime = Date.now();
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

  // Generate timestamps every 0.1s from 0.0s to 3.5s (36 timestamps)
  const timestamps = [];
  for (let s = 0.0; s <= 3.501; s += 0.1) {
    timestamps.push(Math.round(s * 1000));
  }

  console.log(`Capturing ${timestamps.length} milestone stills every 0.1s from 0.0s to 3.5s...`);

  for (const targetMs of timestamps) {
    const elapsed = Date.now() - startTime;
    if (elapsed < targetMs) {
      await page.waitForTimeout(targetMs - elapsed);
    }
    const secStr = (targetMs / 1000).toFixed(1).replace('.', '_');
    const stillFilename = `still_${secStr}s.png`;
    const stillPath = path.join(STILLS_DIR, stillFilename);
    await page.screenshot({ path: stillPath });
  }

  // Also capture at key moments: 4.0s (HARSH RAJ resting), 5.5s (shuffle in progress), 7.0s and 8.0s (PORTFOLIO settled)
  const milestoneMoments = [4000, 5500, 7000, 8000];
  for (const targetMs of milestoneMoments) {
    const elapsed = Date.now() - startTime;
    if (elapsed < targetMs) {
      await page.waitForTimeout(targetMs - elapsed);
    }
    const secStr = (targetMs / 1000).toFixed(1).replace('.', '_');
    await page.screenshot({ path: path.join(STILLS_DIR, `still_${secStr}s.png`) });
  }

  // Inspect state of dot and slots in DOM at 8.0s
  const finalState = await page.evaluate(() => {
    const wordDisplay = document.getElementById('portfolio-word-display');
    const hero = document.getElementById('hero');
    const dot = wordDisplay ? wordDisplay.querySelector('.rounded-full.bg-white') : null;
    const allWhiteCircles = Array.from(document.querySelectorAll('*')).filter((el) => {
      const cls = el.className || '';
      return typeof cls === 'string' && cls.includes('rounded-full') && cls.includes('bg-white') && !cls.includes('sr-only');
    });

    const slots = wordDisplay ? Array.from(wordDisplay.querySelectorAll(':scope > div')) : [];
    const slotMetrics = slots.map((s, idx) => {
      const rect = s.getBoundingClientRect();
      const style = window.getComputedStyle(s);
      return {
        index: idx,
        width: Math.round(rect.width),
        inlineWidth: s.style.width,
        letterSpacing: style.letterSpacing,
      };
    });

    return {
      dotExists: !!dot,
      totalWhiteCirclesInHero: allWhiteCircles.length,
      slotMetrics,
    };
  });

  console.log('Final State at 8.0s:', JSON.stringify(finalState, null, 2));

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

  // Mobile Viewport Verification at 390px
  console.log('\n--- Verifying 390px Mobile Viewport ---');
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

  // Wait until full name is assembled (~3.5s)
  await mPage.waitForTimeout(3500);

  const mobileCheck = await mPage.evaluate(() => {
    const wordDisplay = document.getElementById('portfolio-word-display');
    const hero = document.getElementById('hero');
    if (!wordDisplay || !hero) return null;
    const slots = Array.from(wordDisplay.querySelectorAll(':scope > div'));
    const totalSlotsWidth = slots.reduce((acc, s) => acc + s.getBoundingClientRect().width, 0);
    const heroRect = hero.getBoundingClientRect();
    const firstSlotRect = slots[0]?.getBoundingClientRect();
    const lastSlotRect = slots[slots.length - 1]?.getBoundingClientRect();
    return {
      totalSlotsWidth: Math.round(totalSlotsWidth),
      heroWidth: heroRect.width,
      leftMargin: Math.round(firstSlotRect ? firstSlotRect.left - heroRect.left : 0),
      rightMargin: Math.round(lastSlotRect ? heroRect.right - lastSlotRect.right : 0),
      fontSize: window.getComputedStyle(wordDisplay).fontSize,
    };
  });

  console.log('Mobile Check at 3.5s ("HARSH RAJ"):', mobileCheck);
  await mPage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_harsh_raj_390.png') });

  // Wait until shuffle to PORTFOLIO completes (~7.0s)
  await mPage.waitForTimeout(3500);
  const mobilePortCheck = await mPage.evaluate(() => {
    const wordDisplay = document.getElementById('portfolio-word-display');
    const hero = document.getElementById('hero');
    if (!wordDisplay || !hero) return null;
    const slots = Array.from(wordDisplay.querySelectorAll(':scope > div'));
    const totalSlotsWidth = slots.reduce((acc, s) => acc + s.getBoundingClientRect().width, 0);
    const heroRect = hero.getBoundingClientRect();
    const firstSlotRect = slots[0]?.getBoundingClientRect();
    const lastSlotRect = slots[slots.length - 1]?.getBoundingClientRect();
    return {
      totalSlotsWidth: Math.round(totalSlotsWidth),
      heroWidth: heroRect.width,
      leftMargin: Math.round(firstSlotRect ? firstSlotRect.left - heroRect.left : 0),
      rightMargin: Math.round(lastSlotRect ? heroRect.right - lastSlotRect.right : 0),
      fontSize: window.getComputedStyle(wordDisplay).fontSize,
    };
  });

  console.log('Mobile Check at 7.0s ("PORTFOLIO"):', mobilePortCheck);
  await mPage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_portfolio_390.png') });

  await mobileCtx.close();
  await browser.close();

  console.log('\n=== All Verification Completed Successfully! ===');
  console.log('Total console assertion errors:', assertionErrors.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
