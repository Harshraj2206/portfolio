import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function runBrowserVerification() {
  const videoDir = path.resolve('scripts/recordings');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 800 },
    },
  });

  const page = await context.newPage();

  // Track all soundEngine.play calls in the browser page
  await page.addInitScript(() => {
    window.__soundHistory = [];
    window.__audioContextCreatedBeforeGesture = false;

    // Check if AudioContext was accessed prematurely
    const origAudioContext = window.AudioContext;
    if (origAudioContext) {
      window.AudioContext = class extends origAudioContext {
        constructor() {
          super();
          window.__audioContextInstance = this;
        }
      };
    }
  });

  console.log('1. Loading portfolio homepage...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

  // Hook into soundEngine in page
  await page.evaluate(() => {
    // Inject listener on soundEngine if accessible or spy on play
    import('/src/audio/soundEngine.ts').then((mod) => {
      const engine = mod.soundEngine;
      const origPlay = engine.play.bind(engine);
      engine.play = (name, params) => {
        window.__soundHistory.push({
          name,
          time: performance.now(),
          enabled: engine.isSoundEnabled(),
        });
        return origPlay(name, params);
      };
      window.__engine = engine;
    });
  });

  // Verify sound button is visible at top right during intro
  const soundBtn = page.locator('button[aria-label*="sound effects"]');
  await soundBtn.waitFor({ state: 'visible', timeout: 5000 });
  const btnBox = await soundBtn.boundingBox();
  console.log(`Sound button position: top=${btnBox?.y}px, right=${1280 - ((btnBox?.x || 0) + (btnBox?.width || 0))}px, size=${btnBox?.width}x${btnBox?.height}px`);

  // Verify Skip Intro button is at bottom right, not colliding with sound button
  const skipBtn = page.locator('button:has-text("Skip")');
  if (await skipBtn.count() > 0) {
    const skipBox = await skipBtn.boundingBox();
    console.log(`Skip Intro position: top=${skipBox?.y}px, right=${1280 - ((skipBox?.x || 0) + (skipBox?.width || 0))}px, bottom=${800 - ((skipBox?.y || 0) + (skipBox?.height || 0))}px`);
  }

  // 1. Check no sounds before first user gesture
  const historyBefore = await page.evaluate(() => window.__soundHistory);
  console.log(`Sounds played before user interaction: ${historyBefore.length} (expected 0)`);

  // Wait a moment for intro or click Skip to finish intro
  await page.waitForTimeout(1000);
  if (await skipBtn.count() > 0 && await skipBtn.isVisible()) {
    console.log('Clicking Skip Intro...');
    await skipBtn.click();
    await page.waitForTimeout(500);
  }

  // 2. Check 3-second post-intro caption
  const caption = page.locator('text="Sound effects on. Tap to mute."');
  const captionVisible = await caption.isVisible();
  console.log(`Post-intro caption displayed: ${captionVisible}`);

  // 3. Test NAV group sound on navbar items
  console.log('\n--- Testing GROUP "nav" ---');
  await page.evaluate(() => (window.__soundHistory = []));
  const navAbout = page.locator('nav[data-sound-group="nav"] a:has-text("About")').first();
  await navAbout.click();
  await page.waitForTimeout(100);

  const navProjects = page.locator('nav[data-sound-group="nav"] a:has-text("Projects")').first();
  await navProjects.click();
  await page.waitForTimeout(100);

  const navSkills = page.locator('nav[data-sound-group="nav"] a:has-text("Skills")').first();
  await navSkills.click();
  await page.waitForTimeout(100);

  const navSounds = await page.evaluate(() => window.__soundHistory.map((s) => s.name));
  console.log('Nav item clicks recorded sounds:', navSounds);

  // 4. Test dynamically adding a new button inside navbar: inherits group "nav"
  console.log('\n--- Testing Dynamic Element in Navbar ---');
  await page.evaluate(() => {
    window.__soundHistory = [];
    const nav = document.querySelector('nav[data-sound-group="nav"]');
    if (nav) {
      const newBtn = document.createElement('button');
      newBtn.id = 'dynamic-nav-test-btn';
      newBtn.textContent = 'Dynamic Nav Test';
      nav.appendChild(newBtn);
    }
  });
  await page.locator('#dynamic-nav-test-btn').click();
  await page.waitForTimeout(100);
  const dynamicNavSounds = await page.evaluate(() => window.__soundHistory.map((s) => s.name));
  console.log('Dynamically added button in navbar recorded sounds:', dynamicNavSounds);

  // 5. Test SOCIAL group sound
  console.log('\n--- Testing GROUP "social" ---');
  await page.evaluate(() => (window.__soundHistory = []));
  // In demo mode, demo links have aria-disabled="true", let's test that disabled links are silent!
  const demoSocialIcon = page.locator('section[aria-label="Find me online"] a[aria-disabled="true"]').first();
  if (await demoSocialIcon.count() > 0) {
    await demoSocialIcon.click({ force: true });
    await page.waitForTimeout(100);
    const demoSounds = await page.evaluate(() => window.__soundHistory.map((s) => s.name));
    console.log('Demo disabled social icon click sounds (expected silent):', demoSounds);
  }

  // Test real / enabled social icon in footer or dynamic enabled social icon
  await page.evaluate(() => {
    window.__soundHistory = [];
    const container = document.querySelector('[data-sound-group="social"]');
    if (container) {
      const a = document.createElement('a');
      a.id = 'test-social-active';
      a.href = '#test-social';
      a.textContent = 'Active Social';
      container.appendChild(a);
    }
  });
  await page.locator('#test-social-active').click();
  await page.waitForTimeout(100);
  const activeSocialSounds = await page.evaluate(() => window.__soundHistory.map((s) => s.name));
  console.log('Active social container item click sounds:', activeSocialSounds);

  // 6. Test BUTTON group sound on hero, project, tabs, contact, back-to-top
  console.log('\n--- Testing GROUP "button" ---');
  await page.evaluate(() => (window.__soundHistory = []));

  // Hero button
  const heroBtn = page.locator('a:has-text("View my work")');
  if (await heroBtn.count() > 0) {
    await heroBtn.click();
    await page.waitForTimeout(100);
  }

  // Highlights tab (segmented control)
  const certTab = page.locator('button:has-text("Certifications")');
  if (await certTab.count() > 0) {
    await certTab.click();
    await page.waitForTimeout(100);
  }

  // Back to top button
  const backToTop = page.locator('button:has-text("Back to top")');
  if (await backToTop.count() > 0) {
    await backToTop.click();
    await page.waitForTimeout(100);
  }

  const buttonSounds = await page.evaluate(() => window.__soundHistory.map((s) => s.name));
  console.log('Hero, tab, back-to-top buttons recorded sounds:', buttonSounds);

  // 7. Test M keyboard shortcut and persistence
  console.log('\n--- Testing Sound Toggle & Keyboard Shortcut M ---');
  await page.evaluate(() => (window.__soundHistory = []));

  // Press 'm' to turn OFF
  await page.keyboard.press('m');
  await page.waitForTimeout(200);

  const isEnabledAfterM = await page.evaluate(() => window.__engine.isSoundEnabled());
  const storedAfterM = await page.evaluate(() => localStorage.getItem('portfolio:sound'));
  console.log(`After pressing 'M': soundEnabled=${isEnabledAfterM}, localStorage=${storedAfterM}`);

  // Test that clicks while muted produce NO sound
  await page.evaluate(() => (window.__soundHistory = []));
  await navAbout.click();
  const soundsWhileMuted = await page.evaluate(() => window.__soundHistory.length);
  console.log(`Sounds played while muted: ${soundsWhileMuted} (expected 0)`);

  // Press 'm' to turn back ON
  await page.keyboard.press('m');
  await page.waitForTimeout(200);
  const isEnabledAfterM2 = await page.evaluate(() => window.__engine.isSoundEnabled());
  const storedAfterM2 = await page.evaluate(() => localStorage.getItem('portfolio:sound'));
  console.log(`After pressing 'M' again: soundEnabled=${isEnabledAfterM2}, localStorage=${storedAfterM2}`);

  // 8. Test 'M' inside form input (should NOT toggle sound)
  console.log('\n--- Testing Typing "m" in Form Field ---');
  const nameInput = page.locator('#contact-name');
  if (await nameInput.count() > 0) {
    await nameInput.focus();
    await page.keyboard.type('Mohammed');
    const isEnabledAfterTyping = await page.evaluate(() => window.__engine.isSoundEnabled());
    console.log(`Typing 'm' in form input: soundEnabled still ${isEnabledAfterTyping}`);
  }

  // 9. Test Sound Toggle Button Click (Turn off then on)
  console.log('\n--- Testing Sound Button Click Interaction ---');
  await page.evaluate(() => (window.__soundHistory = []));
  await soundBtn.click(); // Turns OFF
  await page.waitForTimeout(100);
  await soundBtn.click(); // Turns ON (plays state)
  await page.waitForTimeout(100);
  const toggleClickSounds = await page.evaluate(() => window.__soundHistory.map((s) => s.name));
  console.log('Toggling sound button recorded sounds:', toggleClickSounds);

  // 10. Persistence across page reload
  console.log('\n--- Testing Persistence across Reload ---');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const reloadedPreference = await page.evaluate(() => localStorage.getItem('portfolio:sound'));
  console.log(`Preference retained in localStorage after reload: ${reloadedPreference}`);

  // Close context to save video
  await page.close();
  await context.close();
  await browser.close();

  // Find saved video file
  const videoFiles = fs.readdirSync(videoDir).filter((f) => f.endsWith('.webm'));
  console.log('\nSaved video recording:', videoFiles);
}

runBrowserVerification().catch((err) => {
  console.error(err);
  process.exit(1);
});
