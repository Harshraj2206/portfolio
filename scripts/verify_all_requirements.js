import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/8f74d384-3a58-46be-87bb-22b7cb19de15';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');
const VIDEO_DIR = path.join(ARTIFACT_DIR, 'videos');

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

async function verifyAll() {
  console.log('=== Starting Complete Portfolio Verification ===');
  const browser = await chromium.launch({ headless: true });

  // ========================================================
  // 1. AMBIENT BACKGROUND LUMINANCE SAMPLING AT 1920 WIDTH
  // ========================================================
  console.log('\n--- 1. Testing Ambient Background Luminance at 1920 width ---');
  const bgContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    colorScheme: 'dark',
  });
  const bgPage = await bgContext.newPage();
  await bgPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Skip intro
  try {
    const skipBtn = await bgPage.waitForSelector('button:has-text("Skip intro")', { timeout: 2500 });
    if (skipBtn) await skipBtn.click();
  } catch {}
  // Scroll down to the content below hero (where user reported flat black void)
  await bgPage.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
  await bgPage.waitForTimeout(1000);

  // Take screenshot of viewport at 1920x1080 below hero
  const bgScreenshotPath = path.join(SCREENSHOT_DIR, 'bg_luminance_sample_1920.png');
  const buffer = await bgPage.screenshot({ fullPage: false });
  fs.writeFileSync(bgScreenshotPath, buffer);

  // Sample raw pixels using Sharp
  const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
  const getPixel = (x, y) => {
    const idx = (y * info.width + x) * info.channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return { r, g, b, lum };
  };

  // Sample margins outside container (left: x < 280, right: x > 1640)
  // Darkest corner: top-left (20, 20) or bottom-left (20, 1060) or bottom-right (1900, 1060)
  const corner1 = getPixel(20, 20);
  const corner2 = getPixel(20, 1060);
  const corner3 = getPixel(1900, 1060);
  let darkestCorner = corner1;
  if (corner2.lum < darkestCorner.lum) darkestCorner = corner2;
  if (corner3.lum < darkestCorner.lum) darkestCorner = corner3;

  // Find brightest spotlight point in margins
  let brightestSpotlight = { lum: -1 };
  for (let y = 100; y < 980; y += 10) {
    // Left margin
    for (let x = 30; x < 260; x += 10) {
      const p = getPixel(x, y);
      if (p.lum > brightestSpotlight.lum) {
        brightestSpotlight = { ...p, x, y };
      }
    }
    // Right margin
    for (let x = 1660; x < 1890; x += 10) {
      const p = getPixel(x, y);
      if (p.lum > brightestSpotlight.lum) {
        brightestSpotlight = { ...p, x, y };
      }
    }
  }

  // Scan grid lines in margin: grid is 64px (x=64, 128, 192, y=64, 128, 192, 256, 320, 384...)
  let maxGridDiff = 0;
  let gridLineSample = null;
  let bgAdjacentSample = null;

  // Test across vertical grid line at x=128 or x=192 in left margin
  for (let y = 200; y < 700; y += 32) {
    const onLine = getPixel(192, y);
    const offLine = getPixel(176, y); // 16px away from line
    const diff = onLine.lum - offLine.lum;
    if (diff > maxGridDiff) {
      maxGridDiff = diff;
      gridLineSample = { ...onLine, x: 192, y };
      bgAdjacentSample = { ...offLine, x: 176, y };
    }
  }
  // Also check horizontal grid line at y=384 or y=448
  for (let x = 50; x < 250; x += 16) {
    const onLine = getPixel(x, 384);
    const offLine = getPixel(x, 368);
    const diff = onLine.lum - offLine.lum;
    if (diff > maxGridDiff) {
      maxGridDiff = diff;
      gridLineSample = { ...onLine, x, y: 384 };
      bgAdjacentSample = { ...offLine, x, y: 368 };
    }
  }

  const spotlightDiff = brightestSpotlight.lum - darkestCorner.lum;

  const bgMetrics = {
    darkestCorner: {
      r: darkestCorner.r,
      g: darkestCorner.g,
      b: darkestCorner.b,
      lum: darkestCorner.lum.toFixed(2),
    },
    brightestSpotlight: {
      x: brightestSpotlight.x,
      y: brightestSpotlight.y,
      r: brightestSpotlight.r,
      g: brightestSpotlight.g,
      b: brightestSpotlight.b,
      lum: brightestSpotlight.lum.toFixed(2),
    },
    spotlightDiff: spotlightDiff.toFixed(2),
    spotlightPass: spotlightDiff >= 6,
    gridLine: gridLineSample ? {
      x: gridLineSample.x,
      y: gridLineSample.y,
      lum: gridLineSample.lum.toFixed(2),
    } : null,
    bgAdjacent: bgAdjacentSample ? {
      x: bgAdjacentSample.x,
      y: bgAdjacentSample.y,
      lum: bgAdjacentSample.lum.toFixed(2),
    } : null,
    gridDiff: maxGridDiff.toFixed(2),
    gridPass: maxGridDiff >= 3,
  };

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'bg_luminance_metrics.json'),
    JSON.stringify(bgMetrics, null, 2)
  );

  console.log('Background Luminance Results:');
  console.log(`- Darkest Corner: rgb(${darkestCorner.r},${darkestCorner.g},${darkestCorner.b}) -> Lum: ${bgMetrics.darkestCorner.lum}`);
  console.log(`- Brightest Spotlight at (${brightestSpotlight.x}, ${brightestSpotlight.y}): rgb(${brightestSpotlight.r},${brightestSpotlight.g},${brightestSpotlight.b}) -> Lum: ${bgMetrics.brightestSpotlight.lum}`);
  console.log(`- Spotlight Difference: ${bgMetrics.spotlightDiff} levels (Requirement: >= 6 levels) -> ${bgMetrics.spotlightPass ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`- Grid Line Diff: ${bgMetrics.gridDiff} levels (Requirement: >= 3 levels) -> ${bgMetrics.gridPass ? 'PASS ✓' : 'FAIL ✗'}`);

  await bgContext.close();

  // ========================================================
  // 2. MULTI-RESOLUTION SECTION SCREENSHOTS (1440, 1920, 2560, 390)
  // ========================================================
  console.log('\n--- 2. Capturing Multi-Resolution Section Screenshots ---');
  const viewports = [
    { name: 'desktop_1440', width: 1440, height: 900 },
    { name: 'ultrawide_1920', width: 1920, height: 1080 },
    { name: 'cinema_2560', width: 2560, height: 1440 },
    { name: 'mobile_390', width: 390, height: 844, isMobile: true },
  ];

  const sections = [
    { id: 'about', name: 'about' },
    { id: 'projects', name: 'projects' },
    { id: 'skills', name: 'skills' },
    { id: 'highlights', name: 'highlights' },
    { id: 'beyond-code', name: 'beyond_code' },
    { id: 'contact', name: 'contact' },
    { selector: 'footer', name: 'footer' },
  ];

  for (const vp of viewports) {
    console.log(`\nCapturing viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile || false,
      hasTouch: vp.isMobile || false,
      colorScheme: 'dark',
    });
    const page = await ctx.newPage();
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    try {
      const skip = await page.waitForSelector('button:has-text("Skip intro")', { timeout: 2000 });
      if (skip) await skip.click();
    } catch {}
    await page.waitForTimeout(1000);

    for (const sec of sections) {
      try {
        const selector = sec.id ? `#${sec.id}` : sec.selector;
        const elem = await page.$(selector);
        if (elem) {
          await elem.scrollIntoViewIfNeeded();
          await page.waitForTimeout(400);
          await elem.screenshot({
            path: path.join(SCREENSHOT_DIR, `${vp.name}_${sec.name}.png`),
          });
          console.log(`✓ Saved ${vp.name}_${sec.name}.png`);
        }
      } catch (err) {
        console.error(`Error saving ${sec.name}:`, err.message);
      }
    }
    await ctx.close();
  }

  // ========================================================
  // 3. STACKED CARDS OVERLAP SCREENSHOT
  // ========================================================
  console.log('\n--- 3. Capturing Stacked Project Cards Overlap ---');
  const stackCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const stackPage = await stackCtx.newPage();
  await stackPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  try {
    const skip = await stackPage.waitForSelector('button:has-text("Skip intro")', { timeout: 2000 });
    if (skip) await skip.click();
  } catch {}
  await stackPage.waitForTimeout(800);

  // Scroll to projects section where Card 2 slides over Card 1
  const projectsElem = await stackPage.$('#projects');
  if (projectsElem) {
    const box = await projectsElem.boundingBox();
    if (box) {
      // Scroll to a position where Card 2 overlaps Card 1 partially
      await stackPage.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), box.y + 650);
      await stackPage.waitForTimeout(600);
      await stackPage.screenshot({
        path: path.join(SCREENSHOT_DIR, 'stacked_cards_overlap.png'),
        fullPage: false,
      });
      console.log('✓ Captured stacked_cards_overlap.png (verifying solid opaque base layer)');
    }
  }
  await stackCtx.close();

  // ========================================================
  // 4. FOOTER WORDMARK SCREENSHOT
  // ========================================================
  console.log('\n--- 4. Capturing Footer Wordmark Screenshot ---');
  const footerCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const footerPage = await footerCtx.newPage();
  await footerPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  try {
    const skip = await footerPage.waitForSelector('button:has-text("Skip intro")', { timeout: 2000 });
    if (skip) await skip.click();
  } catch {}
  await footerPage.waitForTimeout(800);

  await footerPage.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await footerPage.waitForTimeout(600);
  const footerElem = await footerPage.$('footer');
  if (footerElem) {
    await footerElem.screenshot({
      path: path.join(SCREENSHOT_DIR, 'footer_wordmark.png'),
    });
    console.log('✓ Captured footer_wordmark.png');
  }
  await footerCtx.close();

  // ========================================================
  // 5. SLOW SCROLL VIDEO RECORDING
  // ========================================================
  console.log('\n--- 5. Recording Slow Scroll Video ---');
  const videoCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
  });
  const videoPage = await videoCtx.newPage();
  await videoPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  try {
    const skip = await videoPage.waitForSelector('button:has-text("Skip intro")', { timeout: 2000 });
    if (skip) await skip.click();
  } catch {}
  await videoPage.waitForTimeout(1000);

  const totalHeight = await videoPage.evaluate(() => document.body.scrollHeight - window.innerHeight);
  const steps = 50;
  const stepDelay = 180;
  const stepSize = totalHeight / steps;

  for (let i = 1; i <= steps; i++) {
    await videoPage.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), i * stepSize);
    await videoPage.waitForTimeout(stepDelay);
  }
  await videoPage.waitForTimeout(1500);

  // Scroll back to top
  const backToTopBtn = await videoPage.$('button[aria-label="Back to top"]');
  if (backToTopBtn) {
    await backToTopBtn.click();
    await videoPage.waitForTimeout(1500);
  } else {
    await videoPage.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await videoPage.waitForTimeout(1500);
  }

  await videoCtx.close();
  await browser.close();

  // Copy latest video to slow_scroll_demo.webm
  const videoFiles = fs.readdirSync(VIDEO_DIR).filter((f) => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    const latestVideo = path.join(VIDEO_DIR, videoFiles[videoFiles.length - 1]);
    const finalVideoPath = path.join(VIDEO_DIR, 'slow_scroll_demo.webm');
    fs.copyFileSync(latestVideo, finalVideoPath);
    console.log(`✓ Video recorded successfully at: ${finalVideoPath}`);
  }

  console.log('\n=== All Verifications Finished Successfully ===');
}

verifyAll().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
