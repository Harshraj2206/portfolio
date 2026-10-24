import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/8f74d384-3a58-46be-87bb-22b7cb19de15';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runVerification() {
  console.log('Starting Playwright verification across viewports...');
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'desktop_1440', width: 1440, height: 900 },
    { name: 'ultrawide_1920', width: 1920, height: 1080 },
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
    console.log(`\n=== Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ===`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile || false,
      hasTouch: vp.isMobile || false,
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // Skip intro if prompt or button appears
    try {
      const skipBtn = await page.waitForSelector('button:has-text("Skip intro")', { timeout: 2000 });
      if (skipBtn) {
        await skipBtn.click();
        await page.waitForTimeout(500);
      }
    } catch {
      // Intro might be skipped or already done
    }

    await page.waitForTimeout(1000);

    // Full page overview
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${vp.name}_full_overview.png`),
      fullPage: false,
    });

    // Capture each section
    for (const sec of sections) {
      try {
        const selector = sec.id ? `#${sec.id}` : sec.selector;
        const elem = await page.$(selector);
        if (elem) {
          await elem.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          await elem.screenshot({
            path: path.join(SCREENSHOT_DIR, `${vp.name}_${sec.name}.png`),
          });
          console.log(`✓ Captured ${vp.name}_${sec.name}.png`);
        } else {
          console.log(`✗ Selector ${selector} not found`);
        }
      } catch (err) {
        console.error(`Error capturing ${sec.name}:`, err.message);
      }
    }

    await context.close();
  }

  // ==========================================
  // SCROLL-FRAME PERFORMANCE TRACE
  // ==========================================
  console.log('\n=== Measuring Scroll Frame Times ===');
  const perfContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const perfPage = await perfContext.newPage();
  await perfPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  try {
    const skip = await perfPage.waitForSelector('button:has-text("Skip intro")', { timeout: 2000 });
    if (skip) await skip.click();
  } catch {}
  await perfPage.waitForTimeout(800);

  // In-browser performance measurement of requestAnimationFrame deltas during smooth scroll
  const scrollMetrics = await perfPage.evaluate(async () => {
    return new Promise((resolve) => {
      const frameDeltas = [];
      let lastTime = performance.now();
      let isScrolling = true;

      function onFrame(now) {
        const delta = now - lastTime;
        lastTime = now;
        frameDeltas.push(delta);

        if (isScrolling) {
          requestAnimationFrame(onFrame);
        } else {
          // Calculate stats
          // Drop the first 2 warmup frames
          const validFrames = frameDeltas.slice(2);
          const maxDelta = Math.max(...validFrames);
          const avgDelta = validFrames.reduce((a, b) => a + b, 0) / validFrames.length;
          const slowFrames = validFrames.filter((d) => d > 24);
          resolve({
            totalFrames: validFrames.length,
            maxFrameTimeMs: maxDelta,
            avgFrameTimeMs: avgDelta,
            slowFramesCount: slowFrames.length,
            slowFramesPct: ((slowFrames.length / validFrames.length) * 100).toFixed(2),
          });
        }
      }

      requestAnimationFrame(onFrame);

      // Perform a smooth scroll down over 3 seconds
      const totalScroll = document.body.scrollHeight - window.innerHeight;
      const startTime = performance.now();
      const scrollDuration = 3000;

      function doScroll() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / scrollDuration, 1);
        window.scrollTo(0, totalScroll * progress);

        if (progress < 1) {
          requestAnimationFrame(doScroll);
        } else {
          setTimeout(() => {
            isScrolling = false;
          }, 200);
        }
      }
      requestAnimationFrame(doScroll);
    });
  });

  console.log('\n--- Scroll Performance Results ---');
  console.log('Total Frames Measured:', scrollMetrics.totalFrames);
  console.log(`Max Frame Time: ${scrollMetrics.maxFrameTimeMs.toFixed(2)} ms`);
  console.log(`Average Frame Time: ${scrollMetrics.avgFrameTimeMs.toFixed(2)} ms (~${(1000 / scrollMetrics.avgFrameTimeMs).toFixed(1)} FPS)`);
  console.log(`Frames > 24ms: ${scrollMetrics.slowFramesCount} (${scrollMetrics.slowFramesPct}%)`);

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'scroll_metrics.json'),
    JSON.stringify(scrollMetrics, null, 2)
  );

  await perfContext.close();
  await browser.close();
  console.log('\nVerification captures and scroll profiling completed successfully.');
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
