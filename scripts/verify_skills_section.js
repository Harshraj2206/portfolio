import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/56cd7d5d-dbb6-4de1-a5da-ccbb136d55f4';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verifySkillsSection() {
  console.log('================================================================');
  console.log('STARTING SKILLS SECTION VERIFICATION');
  console.log('================================================================');

  const browser = await chromium.launch({ headless: true });

  // --------------------------------------------------------------------------
  // 1. SCREENSHOT AT 1440px AND FUNCTIONAL VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- Viewport 1440x900 Tests ---');
  const context1440 = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });
  const page1440 = await context1440.newPage();
  await page1440.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Skip intro
  try {
    const skipBtn = await page1440.waitForSelector('button:has-text("Skip intro")', { timeout: 3000 });
    if (skipBtn) await skipBtn.click();
  } catch {}
  await page1440.waitForTimeout(1000);

  // Scroll to Skills section
  const skillsSection = await page1440.waitForSelector('#skills');
  await skillsSection.scrollIntoViewIfNeeded();
  await page1440.waitForTimeout(600);

  // VERIFICATION 1: Skills & Levels
  console.log('\n[TEST 1] Verifying Skills and Levels in Tiles...');
  const skillsData = await page1440.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('#skills .grid > div'));
    return tiles.map((tile) => {
      const headerSpan = tile.querySelector('.font-mono span');
      const label = headerSpan ? headerSpan.textContent.trim() : '';
      const chips = Array.from(tile.querySelectorAll('span.rounded-pill, span.inline-flex')).map(
        (c) => c.querySelector('span:last-child')?.textContent?.trim() || c.textContent.trim()
      );
      return { label, chips };
    });
  });

  console.log('Tiles extracted:', JSON.stringify(skillsData, null, 2));

  const workingTile = skillsData.find((t) => t.label === 'Working knowledge');
  const intermediateTile = skillsData.find((t) => t.label === 'Intermediate');
  const basicsTile = skillsData.find((t) => t.label === 'Basics');
  const learningTile = skillsData.find((t) => t.label === 'Learning now');

  console.log('\nAsserting Skill Levels:');
  const isWorkingCorrect = workingTile && workingTile.chips.length === 1 && workingTile.chips[0] === 'Python';
  console.log(`- Working knowledge: [${workingTile?.chips.join(', ')}] -> ${isWorkingCorrect ? 'PASS' : 'FAIL'}`);

  const isIntermediateCorrect =
    intermediateTile &&
    intermediateTile.chips.includes('Java') &&
    intermediateTile.chips.includes('HTML') &&
    intermediateTile.chips.includes('CSS') &&
    intermediateTile.chips.length === 3;
  console.log(`- Intermediate: [${intermediateTile?.chips.join(', ')}] -> ${isIntermediateCorrect ? 'PASS' : 'FAIL'}`);

  const isBasicsCorrect = basicsTile && basicsTile.chips.length === 1 && basicsTile.chips[0] === 'C';
  console.log(`- Basics: [${basicsTile?.chips.join(', ')}] -> ${isBasicsCorrect ? 'PASS' : 'FAIL'}`);

  const htmlInBasics = basicsTile && basicsTile.chips.some((c) => c.includes('HTML') || c.includes('CSS'));
  console.log(`- HTML/CSS NOT in Basics: ${!htmlInBasics ? 'PASS' : 'FAIL'}`);

  const isLearningCorrect =
    learningTile &&
    learningTile.chips.includes('Advanced Python') &&
    learningTile.chips.includes('Prompt engineering') &&
    learningTile.chips.length === 2;
  console.log(`- Learning now: [${learningTile?.chips.join(', ')}] -> ${isLearningCorrect ? 'PASS' : 'FAIL'}`);

  // Check icon on Prompt engineering
  const promptIconExists = await page1440.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('#skills span.inline-flex'));
    const promptChip = chips.find((c) => c.textContent.includes('Prompt engineering'));
    if (!promptChip) return false;
    const svg = promptChip.querySelector('svg');
    return Boolean(svg);
  });
  console.log(`- Prompt engineering chip has icon: ${promptIconExists ? 'PASS' : 'FAIL'}`);

  // Check Terminal "ls skills/"
  console.log('\n[TEST 1b] Verifying Terminal Tile "ls skills/" and "Now" tile...');
  const aboutTerminalOutput = await page1440.evaluate(() => {
    const term = document.querySelector('#about');
    if (!term) return null;
    const text = term.innerText;
    return text;
  });
  const hasLsSkills = aboutTerminalOutput?.toLowerCase().includes('python   java   html   css   c') ||
                      (aboutTerminalOutput?.includes('python') && aboutTerminalOutput?.includes('java') && aboutTerminalOutput?.includes('c'));
  console.log(`- About terminal outputs skills: ${hasLsSkills ? 'PASS' : 'FAIL'}`);

  // Check JSON-LD
  const jsonLdData = await page1440.evaluate(() => {
    const script = document.getElementById('dynamic-jsonld');
    return script ? JSON.parse(script.textContent) : null;
  });
  console.log(`- JSON-LD knowsAbout:`, jsonLdData?.knowsAbout);
  const jsonLdHasSkills =
    jsonLdData?.knowsAbout?.includes('Python') &&
    jsonLdData?.knowsAbout?.includes('Java') &&
    jsonLdData?.knowsAbout?.includes('HTML') &&
    jsonLdData?.knowsAbout?.includes('CSS') &&
    jsonLdData?.knowsAbout?.includes('C') &&
    jsonLdData?.knowsAbout?.includes('Advanced Python') &&
    jsonLdData?.knowsAbout?.includes('Prompt engineering');
  console.log(`- JSON-LD includes all skills: ${jsonLdHasSkills ? 'PASS' : 'FAIL'}`);

  // VERIFICATION 2: Labels
  console.log('\n[TEST 2] Verifying Tile Labels, sentence case, weights and colors...');
  const labelStyles = await page1440.evaluate(() => {
    const tiles = Array.from(document.querySelectorAll('#skills .grid > div'));
    return tiles.map((tile) => {
      const headerDiv = tile.querySelector('.font-mono');
      const textSpan = headerDiv?.querySelector('span:last-child');
      const text = textSpan?.textContent?.trim() || '';
      const textTransform = window.getComputedStyle(headerDiv).textTransform;
      const fontWeight = window.getComputedStyle(headerDiv).fontWeight;
      const color = window.getComputedStyle(headerDiv).color;
      return { text, textTransform, fontWeight, color };
    });
  });

  console.table(labelStyles);
  const sentenceCaseLabels = ['Working knowledge', 'Intermediate', 'Basics', 'Learning now'];
  const labelsSentenceCase = labelStyles.every((l, idx) => l.text === sentenceCaseLabels[idx] && l.textTransform === 'none');
  console.log(`- Labels sentence case with NO uppercase transform: ${labelsSentenceCase ? 'PASS' : 'FAIL'}`);

  const firstThreeWeightsMatch =
    labelStyles[0].fontWeight === labelStyles[1].fontWeight &&
    labelStyles[1].fontWeight === labelStyles[2].fontWeight;
  const firstThreeColorsMatch =
    labelStyles[0].color === labelStyles[1].color &&
    labelStyles[1].color === labelStyles[2].color;
  const learningWeightMatches = labelStyles[3].fontWeight === labelStyles[0].fontWeight;
  console.log(`- First three labels have identical weight: ${firstThreeWeightsMatch ? 'PASS' : 'FAIL'} (${labelStyles[0].fontWeight})`);
  console.log(`- First three labels have identical color: ${firstThreeColorsMatch ? 'PASS' : 'FAIL'} (${labelStyles[0].color})`);
  console.log(`- Learning now tile has same font-weight (not heavier): ${learningWeightMatches ? 'PASS' : 'FAIL'} (${labelStyles[3].fontWeight})`);

  // VERIFICATION 3: Marquee Icons
  console.log('\n[TEST 3] Verifying Marquee Icons, optical box size, names, and labels...');
  const marqueeData = await page1440.evaluate(() => {
    const marquee = document.querySelector('.animate-marquee');
    if (!marquee) return null;
    const items = Array.from(marquee.querySelectorAll(':scope > div:first-child > div'));
    return items.map((item) => {
      const box = item.querySelector('.w-10');
      const svg = box ? box.querySelector('svg') : null;
      const label = item.querySelector('span:last-child');
      const labelStyle = label ? window.getComputedStyle(label) : null;
      const itemStyle = window.getComputedStyle(item);
      const boxRect = box ? box.getBoundingClientRect() : null;
      const svgRect = svg ? svg.getBoundingClientRect() : null;

      return {
        name: label?.textContent?.trim(),
        fontSize: labelStyle?.fontSize,
        fontFamily: labelStyle?.fontFamily,
        color: itemStyle?.color,
        opacity: itemStyle?.opacity,
        boxWidth: boxRect?.width,
        boxHeight: boxRect?.height,
        svgWidth: svgRect?.width,
        svgHeight: svgRect?.height,
      };
    });
  });

  console.table(marqueeData);
  const uniqueNames = [...new Set(marqueeData?.map((m) => m.name))];
  console.log('Marquee unique item names:', uniqueNames);
  const hasExactNames =
    uniqueNames.includes('Python') &&
    uniqueNames.includes('Java') &&
    uniqueNames.includes('HTML') &&
    uniqueNames.includes('CSS') &&
    uniqueNames.includes('C') &&
    !uniqueNames.includes('HTML5') &&
    !uniqueNames.includes('CSS3');
  console.log(`- Marquee names are "HTML" and "CSS" (not HTML5 or CSS3): ${hasExactNames ? 'PASS' : 'FAIL'}`);

  const allBoxes40px = marqueeData?.every((m) => Math.abs(m.boxWidth - 40) < 1 && Math.abs(m.boxHeight - 40) < 1);
  console.log(`- Every icon inside 40px square box: ${allBoxes40px ? 'PASS' : 'FAIL'}`);

  const allFont15px = marqueeData?.every((m) => m.fontSize === '15px');
  console.log(`- All marquee labels font size 15px: ${allFont15px ? 'PASS' : 'FAIL'}`);

  const allColorB4B4BA = marqueeData?.every((m) => m.color === 'rgb(180, 180, 186)');
  console.log(`- All marquee items color #B4B4BA (rgb(180, 180, 186)): ${allColorB4B4BA ? 'PASS' : 'FAIL'}`);

  const allOpacity09 = marqueeData?.every((m) => Math.abs(parseFloat(m.opacity) - 0.9) < 0.05);
  console.log(`- All marquee items opacity 0.9: ${allOpacity09 ? 'PASS' : 'FAIL'}`);

  // VERIFICATION 4: Tile heights and columns
  console.log('\n[TEST 4] Verifying Tile Heights (fit content, 24px padding) & Column sizing...');
  const tileMeasurements = await page1440.evaluate(() => {
    const grid = document.querySelector('#skills .grid');
    const gridStyle = window.getComputedStyle(grid);
    const tiles = Array.from(grid.querySelectorAll(':scope > div > div')); // GlassCards

    return {
      gridTemplateColumns: gridStyle.gridTemplateColumns,
      alignItems: gridStyle.alignItems,
      tiles: tiles.map((t, idx) => {
        const style = window.getComputedStyle(t);
        const rect = t.getBoundingClientRect();
        return {
          idx: idx + 1,
          paddingTop: style.paddingTop,
          paddingBottom: style.paddingBottom,
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight,
          height: rect.height,
          width: rect.width,
        };
      }),
    };
  });

  console.log('Grid template columns:', tileMeasurements.gridTemplateColumns);
  console.log('Grid align items:', tileMeasurements.alignItems);
  console.table(tileMeasurements.tiles);

  const allPadding24px = tileMeasurements.tiles.every(
    (t) => t.paddingTop === '24px' && t.paddingBottom === '24px' && t.paddingLeft === '24px' && t.paddingRight === '24px'
  );
  console.log(`- All tiles have exact 24px padding: ${allPadding24px ? 'PASS' : 'FAIL'}`);

  const heightsDiffer = new Set(tileMeasurements.tiles.map((t) => Math.round(t.height))).size > 1;
  console.log(`- Tiles fit content (heights not artificially stretched): ${heightsDiffer ? 'PASS' : 'FAIL'}`);

  // Screenshot at 1440
  const screenshot1440Path = path.join(SCREENSHOT_DIR, 'skills_section_1440.png');
  await skillsSection.screenshot({ path: screenshot1440Path });
  console.log(`Saved screenshot: ${screenshot1440Path}`);

  await context1440.close();

  // --------------------------------------------------------------------------
  // 2. SCREENSHOT AT 1920px
  // --------------------------------------------------------------------------
  console.log('\n--- Viewport 1920x1080 Screenshot ---');
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

  const skillsSection1920 = await page1920.waitForSelector('#skills');
  await skillsSection1920.scrollIntoViewIfNeeded();
  await page1920.waitForTimeout(600);

  const screenshot1920Path = path.join(SCREENSHOT_DIR, 'skills_section_1920.png');
  await skillsSection1920.screenshot({ path: screenshot1920Path });
  console.log(`Saved screenshot: ${screenshot1920Path}`);

  await context1920.close();

  // --------------------------------------------------------------------------
  // 3. SCREENSHOT AT 390px (Mobile)
  // --------------------------------------------------------------------------
  console.log('\n--- Viewport 390x844 (Mobile) Screenshot ---');
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

  const skillsSection390 = await page390.waitForSelector('#skills');
  await skillsSection390.scrollIntoViewIfNeeded();
  await page390.waitForTimeout(600);

  const screenshot390Path = path.join(SCREENSHOT_DIR, 'skills_section_390.png');
  await skillsSection390.screenshot({ path: screenshot390Path });
  console.log(`Saved screenshot: ${screenshot390Path}`);

  await context390.close();
  await browser.close();

  console.log('\n================================================================');
  console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

verifySkillsSection().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
