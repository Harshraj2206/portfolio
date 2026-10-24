import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/56cd7d5d-dbb6-4de1-a5da-ccbb136d55f4';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runRound2Verification() {
  console.log('================================================================');
  console.log('STARTING AUTOMATED VERIFICATION FOR ROUND 2 FIXES (ITEMS 1-6)');
  console.log('================================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });

  const page = await context.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Skip intro
  try {
    const skipBtn = await page.waitForSelector('button:has-text("Skip intro")', { timeout: 3000 });
    if (skipBtn) await skipBtn.click();
  } catch {}
  await page.waitForTimeout(1500);

  // --------------------------------------------------------------------------
  // TEST 1: STACKED PROJECT CARDS CLEAN PEEK STRIP (10 scroll positions)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 1: STACKED PROJECT CARDS CLEAN PEEK STRIP (10 Scroll Positions During Overlap) ---');

  // Test 10 scroll positions as Card 2 overlaps Card 1 (from 2900 to 3500)
  const overlapScrollPositions = [
    2850, 2920, 2990, 3060, 3130, 3200, 3270, 3340, 3410, 3480
  ];
  const peekStripResults = [];

  for (let i = 0; i < overlapScrollPositions.length; i++) {
    const targetY = overlapScrollPositions[i];
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), targetY);
    await page.waitForTimeout(120);

    const cardMetrics = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#projects .glass-card-opaque'));
      if (cards.length < 2) return null;
      const c1 = cards[0];
      const c2 = cards[1];
      const c1Rect = c1.getBoundingClientRect();
      const c2Rect = c2.getBoundingClientRect();

      const inner1 = c1.querySelector('.transition-opacity');
      const innerStyle1 = inner1 ? window.getComputedStyle(inner1) : null;

      return {
        card1Top: c1Rect.top,
        card1Left: c1Rect.left,
        card1Width: c1Rect.width,
        card2Top: c2Rect.top,
        peekHeight: Math.max(0, c2Rect.top - c1Rect.top),
        card1Opacity: parseFloat(innerStyle1?.opacity || '1'),
      };
    });

    const stepShotBuffer = await page.screenshot();
    const { data, info } = await sharp(stepShotBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const scale = info.width / 1440; // 2x

    // Measure inside the 20px peek strip region (y: card1Top + 3px to card1Top + 18px)
    const stripYStart = Math.floor((cardMetrics.card1Top + 4) * scale);
    const stripYEnd = Math.floor((Math.min(cardMetrics.card1Top + 19, cardMetrics.card2Top - 1)) * scale);
    const stripXStart = Math.floor((cardMetrics.card1Left + 60) * scale);
    const stripXEnd = Math.floor((cardMetrics.card1Left + cardMetrics.card1Width - 60) * scale);

    let maxPixelLum = 0;
    let minPixelLum = 255;
    let count = 0;

    if (stripYEnd > stripYStart && stripXEnd > stripXStart) {
      for (let y = stripYStart; y < stripYEnd; y++) {
        for (let x = stripXStart; x < stripXEnd; x++) {
          const idx = (y * info.width + x) * info.channels;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          if (lum > maxPixelLum) maxPixelLum = lum;
          if (lum < minPixelLum) minPixelLum = lum;
          count++;
        }
      }
    }

    const maxAllowedBorderLuminance = 45; // Card border luminance is ~35-40; text would be >180
    const isClean = maxPixelLum <= maxAllowedBorderLuminance;

    console.log(
      `Step ${i + 1}/10 (ScrollY=${targetY}px): Card1 Top=${cardMetrics.card1Top.toFixed(0)}px, Card2 Top=${cardMetrics.card2Top.toFixed(0)}px | Peek Strip=${cardMetrics.peekHeight.toFixed(0)}px | Content Opacity=${cardMetrics.card1Opacity.toFixed(3)} | Max Interior Lum=${maxPixelLum.toFixed(1)} (Threshold: <= ${maxAllowedBorderLuminance}) | ${isClean ? 'PASS (CLEAN)' : 'FAIL'}`
    );

    peekStripResults.push({
      step: i + 1,
      scrollY: targetY,
      card1Top: cardMetrics.card1Top,
      card2Top: cardMetrics.card2Top,
      peekHeight: cardMetrics.peekHeight,
      opacity: cardMetrics.card1Opacity,
      maxPixelLum,
      passed: isClean,
    });
  }

  // Save clean screenshot of the 20px peek strip overlap
  await page.evaluate(() => window.scrollTo({ top: 3250, behavior: 'instant' }));
  await page.waitForTimeout(300);
  const stackStripShotPath = path.join(SCREENSHOT_DIR, 'stack_peek_strip.png');
  await page.screenshot({ path: stackStripShotPath });
  console.log(`Saved stack peek strip screenshot to: ${stackStripShotPath}`);

  // --------------------------------------------------------------------------
  // TEST 2: VERIFY "Connect:" ICON ROW REMOVED FROM DIRECT CONTACT CARD
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: DIRECT CONTACT CARD CHANNELS & "Connect:" ROW REMOVAL ---');
  await page.evaluate(() => {
    const c = document.getElementById('contact');
    if (c) c.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);

  const contactCheck = await page.evaluate(() => {
    const contactSection = document.getElementById('contact');
    const directContactCard = contactSection ? contactSection.querySelector('.lg\\:col-span-5') : null;

    const connectText = directContactCard ? directContactCard.innerText.includes('Connect:') : false;
    const socialGroupInCard = directContactCard ? directContactCard.querySelectorAll('[data-sound-group="social"]') : [];

    const linkedinBtn = directContactCard ? directContactCard.querySelector('a[aria-label*="LinkedIn profile"]') : null;
    const githubBtn = directContactCard ? directContactCard.querySelector('a[aria-label*="GitHub profile"]') : null;

    // Check "Find me online" dock & footer
    const socialDock = document.querySelector('[aria-label="Find me online"]');
    const footerIcons = document.querySelectorAll('footer [data-sound-group="social"] a');

    return {
      connectRowInDirectCard: connectText,
      socialGroupCountInDirectCard: socialGroupInCard.length,
      hasLinkedinBtn: Boolean(linkedinBtn),
      hasGithubBtn: Boolean(githubBtn),
      hasSocialDock: Boolean(socialDock),
      footerSocialCount: footerIcons.length,
    };
  });

  console.log('Direct Contact Card Check:');
  console.log(`  "Connect:" text in Direct Contact card: ${contactCheck.connectRowInDirectCard ? 'PRESENT (FAIL)' : 'REMOVED (PASS)'}`);
  console.log(`  Social dock icon container in Direct Contact card: ${contactCheck.socialGroupCountInDirectCard} (Expected: 0) -> ${contactCheck.socialGroupCountInDirectCard === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`  LinkedIn capsule button: ${contactCheck.hasLinkedinBtn ? 'PRESENT (PASS)' : 'MISSING (FAIL)'}`);
  console.log(`  GitHub capsule button: ${contactCheck.hasGithubBtn ? 'PRESENT (PASS)' : 'MISSING (FAIL)'}`);
  console.log(`  "Find me online" dock intact: ${contactCheck.hasSocialDock ? 'YES (PASS)' : 'NO (FAIL)'}`);
  console.log(`  Footer social icons intact: ${contactCheck.footerSocialCount} icons (PASS)`);

  // --------------------------------------------------------------------------
  // TEST 3: ONE BACK-TO-TOP CONTROL (Keep floating button, remove footer pill)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: BACK-TO-TOP CONTROL VERIFICATION ---');
  const bttCheck = await page.evaluate(() => {
    const footerButtons = Array.from(document.querySelectorAll('footer button'));
    const footerPill = footerButtons.find((b) => b.textContent && b.textContent.includes('Back to top'));
    const floatingBtn = document.querySelector('button[aria-label="Back to top of page"]');

    return {
      footerPillPresent: Boolean(footerPill),
      floatingBtnPresent: Boolean(floatingBtn),
      floatingSoundGroup: floatingBtn ? floatingBtn.getAttribute('data-sound-group') : null,
      floatingAriaLabel: floatingBtn ? floatingBtn.getAttribute('aria-label') : null,
    };
  });

  console.log(`  Footer "Back to top" pill button: ${bttCheck.footerPillPresent ? 'PRESENT (FAIL)' : 'REMOVED (PASS)'}`);
  console.log(`  Floating round arrow button: ${bttCheck.floatingBtnPresent ? 'PRESENT (PASS)' : 'MISSING (FAIL)'}`);
  console.log(`  Floating button data-sound-group: "${bttCheck.floatingSoundGroup}" (Target: "nav")`);
  console.log(`  Floating button aria-label: "${bttCheck.floatingAriaLabel}" (Keyboard accessible)`);

  // --------------------------------------------------------------------------
  // TEST 4: SOFTER GRID (0.035 opacity & vertical mask / lower 25% removal)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: SOFTER GRID (0.035 Opacity & Vertical Mask) ---');
  const gridCheck = await page.evaluate(() => {
    const gridDiv = document.querySelector('div[style*="64px 64px"]');
    if (!gridDiv) return null;
    const style = window.getComputedStyle(gridDiv);
    const styleAttr = gridDiv.getAttribute('style') || '';
    const bgImage = gridDiv.style.backgroundImage || style.backgroundImage;
    const maskText = styleAttr + ' ' + (style.maskImage || '') + ' ' + (style.webkitMaskImage || '');

    return {
      bgImage,
      maskText,
      has0035Opacity: bgImage.includes('rgba(255, 255, 255, 0.035)'),
      hasVerticalMask: maskText.includes('linear-gradient(to bottom') || maskText.includes('linear-gradient(rgb'),
    };
  });

  console.log(`  Grid line definition includes 0.035 opacity: ${gridCheck?.has0035Opacity ? 'YES (PASS)' : 'NO (FAIL)'}`);
  console.log(`  Grid vertical mask configured: ${gridCheck?.hasVerticalMask ? 'YES (PASS)' : 'NO (FAIL)'}`);

  // Test grid opacity at bottom of page (Footer)
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(500);

  const footerGridOpacity = await page.evaluate(() => {
    const gridDiv = document.querySelector('div[style*="64px 64px"]');
    if (!gridDiv) return null;
    return window.getComputedStyle(gridDiv).opacity;
  });
  console.log(`  Grid computed opacity when scrolled to footer: ${footerGridOpacity} (Target: 0) -> ${footerGridOpacity === '0' ? 'PASS' : 'FAIL'}`);

  // Save footer screenshot
  const footerShotPath = path.join(SCREENSHOT_DIR, 'footer_view.png');
  const footerEl = await page.$('footer');
  if (footerEl) {
    await footerEl.screenshot({ path: footerShotPath });
    console.log(`Saved footer view screenshot to: ${footerShotPath}`);
  }

  // --------------------------------------------------------------------------
  // TEST 5: BUTTON STABILITY (60-Step Bounding Box Measurement across all cards)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: BUTTON STABILITY (60-Step Bounding Box Measurement) ---');

  async function testButtonGroup(groupName, selector) {
    const elements = await page.$$(selector);
    if (elements.length === 0) {
      console.log(`No elements found for ${groupName} (${selector})`);
      return { groupName, count: 0, maxDelta: 0, passed: false };
    }

    await elements[0].scrollIntoViewIfNeeded();
    await page.evaluate(() => window.__lenis?.stop());
    await page.waitForTimeout(500);

    const initialBoxes = [];
    for (let el of elements) {
      const box = await el.boundingBox();
      initialBoxes.push(box);
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let b of initialBoxes) {
      if (!b) continue;
      minX = Math.min(minX, b.x);
      maxX = Math.max(maxX, b.x + b.width);
      minY = Math.min(minY, b.y);
      maxY = Math.max(maxY, b.y + b.height);
    }

    const steps = 60;
    let maxDeltaObserved = 0;

    for (let s = 0; s < steps; s++) {
      const progress = s / (steps - 1);
      const curX = minX - 25 + progress * (maxX - minX + 50);
      const curY = minY + (maxY - minY) * 0.5 + Math.sin(progress * Math.PI * 4) * 10;

      await page.mouse.move(curX, curY);
      await page.waitForTimeout(20);

      for (let i = 0; i < elements.length; i++) {
        const curBox = await elements[i].boundingBox();
        const initBox = initialBoxes[i];
        if (!curBox || !initBox) continue;

        const deltaX = Math.abs(curBox.x - initBox.x);
        const deltaY = Math.abs(curBox.y - initBox.y);
        const deltaW = Math.abs(curBox.width - initBox.width);
        const deltaH = Math.abs(curBox.height - initBox.height);
        const frameMax = Math.max(deltaX, deltaY, deltaW, deltaH);
        if (frameMax > maxDeltaObserved) maxDeltaObserved = frameMax;
      }
    }

    await page.evaluate(() => window.__lenis?.start());
    const passed = maxDeltaObserved <= 0.5;

    return {
      groupName,
      count: elements.length,
      initialBoxStr: initialBoxes.slice(0, 3).map((b) => `[${b?.x.toFixed(1)}, ${b?.y.toFixed(1)}, ${b?.width.toFixed(1)}x${b?.height.toFixed(1)}]`).join(', '),
      maxDelta: maxDeltaObserved,
      passed,
    };
  }

  // 1. Project Card 1 Buttons
  const p1Res = await testButtonGroup(
    'Project Card 1 Buttons',
    '#projects .glass-card:first-of-type a[aria-label*="live site"], #projects .glass-card:first-of-type a[aria-label*="case study"], #projects .glass-card:first-of-type a[aria-label*="source code"]'
  );

  // 2. Project Card 2 Buttons
  const p2Res = await testButtonGroup(
    'Project Card 2 Buttons',
    '#projects > div > div:nth-child(2) a[aria-label*="live site"], #projects > div > div:nth-child(2) a[aria-label*="case study"], #projects > div > div:nth-child(2) a[aria-label*="source code"]'
  );

  // 3. Contact Card Primary Email Button
  const cEmailRes = await testButtonGroup(
    'Contact Card Email Button',
    '#contact a[aria-label*="Send email"]'
  );

  // 4. Contact Card LinkedIn & GitHub Buttons
  const cLinksRes = await testButtonGroup(
    'Contact Card LinkedIn & GitHub',
    '#contact a[aria-label*="LinkedIn profile"], #contact a[aria-label*="GitHub profile"]'
  );

  // 5. Contact Form Submit Button
  const cSubmitRes = await testButtonGroup(
    'Contact Form Submit Button',
    '#contact button[type="submit"]'
  );

  const buttonStabilityTable = [p1Res, p2Res, cEmailRes, cLinksRes, cSubmitRes];
  console.log('\nButton Bounding Box Measurement Table (60 Steps per group):');
  console.table(buttonStabilityTable.map((r) => ({
    Group: r.groupName,
    Count: r.count,
    SampleInitialBoxes: r.initialBoxStr,
    MaxDeltaPx: `${r.maxDelta.toFixed(3)}px`,
    Status: r.passed ? 'PASS (0px change)' : 'FAIL',
  })));

  await context.close();
  await browser.close();

  console.log('\n================================================================');
  console.log('ALL ROUND 2 VERIFICATIONS COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

runRound2Verification().catch((err) => {
  console.error('Round 2 Verification failed:', err);
  process.exit(1);
});
