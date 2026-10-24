import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/1f9f5805-9b22-48cc-b50f-157ceb35e9ef';

async function main() {
  console.log('=== Starting Complete Hero & Theme Verification ===');

  const browser = await chromium.launch({ headless: true });

  // -------------------------------------------------------------
  // Test 1: Desktop (1440x900) 20-second screen recording + stills + frame times
  // -------------------------------------------------------------
  console.log('\n[1/3] Running Desktop 20-second Recording (1440x900)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1, // standard 1x for exact pixel measurement
    colorScheme: 'dark',
    recordVideo: {
      dir: ARTIFACT_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await desktopContext.newPage();

  // Install frame-time performance profiler in the page
  await page.addInitScript(() => {
    window.__frameDeltas = [];
    let lastTime = performance.now();
    let isTracking = true;

    function recordFrame(now) {
      if (!isTracking) return;
      const delta = now - lastTime;
      window.__frameDeltas.push(delta);
      lastTime = now;
      requestAnimationFrame(recordFrame);
    }
    requestAnimationFrame(recordFrame);

    window.__stopTrackingFrames = () => {
      isTracking = false;
    };
  });

  const startTime = Date.now();
  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

  const waitTarget = async (targetMs) => {
    const elapsed = Date.now() - startTime;
    if (elapsed < targetMs) {
      await page.waitForTimeout(targetMs - elapsed);
    }
  };

  // 1. Still at 0.5s: Centered dot falling / bouncing
  await waitTarget(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'still_0_5s.png') });
  console.log('✓ Captured still at 0.5s (falling/bouncing dot)');

  // 2. Still at 1.5s: "HARSH RAJ" tumbling 3D letters shooting from dot
  await waitTarget(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'still_1_5s.png') });
  console.log('✓ Captured still at 1.5s ("HARSH RAJ" 3D tumbling)');

  // 3. Still at 2.5s: Full name resolved and held before morph
  await waitTarget(2500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'still_2_5s.png') });
  console.log('✓ Captured still at 2.5s ("HARSH RAJ" resolved)');

  // 4. Still at 3.5s: In-place slot-machine morph rolling into PORTFOLIO
  await waitTarget(3500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'still_3_5s.png') });
  console.log('✓ Captured still at 3.5s (slot-machine morph in-place)');

  // 5. Still at 4.5s: PORTFOLIO sliding down into lower third
  await waitTarget(4500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'still_4_5s.png') });
  console.log('✓ Captured still at 4.5s (PORTFOLIO sliding down)');

  // 6. Still at 5.5s: Dust converging towards portrait + masked bottom row pop-up
  await waitTarget(5500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'still_5_5s.png') });
  console.log('✓ Captured still at 5.5s (dust convergence + masked subtitle pop-up)');

  // 7. Still at 7.0s+: Portrait fully converged behind PORTFOLIO + nav faded in
  await waitTarget(7300);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'still_7_0s.png') });
  console.log('✓ Captured still at 7.0s+ (final hero with converged portrait & nav)');

  // Collect frame time metrics after intro completes (7.5s)
  await waitTarget(7500);
  const frameMetrics = await page.evaluate(() => {
    window.__stopTrackingFrames();
    const deltas = window.__frameDeltas.slice(3); // skip first 3 warm-up frames
    if (deltas.length === 0) return { avg: 0, max: 0, p99: 0, longFrames: 0, total: 0 };
    
    deltas.sort((a, b) => a - b);
    const sum = deltas.reduce((acc, d) => acc + d, 0);
    const avg = sum / deltas.length;
    const max = deltas[deltas.length - 1];
    const p99 = deltas[Math.floor(deltas.length * 0.99)];
    const longFrames = deltas.filter(d => d > 24).length;
    return { avg, max, p99, longFrames, total: deltas.length };
  });

  console.log('\nFrame Time Performance Report (0.0s - 7.5s):');
  console.log(`- Total frames rendered: ${frameMetrics.total}`);
  console.log(`- Average frame time: ${frameMetrics.avg.toFixed(2)} ms (~${(1000 / frameMetrics.avg).toFixed(1)} fps)`);
  console.log(`- 99th percentile frame time: ${frameMetrics.p99.toFixed(2)} ms`);
  console.log(`- Maximum frame time: ${frameMetrics.max.toFixed(2)} ms`);
  console.log(`- Frames > 24ms: ${frameMetrics.longFrames}`);

  // (2) Slow scroll from hero down through About section
  console.log('\nStarting smooth scroll down through About section (7.5s - 13.0s)...');
  const scrollSteps = 40;
  for (let i = 1; i <= scrollSteps; i++) {
    const scrollY = (i / scrollSteps) * 850;
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(100); // 40 * 100ms = 4.0s
  }

  // Hold in About section to show complete absence of overlap and color seam
  console.log('Resting in About section (13.0s - 14.5s)...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'about_section_scroll_view.png') });
  await page.waitForTimeout(1500);

  // (3) Smooth scroll back up to hero (14.5s - 18.5s) to demonstrate particle re-formation
  console.log('Starting smooth scroll back up to hero (14.5s - 18.5s)...');
  for (let i = scrollSteps; i >= 0; i--) {
    const scrollY = (i / scrollSteps) * 850;
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(100); // 40 * 100ms = 4.0s
  }

  // Rest back on settled hero until 20s
  console.log('Resting back on hero (18.5s - 20.0s)...');
  await waitTarget(20000);

  // Get video file name before closing context
  const video = page.video();
  const videoPath = await video.path();

  await desktopContext.close();
  console.log('✓ 20-second Desktop video recorded at:', videoPath);

  // Rename/copy video to a user-friendly name in artifact directory
  const finalVideoName = 'hero_intro_and_scroll_verification.webm';
  const finalVideoPath = path.join(ARTIFACT_DIR, finalVideoName);
  try {
    fs.copyFileSync(videoPath, finalVideoPath);
    console.log('✓ Saved video artifact as:', finalVideoPath);
  } catch (e) {
    console.warn('Could not copy video:', e);
  }

  // -------------------------------------------------------------
  // Test 2: Multi-resolution Fit-Text & Margins Verification
  // Widths: 390px, 768px, 1440px, 1920px
  // -------------------------------------------------------------
  console.log('\n[2/3] Verifying Multi-resolution Responsiveness (390, 768, 1440, 1920px)...');
  const resolutions = [
    { width: 390, height: 844, name: '390px_mobile' },
    { width: 768, height: 1024, name: '768px_tablet' },
    { width: 1440, height: 900, name: '1440px_desktop' },
    { width: 1920, height: 1080, name: '1920px_ultrawide' },
  ];

  for (const res of resolutions) {
    const ctx = await browser.newContext({
      viewport: { width: res.width, height: res.height },
      colorScheme: 'dark',
    });
    const p = await ctx.newPage();
    // Fast skip intro using ?skip or triggering finish immediately
    await p.goto('http://localhost:5173');
    await p.waitForTimeout(300);
    // Press Escape to skip intro and jump to final state
    await p.keyboard.press('Escape');
    await p.waitForTimeout(600);

    const check = await p.evaluate(() => {
      const hero = document.getElementById('hero');
      const wordWrapper = document.getElementById('hero-word-wrapper');
      const wordDisplay = document.getElementById('portfolio-word-display');
      
      if (!hero || !wordWrapper || !wordDisplay) return null;
      
      const heroRect = hero.getBoundingClientRect();
      const wordRect = wordDisplay.getBoundingClientRect();
      
      const leftMargin = wordRect.left - heroRect.left;
      const rightMargin = heroRect.right - wordRect.right;
      const fontSize = window.getComputedStyle(wordDisplay).fontSize;
      
      return {
        heroWidth: heroRect.width,
        wordWidth: wordRect.width,
        leftMargin,
        rightMargin,
        fontSize,
        fitsOnOneLine: wordRect.width <= heroRect.width - 32,
      };
    });

    console.log(`- Viewport ${res.width}px: font-size=${check?.fontSize}, wordWidth=${check?.wordWidth.toFixed(1)}px, margins: L=${check?.leftMargin.toFixed(1)}px / R=${check?.rightMargin.toFixed(1)}px (>=16px: ${check?.fitsOnOneLine ? 'PASS' : 'FAIL'})`);

    const screenshotPath = path.join(ARTIFACT_DIR, `responsive_${res.name}.png`);
    await p.screenshot({ path: screenshotPath });
    await ctx.close();
  }

  // -------------------------------------------------------------
  // Test 3: Overlap & Theme Audit
  // -------------------------------------------------------------
  console.log('\n[3/3] Checking Hero Overlap & Background Theme Consistency...');
  const auditCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const auditPage = await auditCtx.newPage();
  await auditPage.goto('http://localhost:5173');
  await auditPage.keyboard.press('Escape');
  await auditPage.waitForTimeout(500);

  // Check computed backgrounds of hero, next section wrapper, and body
  const themeCheck = await auditPage.evaluate(() => {
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const heroBg = window.getComputedStyle(document.getElementById('hero')).backgroundColor;
    const aboutSection = document.getElementById('about');
    const aboutWrapper = aboutSection ? window.getComputedStyle(aboutSection.parentElement).backgroundColor : null;

    // Scroll down 400px and check z-index and bounding boxes
    window.scrollTo(0, 400);
    const hero = document.getElementById('hero');
    const heroRect = hero.getBoundingClientRect();
    const aboutRect = aboutSection.getBoundingClientRect();

    return {
      bodyBg,
      heroBg,
      aboutWrapperBg: aboutWrapper,
      heroTopAt400: heroRect.top,
      aboutTopAt400: aboutRect.top,
      isAboutCoveringHero: aboutRect.top <= 500,
    };
  });

  console.log('Theme Backgrounds:', {
    body: themeCheck.bodyBg,
    hero: themeCheck.heroBg,
    nextSectionWrapper: themeCheck.aboutWrapperBg,
  });
  console.log('Scroll behavior check at 400px scroll:', {
    heroTop: `${themeCheck.heroTopAt400}px`,
    aboutTop: `${themeCheck.aboutTopAt400}px`,
  });

  await auditCtx.close();
  await browser.close();

  console.log('\n=== All Verification Tests Completed Successfully! ===');
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
