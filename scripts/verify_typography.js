import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const artifactDir = 'C:\\Users\\hraj2\\.gemini\\antigravity-ide\\brain\\1f9f5805-9b22-48cc-b50f-157ceb35e9ef';
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

async function verify() {
  console.log('Launching Chromium...');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Set up CDP session to query Platform Fonts (DevTools Rendered Fonts)
  const client = await page.context().newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('CSS.enable');

  const doc = await client.send('DOM.getDocument', { depth: -1 });

  // Helper to get platform font for a selector
  async function getPlatformFontForSelector(selector) {
    const handle = await page.$(selector);
    if (!handle) return null;
    const nodeRes = await client.send('DOM.querySelector', {
      nodeId: doc.root.nodeId,
      selector: selector,
    });
    if (!nodeRes || !nodeRes.nodeId) return null;

    const fonts = await client.send('CSS.getPlatformFontsForNode', {
      nodeId: nodeRes.nodeId,
    });
    return fonts.fonts;
  }

  // Check elements
  const h1Fonts = await getPlatformFontForSelector('h1');
  const navFonts = await getPlatformFontForSelector('nav[aria-label="Primary Navigation"] a');
  const heroBtnFonts = await getPlatformFontForSelector('#hero a.apple-button-primary');
  const bodyFonts = await getPlatformFontForSelector('body');

  console.log('--- DevTools Computed Rendered Fonts ---');
  console.log('h1 Rendered Fonts:', JSON.stringify(h1Fonts, null, 2));
  console.log('nav link Rendered Fonts:', JSON.stringify(navFonts, null, 2));
  console.log('hero button Rendered Fonts:', JSON.stringify(heroBtnFonts, null, 2));
  console.log('body Rendered Fonts:', JSON.stringify(bodyFonts, null, 2));

  // Also query computed style values
  const computedStyles = await page.evaluate(() => {
    const getStyle = (el) => {
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      return {
        fontFamily: cs.fontFamily,
        fontWeight: cs.fontWeight,
        letterSpacing: cs.letterSpacing,
        fontSize: cs.fontSize,
        fontFeatureSettings: cs.fontFeatureSettings,
        webkitFontSmoothing: cs.webkitFontSmoothing,
        padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
        gap: cs.gap,
      };
    };

    const h1 = document.querySelector('h1');
    const navLink = document.querySelector('nav[aria-label="Primary Navigation"] a[href="#projects"]');
    const heroBtn = document.querySelector('#hero a.apple-button-primary');
    const body = document.body;

    // Check loaded fonts in document.fonts
    const loadedFonts = [];
    document.fonts.forEach((font) => {
      loadedFonts.push({
        family: font.family,
        status: font.status,
        weight: font.weight,
        style: font.style,
      });
    });

    return {
      h1: getStyle(h1),
      navLink: getStyle(navLink),
      heroBtn: getStyle(heroBtn),
      body: getStyle(body),
      loadedFonts: loadedFonts.filter(f => f.family.includes('Inter')),
    };
  });

  console.log('--- Computed Styles & Loaded Fonts ---');
  console.log(JSON.stringify(computedStyles, null, 2));

  // Capture Hero & Nav screenshot (Dark Mode)
  console.log('Capturing Hero and Nav (Dark)...');
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await page.waitForTimeout(500);
  const darkPath = path.join(artifactDir, 'hero_nav_dark.png');
  await page.screenshot({
    path: darkPath,
    clip: { x: 0, y: 0, width: 1440, height: 750 },
  });
  console.log('Saved:', darkPath);

  // Capture Hero & Nav screenshot (Light Mode)
  console.log('Capturing Hero and Nav (Light)...');
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
  });
  await page.waitForTimeout(500);
  const lightPath = path.join(artifactDir, 'hero_nav_light.png');
  await page.screenshot({
    path: lightPath,
    clip: { x: 0, y: 0, width: 1440, height: 750 },
  });
  console.log('Saved:', lightPath);

  await browser.close();
  console.log('Verification finished successfully.');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
