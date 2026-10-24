import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/56cd7d5d-dbb6-4de1-a5da-ccbb136d55f4';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verifyTilesConsistency() {
  console.log('================================================================');
  console.log('VERIFYING SKILLS TILES CONSISTENCY & IN-PROGRESS DASHED BORDER');
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
  await page.waitForTimeout(1000);

  // Scroll to Skills section
  const skillsSection = await page.waitForSelector('#skills');
  await skillsSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  // Move mouse away from the tiles to top-left corner (0, 0)
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);

  // Extract computed styles of all 4 tiles
  const tilesData = await page.evaluate(() => {
    const grid = document.querySelector('#skills .grid');
    const cards = Array.from(grid.querySelectorAll(':scope > div > div'));

    return cards.map((card, idx) => {
      const style = window.getComputedStyle(card);
      const headerDiv = card.querySelector('.font-mono');
      const headerStyle = headerDiv ? window.getComputedStyle(headerDiv) : null;
      const textSpan = headerDiv?.querySelector('span:last-child');
      const labelText = textSpan?.textContent?.trim() || '';

      return {
        tileIndex: idx + 1,
        label: labelText,
        // Card styling
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        boxShadow: style.boxShadow,
        backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
        borderTopStyle: style.borderTopStyle,
        borderTopWidth: style.borderTopWidth,
        borderTopColor: style.borderTopColor,
        // Label styling
        fontFamily: headerStyle?.fontFamily,
        fontWeight: headerStyle?.fontWeight,
        fontSize: headerStyle?.fontSize,
        color: headerStyle?.color,
      };
    });
  });

  console.log('\n--- COMPUTED CARD STYLES (MOUSE AWAY AT 0,0) ---');
  console.table(tilesData.map(t => ({
    Tile: t.tileIndex,
    Label: t.label,
    FillBg: t.backgroundColor,
    FillGradient: t.backgroundImage.slice(0, 35) + '...',
    Border: `${t.borderTopWidth} ${t.borderTopStyle} ${t.borderTopColor}`,
    BoxShadow: t.boxShadow.slice(0, 30) + '...',
  })));

  console.log('\n--- COMPUTED LABEL STYLES ---');
  console.table(tilesData.map(t => ({
    Tile: t.tileIndex,
    Label: t.label,
    Font: t.fontFamily.slice(0, 25) + '...',
    Weight: t.fontWeight,
    Size: t.fontSize,
    Color: t.color,
  })));

  // Assertions:
  console.log('\n--- EVALUATING REQUIREMENTS ---');
  // 1. Fill colors identical across all 4 tiles
  const allBgColorsMatch = tilesData.every(t => t.backgroundColor === tilesData[0].backgroundColor);
  const allBgImagesMatch = tilesData.every(t => t.backgroundImage === tilesData[0].backgroundImage);
  console.log(`1. Fill color identical on all 4 tiles: ${allBgColorsMatch && allBgImagesMatch ? 'PASS' : 'FAIL'} (${tilesData[0].backgroundColor})`);

  // 2. Shadows identical across all 4 tiles
  const allShadowsMatch = tilesData.every(t => t.boxShadow === tilesData[0].boxShadow);
  console.log(`2. Box-shadow identical on all 4 tiles: ${allShadowsMatch ? 'PASS' : 'FAIL'}`);

  // 3. Label styles identical across all 4 tiles
  const allFontsMatch = tilesData.every(t => t.fontFamily === tilesData[0].fontFamily);
  const allWeightsMatch = tilesData.every(t => t.fontWeight === tilesData[0].fontWeight);
  const allSizesMatch = tilesData.every(t => t.fontSize === tilesData[0].fontSize);
  const allColorsMatch = tilesData.every(t => t.color === tilesData[0].color);
  console.log(`3. Label font identical: ${allFontsMatch ? 'PASS' : 'FAIL'}`);
  console.log(`4. Label font-weight identical (Learning now NOT bolder): ${allWeightsMatch ? 'PASS' : 'FAIL'} (${tilesData[0].fontWeight})`);
  console.log(`5. Label font-size identical: ${allSizesMatch ? 'PASS' : 'FAIL'} (${tilesData[0].fontSize})`);
  console.log(`6. Label color identical: ${allColorsMatch ? 'PASS' : 'FAIL'} (${tilesData[0].color})`);

  // 4. Dashed 1px border on Tile 4
  const tile4 = tilesData[3];
  const isTile4Dashed = tile4.borderTopStyle === 'dashed';
  const isTile4_1px = tile4.borderTopWidth === '1px';
  // rgba(255, 255, 255, 0.18) in rgb format is rgba(255, 255, 255, 0.18)
  const isTile4ColorMatch = tile4.borderTopColor.includes('255, 255, 255') && tile4.borderTopColor.includes('0.18');
  console.log(`7. Tile 4 dashed border style: ${isTile4Dashed ? 'PASS' : 'FAIL'} (${tile4.borderTopStyle})`);
  console.log(`8. Tile 4 border width 1px: ${isTile4_1px ? 'PASS' : 'FAIL'} (${tile4.borderTopWidth})`);
  console.log(`9. Tile 4 border color rgba(255,255,255,0.18): ${isTile4ColorMatch ? 'PASS' : 'FAIL'} (${tile4.borderTopColor})`);

  // Capture Zoomed screenshot of just the tiles row with mouse away
  const tilesGrid = await page.waitForSelector('#skills .grid');
  const zoomedScreenshotPath = path.join(SCREENSHOT_DIR, 'skills_tiles_consistent_zoom.png');
  await tilesGrid.screenshot({ path: zoomedScreenshotPath });
  console.log(`\nSaved zoomed screenshot with mouse away: ${zoomedScreenshotPath}`);

  // Also capture full section screenshots
  const full1440Path = path.join(SCREENSHOT_DIR, 'skills_section_1440.png');
  await skillsSection.screenshot({ path: full1440Path });
  console.log(`Saved full section screenshot at 1440px: ${full1440Path}`);

  await context.close();

  // 1920px screenshot
  const context1920 = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });
  const page1920 = await context1920.newPage();
  await page1920.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  try {
    const skipBtn = await page1920.waitForSelector('button:has-text("Skip intro")', { timeout: 3000 });
    if (skipBtn) await skipBtn.click();
  } catch {}
  await page1920.waitForTimeout(1000);
  const skills1920 = await page1920.waitForSelector('#skills');
  await skills1920.scrollIntoViewIfNeeded();
  await page1920.mouse.move(0, 0);
  await page1920.waitForTimeout(400);
  const full1920Path = path.join(SCREENSHOT_DIR, 'skills_section_1920.png');
  await skills1920.screenshot({ path: full1920Path });
  console.log(`Saved full section screenshot at 1920px: ${full1920Path}`);
  await context1920.close();

  // 390px screenshot
  const context390 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    colorScheme: 'dark',
    isMobile: true,
  });
  const page390 = await context390.newPage();
  await page390.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  try {
    const skipBtn = await page390.waitForSelector('button:has-text("Skip intro")', { timeout: 3000 });
    if (skipBtn) await skipBtn.click();
  } catch {}
  await page390.waitForTimeout(1000);
  const skills390 = await page390.waitForSelector('#skills');
  await skills390.scrollIntoViewIfNeeded();
  await page390.mouse.move(0, 0);
  await page390.waitForTimeout(400);
  const full390Path = path.join(SCREENSHOT_DIR, 'skills_section_390.png');
  await skills390.screenshot({ path: full390Path });
  console.log(`Saved full section screenshot at 390px: ${full390Path}`);
  await context390.close();

  await browser.close();

  console.log('\n================================================================');
  console.log('ALL TILES CONSISTENCY TESTS COMPLETED!');
  console.log('================================================================');
}

verifyTilesConsistency().catch(err => {
  console.error('Error during tiles consistency verification:', err);
  process.exit(1);
});
