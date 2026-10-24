import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/56cd7d5d-dbb6-4de1-a5da-ccbb136d55f4';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureAllScreenshots() {
  console.log('Capturing 2x zoomed UI audit screenshots...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Home page
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

  // Stop Lenis
  await page.evaluate(() => {
    if (window.__lenis) {
      try { window.__lenis.stop(); } catch (e) {}
    }
  });

  // Skip intro if present
  try {
    const skipBtn = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent.includes('Skip intro'));
      if (b) { b.click(); return true; }
      return false;
    });
    if (skipBtn) await new Promise((r) => setTimeout(r, 600));
  } catch (e) {}

  // 1. Hero Badge & Scroll cue
  try {
    const badgeEl = await page.evaluateHandle(() => {
      const heroChip = document.querySelector('#hero .apple-glass-chip-status');
      if (heroChip) return heroChip.closest('div.overflow-hidden') || heroChip;
      return document.querySelector('.apple-glass-chip-status');
    });
    if (badgeEl) {
      await badgeEl.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero_badge_2x.png') });
      console.log('Captured hero_badge_2x.png');
    }
  } catch (e) {
    console.warn('hero badge capture error:', e);
  }

  // 2. Project Card (all chips and buttons)
  try {
    const cardEl = await page.evaluateHandle(() => {
      return document.querySelector('#projects article') || document.querySelector('#projects .glass-card');
    });
    if (cardEl) {
      await page.evaluate((el) => el.scrollIntoView({ block: 'center' }), cardEl);
      await new Promise((r) => setTimeout(r, 400));
      await cardEl.screenshot({ path: path.join(SCREENSHOT_DIR, 'project_card_2x.png') });
      console.log('Captured project_card_2x.png');
    }
  } catch (e) {
    console.warn('project card capture error:', e);
  }

  // 3. Now Tile (About section)
  try {
    const nowTile = await page.evaluateHandle(() => {
      const spans = Array.from(document.querySelectorAll('#about span'));
      const nowSpan = spans.find((s) => s.textContent && s.textContent.trim() === 'Now');
      return nowSpan ? nowSpan.closest('.glass-card') : document.querySelectorAll('#about .glass-card')[2];
    });
    if (nowTile) {
      await page.evaluate((el) => el.scrollIntoView({ block: 'center' }), nowTile);
      await new Promise((r) => setTimeout(r, 400));
      await nowTile.screenshot({ path: path.join(SCREENSHOT_DIR, 'now_tile_2x.png') });
      console.log('Captured now_tile_2x.png');
    }
  } catch (e) {
    console.warn('now tile capture error:', e);
  }

  // 4. Skills Tiles
  try {
    const skillsSec = await page.$('#skills');
    if (skillsSec) {
      await page.evaluate((el) => el.scrollIntoView({ block: 'center' }), skillsSec);
      await new Promise((r) => setTimeout(r, 900));
      const bentoGrid = await page.evaluateHandle(() => {
        const grids = Array.from(document.querySelectorAll('#skills div.grid'));
        return grids[grids.length - 1] || document.querySelector('#skills');
      });
      if (bentoGrid) {
        await bentoGrid.screenshot({ path: path.join(SCREENSHOT_DIR, 'skills_tiles_2x.png') });
        console.log('Captured skills_tiles_2x.png');
      }
    }
  } catch (e) {
    console.warn('skills tiles capture error:', e);
  }

  // 5. Highlights Tabs & Panel
  try {
    const highlightsSec = await page.$('#highlights');
    if (highlightsSec) {
      await page.evaluate((el) => el.scrollIntoView({ block: 'center' }), highlightsSec);
      await new Promise((r) => setTimeout(r, 400));
      await highlightsSec.screenshot({ path: path.join(SCREENSHOT_DIR, 'highlights_tabs_2x.png') });
      console.log('Captured highlights_tabs_2x.png');
    }
  } catch (e) {
    console.warn('highlights capture error:', e);
  }

  // 6. Beyond Code Chips
  try {
    const beyondSec = await page.$('#beyond-code');
    if (beyondSec) {
      await page.evaluate((el) => el.scrollIntoView({ block: 'center' }), beyondSec);
      await new Promise((r) => setTimeout(r, 400));
      await beyondSec.screenshot({ path: path.join(SCREENSHOT_DIR, 'beyond_code_chips_2x.png') });
      console.log('Captured beyond_code_chips_2x.png');
    }
  } catch (e) {
    console.warn('beyond code capture error:', e);
  }

  // 7. Contact Card and Form
  try {
    const contactSec = await page.$('#contact');
    if (contactSec) {
      await page.evaluate((el) => el.scrollIntoView({ block: 'center' }), contactSec);
      await new Promise((r) => setTimeout(r, 400));
      await contactSec.screenshot({ path: path.join(SCREENSHOT_DIR, 'contact_card_form_2x.png') });
      console.log('Captured contact_card_form_2x.png');
    }
  } catch (e) {
    console.warn('contact card capture error:', e);
  }

  // 8. Footer & Back to top button
  try {
    const footerEl = await page.$('footer');
    if (footerEl) {
      await page.evaluate((el) => el.scrollIntoView({ block: 'center' }), footerEl);
      await new Promise((r) => setTimeout(r, 400));
      await footerEl.screenshot({ path: path.join(SCREENSHOT_DIR, 'footer_2x.png') });
      console.log('Captured footer_2x.png');
    }
  } catch (e) {
    console.warn('footer capture error:', e);
  }

  // 9. Tooltip (Demo link tooltip or Sound toggle tooltip)
  try {
    // Click on a demo link in LandSafe project card to show tooltip
    await page.evaluate(() => {
      const demoBtn = document.querySelector('#projects a[aria-disabled="true"]');
      if (demoBtn) demoBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));
    const tooltipEl = await page.evaluateHandle(() => {
      return document.querySelector('#projects [role="tooltip"]') || document.querySelector('[role="tooltip"]');
    });
    if (tooltipEl) {
      const parentCard = await page.evaluateHandle(() => {
        return document.querySelector('#projects article') || document.querySelector('#projects .glass-card');
      });
      await parentCard.screenshot({ path: path.join(SCREENSHOT_DIR, 'tooltip_2x.png') });
      console.log('Captured tooltip_2x.png');
    }
  } catch (e) {
    console.warn('tooltip capture error:', e);
  }

  // 10. Case study page (/projects/landsafe)
  try {
    await page.goto(`${BASE_URL}/projects/landsafe`, { waitUntil: 'networkidle0' });
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.evaluate(() => {
      if (window.__lenis) {
        try { window.__lenis.stop(); } catch (e) {}
      }
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'case_study_page_2x.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });
    console.log('Captured case_study_page_2x.png');
  } catch (e) {
    console.warn('case study page capture error:', e);
  }

  await browser.close();
  console.log('All 2x screenshots successfully captured!');
}

captureAllScreenshots().catch(console.error);
