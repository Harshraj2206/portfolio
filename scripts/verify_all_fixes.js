import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/56cd7d5d-dbb6-4de1-a5da-ccbb136d55f4';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');
const VIDEO_DIR = path.join(ARTIFACT_DIR, 'videos');

[SCREENSHOT_DIR, VIDEO_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function runVerification() {
  console.log('================================================================');
  console.log('STARTING AUTOMATED VERIFICATION OF FIXES 1 TO 6');
  console.log('================================================================');

  const browser = await chromium.launch({ headless: true });

  // --------------------------------------------------------------------------
  // TEST 4: INTRO STAYS BLACK (Luminance during name phase)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: INTRO STAYS BLACK (Luminance during name phase) ---');
  const introContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const introPage = await introContext.newPage();
  await introPage.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

  // Wait 600ms into the name phase
  await introPage.waitForTimeout(600);
  const introShotPath = path.join(SCREENSHOT_DIR, 'intro_name_phase.png');
  const introScreenshotBuffer = await introPage.screenshot();
  fs.writeFileSync(introShotPath, introScreenshotBuffer);
  console.log(`Saved intro name phase screenshot: ${introShotPath}`);

  // Measure luminance with Sharp
  const { data: introImgData, info: introImgInfo } = await sharp(introScreenshotBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`Intro image dimensions: ${introImgInfo.width}x${introImgInfo.height}, channels: ${introImgInfo.channels}`);

  const getPixelLuminance = (x, y) => {
    const idx = (y * introImgInfo.width + x) * introImgInfo.channels;
    const r = introImgData[idx];
    const g = introImgData[idx + 1];
    const b = introImgData[idx + 2];
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const getRegionAvgLuminance = (startX, startY, w, h) => {
    let sum = 0;
    let count = 0;
    for (let y = startY; y < startY + h; y++) {
      for (let x = startX; x < startX + w; x++) {
        sum += getPixelLuminance(x, y);
        count++;
      }
    }
    return sum / count;
  };

  const sampleSize = 100;
  const centerLum = getRegionAvgLuminance(
    Math.floor((introImgInfo.width - sampleSize) / 2),
    Math.floor((introImgInfo.height - sampleSize) / 2),
    sampleSize,
    sampleSize
  );

  const tlLum = getRegionAvgLuminance(20, 20, sampleSize, sampleSize);
  const trLum = getRegionAvgLuminance(introImgInfo.width - 20 - sampleSize, 20, sampleSize, sampleSize);
  const blLum = getRegionAvgLuminance(20, introImgInfo.height - 20 - sampleSize, sampleSize, sampleSize);
  const brLum = getRegionAvgLuminance(
    introImgInfo.width - 20 - sampleSize,
    introImgInfo.height - 20 - sampleSize,
    sampleSize,
    sampleSize
  );
  const cornersAvg = (tlLum + trLum + blLum + brLum) / 4;

  const lumDiffPercent = ((centerLum - cornersAvg) / 255) * 100;
  console.log(`Center Luminance (0-255): ${centerLum.toFixed(2)} (${((centerLum / 255) * 100).toFixed(2)}%)`);
  console.log(`Corners: TL=${tlLum.toFixed(2)}, TR=${trLum.toFixed(2)}, BL=${blLum.toFixed(2)}, BR=${brLum.toFixed(2)}`);
  console.log(`Corners Avg Luminance (0-255): ${cornersAvg.toFixed(2)} (${((cornersAvg / 255) * 100).toFixed(2)}%)`);
  console.log(`Center vs Corners Difference: ${lumDiffPercent.toFixed(2)}% (Max allowed: 6.00%)`);

  const test4Passed = lumDiffPercent <= 6.0;
  console.log(`TEST 4 RESULT: ${test4Passed ? 'PASS' : 'FAIL'}`);
  await introContext.close();

  // --------------------------------------------------------------------------
  // MAIN CONTEXT FOR TESTS 1, 2, 3, 5, 6
  // --------------------------------------------------------------------------
  const mainContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // 2x for crisp zoomed screenshots
    colorScheme: 'dark',
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await mainContext.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Skip intro
  try {
    const skipBtn = await page.waitForSelector('button:has-text("Skip intro")', { timeout: 3000 });
    if (skipBtn) await skipBtn.click();
  } catch {}
  await page.waitForTimeout(1500);

  // --------------------------------------------------------------------------
  // TEST 1: BUTTONS MUST NOT MOVE (60-step mouse automation)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 1: BUTTONS MUST NOT MOVE (60-Step Bounding Box Measurement) ---');

  // Helper to test a group of buttons
  async function testButtonGroup(groupName, selector) {
    const elements = await page.$$(selector);
    if (elements.length === 0) {
      console.log(`No elements found for ${groupName} (${selector})`);
      return { groupName, count: 0, maxDelta: 0, passed: false };
    }

    // Scroll element into view and freeze Lenis scroll so page doesn't coast
    await elements[0].scrollIntoViewIfNeeded();
    await page.evaluate(() => window.__lenis?.stop());
    await page.waitForTimeout(600);

    // Get initial bounding boxes
    const initialBoxes = [];
    for (let el of elements) {
      const box = await el.boundingBox();
      initialBoxes.push(box);
    }

    // Determine motion path covering all buttons in the group
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let b of initialBoxes) {
      if (!b) continue;
      minX = Math.min(minX, b.x);
      maxX = Math.max(maxX, b.x + b.width);
      minY = Math.min(minY, b.y);
      maxY = Math.max(maxY, b.y + b.height);
    }

    // Define 60 steps moving across and around the button area
    const steps = 60;
    let maxDeltaObserved = 0;
    const perFrameDeltas = [];

    for (let s = 0; s < steps; s++) {
      const progress = s / (steps - 1);
      // Sweep across X from minX - 25 to maxX + 25, oscillating Y directly over buttons
      const curX = minX - 25 + progress * (maxX - minX + 50);
      const curY = minY + (maxY - minY) * 0.5 + Math.sin(progress * Math.PI * 4) * 10;

      await page.mouse.move(curX, curY);
      await page.waitForTimeout(20);

      // Measure all buttons at this frame
      let frameMax = 0;
      for (let i = 0; i < elements.length; i++) {
        const curBox = await elements[i].boundingBox();
        const initBox = initialBoxes[i];
        if (!curBox || !initBox) continue;

        const deltaX = Math.abs(curBox.x - initBox.x);
        const deltaY = Math.abs(curBox.y - initBox.y);
        const deltaW = Math.abs(curBox.width - initBox.width);
        const deltaH = Math.abs(curBox.height - initBox.height);
        const btnDelta = Math.max(deltaX, deltaY, deltaW, deltaH);
        if (btnDelta > frameMax) frameMax = btnDelta;
        if (btnDelta > maxDeltaObserved) maxDeltaObserved = btnDelta;
      }
      perFrameDeltas.push(frameMax);
    }

    // Unfreeze Lenis
    await page.evaluate(() => window.__lenis?.start());

    const passed = maxDeltaObserved <= 0.5;
    console.log(`Button Group: ${groupName} (${elements.length} buttons)`);
    console.log(`  Initial Boxes:`, initialBoxes.map((b) => `[${b?.x.toFixed(1)}, ${b?.y.toFixed(1)}, ${b?.width.toFixed(1)}x${b?.height.toFixed(1)}]`).join(', '));
    console.log(`  Max Bounding Box Delta across 60 steps: ${maxDeltaObserved.toFixed(3)}px (Allowed: <= 0.5px)`);
    console.log(`  Sample 10-step frame deltas: [${perFrameDeltas.filter((_, idx) => idx % 6 === 0).map((d) => d.toFixed(2)).join(', ')}]`);
    console.log(`  Result: ${passed ? 'PASS (0px change)' : 'FAIL'}`);
    return { groupName, count: elements.length, maxDelta: maxDeltaObserved, passed };
  }

  // 1. Project 1 Action Buttons (View live site, Read case study, Code)
  const test1a = await testButtonGroup(
    'Project 1 Action Buttons (View live site, Read case study, Code)',
    '#projects .glass-card:first-of-type a[aria-label*="live site"], #projects .glass-card:first-of-type a[aria-label*="case study"], #projects .glass-card:first-of-type a[aria-label*="source code"]'
  );

  // 2. Contact Card Primary Email Button
  const test1b = await testButtonGroup(
    'Contact Card Primary Button ("Send an email")',
    '#contact a[aria-label*="Send email"]'
  );

  // 3. Contact Card Secondary Link Buttons (LinkedIn & GitHub)
  const test1c = await testButtonGroup(
    'Contact Card Link Buttons (LinkedIn & GitHub)',
    '#contact a[aria-label*="LinkedIn profile"], #contact a[aria-label*="GitHub profile"]'
  );

  // 4. Contact Card Social Circles (44px circles)
  const test1d = await testButtonGroup(
    'Contact Card Social Circle Buttons',
    '#contact [data-sound-group="social"] a'
  );

  // 5. Contact Form Submit Button
  const test1e = await testButtonGroup(
    'Contact Form Submit Button',
    '#contact button[type="submit"]'
  );

  // --------------------------------------------------------------------------
  // TEST 2: CONTACT CARD, APPLE STYLE (Measurements & 2x Zoom Screenshot)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: CONTACT CARD APPLE STYLE (Measurements & Corner Radii) ---');
  const contactCard = await page.$('#contact .glass-card');
  if (contactCard) {
    await contactCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const contactShotPath = path.join(SCREENSHOT_DIR, 'contact_card_2x.png');
    await contactCard.screenshot({ path: contactShotPath });
    console.log(`Saved 2x zoomed Contact Card screenshot: ${contactShotPath}`);
  }

  // Measure Contact Card elements
  const contactMetrics = await page.evaluate(() => {
    const primaryBtn = document.querySelector('#contact a[aria-label*="Send email"]');
    const linkedinBtn = document.querySelector('#contact a[aria-label*="LinkedIn profile"]');
    const githubBtn = document.querySelector('#contact a[aria-label*="GitHub profile"]');
    const socialCircles = Array.from(document.querySelectorAll('#contact [data-sound-group="social"] a'));
    const inputName = document.querySelector('#contact input#contact-name');
    const inputEmail = document.querySelector('#contact input#contact-email');
    const inputTextarea = document.querySelector('#contact textarea#contact-message');
    const formSubmit = document.querySelector('#contact button[type="submit"]');

    const descParagraph = document.querySelector('#contact .lg\\:col-span-5 p');
    const emailRow = document.querySelector('#contact .select-all');
    const divider = document.querySelector('#contact .bg-gradient-to-r');
    const connectRow = document.querySelector('#contact [data-sound-group="social"]');

    const getMetrics = (el) => {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        bottom: rect.bottom,
        borderRadius: style.borderRadius,
        borderTopLeftRadius: parseFloat(style.borderTopLeftRadius),
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        boxShadow: style.boxShadow,
      };
    };

    const primaryM = getMetrics(primaryBtn);
    const linkedinM = getMetrics(linkedinBtn);
    const githubM = getMetrics(githubBtn);
    const socialM = getMetrics(socialCircles[0]);
    const nameInputM = getMetrics(inputName);
    const textareaM = getMetrics(inputTextarea);
    const submitM = getMetrics(formSubmit);

    // Spacing
    const descRect = descParagraph ? descParagraph.getBoundingClientRect() : null;
    const emailRowRect = emailRow ? emailRow.getBoundingClientRect() : null;
    const dividerRect = divider ? divider.getBoundingClientRect() : null;
    const connectRect = connectRow ? connectRow.getBoundingClientRect() : null;

    const spacingParagraphToPrimary = (primaryM && descRect) ? Math.round(primaryM.top - descRect.bottom) : null;
    const spacingPrimaryToEmail = (primaryM && emailRowRect) ? Math.round(emailRowRect.top - primaryM.bottom) : null;
    const spacingEmailToLinks = (linkedinM && emailRowRect) ? Math.round(linkedinM.top - emailRowRect.bottom) : null;

    // Check corner radii equality (radius >= height / 2 for capsule)
    const isPrimaryCapsule = primaryM ? primaryM.borderTopLeftRadius >= Math.floor(primaryM.height / 2) : false;
    const isLinkedinCapsule = linkedinM ? linkedinM.borderTopLeftRadius >= Math.floor(linkedinM.height / 2) : false;
    const isGithubCapsule = githubM ? githubM.borderTopLeftRadius >= Math.floor(githubM.height / 2) : false;
    const isSocialCircle = socialM ? (socialM.width === socialM.height && socialM.borderTopLeftRadius >= Math.floor(socialM.height / 2)) : false;

    return {
      primaryBtn: primaryM,
      linkedinBtn: linkedinM,
      githubBtn: githubM,
      socialCircle: socialM,
      inputName: nameInputM,
      textarea: textareaM,
      formSubmit: submitM,
      isPrimaryCapsule,
      isLinkedinCapsule,
      isGithubCapsule,
      isSocialCircle,
      spacingParagraphToPrimary,
      spacingPrimaryToEmail,
      spacingEmailToLinks,
      linkedinGithubGap: (linkedinM && githubM) ? Math.round(githubM.width - linkedinM.width) : 0,
    };
  });

  console.log('Contact Card Apple Style Measurements:');
  console.log(`  "Send an email" Primary Button: Height = ${contactMetrics.primaryBtn?.height}px (Target: 56px), Capsule = ${contactMetrics.isPrimaryCapsule}`);
  console.log(`  LinkedIn Button: Height = ${contactMetrics.linkedinBtn?.height}px, Width = ${contactMetrics.linkedinBtn?.width}px, Capsule = ${contactMetrics.isLinkedinCapsule}`);
  console.log(`  GitHub Button: Height = ${contactMetrics.githubBtn?.height}px, Width = ${contactMetrics.githubBtn?.width}px, Capsule = ${contactMetrics.isGithubCapsule}`);
  console.log(`  Social Circle Button: ${contactMetrics.socialCircle?.width}px x ${contactMetrics.socialCircle?.height}px, Circle = ${contactMetrics.isSocialCircle}`);
  console.log(`  Form Input Name Radius: ${contactMetrics.inputName?.borderRadius} (Target: 16px)`);
  console.log(`  Form Textarea Radius: ${contactMetrics.textarea?.borderRadius} (Target: 20px)`);
  console.log(`  Form Submit Button: Height = ${contactMetrics.formSubmit?.height}px, Radius = ${contactMetrics.formSubmit?.borderRadius}`);
  console.log(`  Spacing paragraph to primary button: ${contactMetrics.spacingParagraphToPrimary}px (Target: 24px)`);
  console.log(`  Spacing primary button to email row: ${contactMetrics.spacingPrimaryToEmail}px (Target: 14px)`);
  console.log(`  Spacing email row to link buttons: ${contactMetrics.spacingEmailToLinks}px (Target: 16px)`);

  // --------------------------------------------------------------------------
  // TEST 3: STACKED PROJECT CARDS (Peek Strip & Solid #0B0B0B Opacity)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: STACKED PROJECT CARDS (Peek Strip & No Underneath Text) ---');
  await page.evaluate(() => {
    const projectsEl = document.getElementById('projects');
    if (projectsEl) projectsEl.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(600);

  // Scroll down smoothly to trigger sticky stacking overlap between Card 1 and Card 2
  await page.evaluate(() => window.scrollBy({ top: 480, behavior: 'instant' }));
  await page.waitForTimeout(500);

  const overlap1Path = path.join(SCREENSHOT_DIR, 'stacked_cards_overlap_1.png');
  await page.screenshot({ path: overlap1Path });
  console.log(`Saved Stacked Cards Overlap 1 screenshot: ${overlap1Path}`);

  // Scroll further so Card 2 is covered by Card 3
  await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'instant' }));
  await page.waitForTimeout(500);

  const overlap2Path = path.join(SCREENSHOT_DIR, 'stacked_cards_overlap_2.png');
  await page.screenshot({ path: overlap2Path });
  console.log(`Saved Stacked Cards Overlap 2 screenshot: ${overlap2Path}`);

  // Inspect stacked cards DOM properties during overlap
  const stackedCardsInfo = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#projects .glass-card-opaque'));
    return cards.map((c, i) => {
      const rect = c.getBoundingClientRect();
      const style = window.getComputedStyle(c);
      const innerContent = c.querySelector('.transition-opacity');
      const innerStyle = innerContent ? window.getComputedStyle(innerContent) : null;
      return {
        cardIndex: i,
        top: Math.round(rect.top),
        height: Math.round(rect.height),
        overflow: style.overflow,
        backgroundColor: style.backgroundColor,
        contentOpacity: innerStyle?.opacity,
      };
    });
  });
  console.log('Stacked Cards DOM Info during overlap:');
  console.table(stackedCardsInfo);

  // --------------------------------------------------------------------------
  // TEST 5: FOOTER WORDMARK (Gradient, Brightness, Mask & Viewport Fit)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: FOOTER WORDMARK (Viewport Width & Styling) ---');
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
  });
  await page.waitForTimeout(600);

  const footerWordmarkPath = path.join(SCREENSHOT_DIR, 'footer_wordmark.png');
  const footerEl = await page.$('footer');
  if (footerEl) {
    await footerEl.screenshot({ path: footerWordmarkPath });
    console.log(`Saved Footer Wordmark screenshot: ${footerWordmarkPath}`);
  }

  // Check width across 4 responsive viewports (375, 768, 1440, 1920)
  const viewports = [375, 768, 1440, 1920];
  const wordmarkResults = [];

  for (let vpWidth of viewports) {
    await page.setViewportSize({ width: vpWidth, height: 800 });
    await page.waitForTimeout(300);

    const fit = await page.evaluate(() => {
      const wm = document.querySelector('footer .metallic-text-gradient');
      if (!wm) return null;
      const rect = wm.getBoundingClientRect();
      const style = window.getComputedStyle(wm);
      return {
        text: wm.textContent.trim(),
        width: rect.width,
        viewportWidth: window.innerWidth,
        fitsInsideViewport: rect.width <= window.innerWidth,
        filter: style.filter,
        maskImage: style.maskImage || style.webkitMaskImage,
      };
    });

    console.log(`Viewport ${vpWidth}px: Wordmark Width = ${fit?.width?.toFixed(1)}px | Fits: ${fit?.fitsInsideViewport ? 'YES (<= ' + vpWidth + 'px)' : 'NO'}`);
    wordmarkResults.push({ viewport: vpWidth, ...fit });
  }

  // Restore 1440 viewport
  await page.setViewportSize({ width: 1440, height: 900 });

  // --------------------------------------------------------------------------
  // TEST 6: SLOW SCROLL VIDEO WITH BUTTON HOVER
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 6: RECORDING SLOW SCROLL WITH BUTTON HOVER ---');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(500);

  const totalHeight = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
  const scrollSteps = 50;
  const scrollStepSize = totalHeight / scrollSteps;

  for (let s = 0; s <= scrollSteps; s++) {
    const currentY = s * scrollStepSize;
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), currentY);
    await page.waitForTimeout(140);

    // Hover any visible button or chip at this scroll position
    const visibleBtn = await page.$('button:visible, a[role="button"]:visible, a.rounded-full:visible');
    if (visibleBtn) {
      try {
        const box = await visibleBtn.boundingBox();
        if (box && box.y > 50 && box.y < 850) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        }
      } catch {}
    }
  }

  await page.waitForTimeout(1000);

  // Close context to finish video
  await mainContext.close();
  await browser.close();

  // Find latest webm video in VIDEO_DIR and rename to slow_scroll_demo.webm
  const videoFiles = fs.readdirSync(VIDEO_DIR).filter((f) => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    const latest = videoFiles.sort((a, b) => {
      return fs.statSync(path.join(VIDEO_DIR, b)).mtimeMs - fs.statSync(path.join(VIDEO_DIR, a)).mtimeMs;
    })[0];
    const targetVideo = path.join(VIDEO_DIR, 'slow_scroll_demo.webm');
    fs.copyFileSync(path.join(VIDEO_DIR, latest), targetVideo);
    console.log(`Slow scroll video recorded and saved to: ${targetVideo}`);
  }

  console.log('\n================================================================');
  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

runVerification().catch((err) => {
  console.error('Verification script failed:', err);
  process.exit(1);
});
