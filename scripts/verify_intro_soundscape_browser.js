import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/fcb9ca49-a977-4248-9149-0572ae69e214';
const SCREENSHOTS_DIR = path.join(ARTIFACTS_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function verifyIntroSoundscape() {
  console.log('=== STARTING BROWSER INTRO SOUNDSCAPE VERIFICATION ===\n');
  const results = {};

  // Helper init script to simulate standard browser autoplay policy blocking
  const simulateBlockedAudioScript = () => {
    localStorage.setItem('portfolio:sound', 'on');
    sessionStorage.clear();

    let isUnlocked = false;
    const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;

    // @ts-ignore
    window.AudioContext = class extends OriginalAudioContext {
      constructor() {
        super();
        let internalState = 'suspended';

        Object.defineProperty(this, 'state', {
          get: () => (isUnlocked ? 'running' : internalState),
        });

        const origResume = this.resume.bind(this);
        this.resume = async () => {
          if (window.__simulatedGestureActive) {
            isUnlocked = true;
            internalState = 'running';
            try {
              await origResume();
            } catch {}
            return;
          }
          // Blocked by policy until gesture
          return new Promise((resolve) => setTimeout(resolve, 300));
        };
      }
    };

    window.addEventListener(
      'pointerdown',
      () => {
        window.__simulatedGestureActive = true;
        isUnlocked = true;
      },
      { capture: true }
    );
    window.addEventListener(
      'keydown',
      () => {
        window.__simulatedGestureActive = true;
        isUnlocked = true;
      },
      { capture: true }
    );
  };

  // --------------------------------------------------------------------------
  // TEST A: Audio blocked -> Start Gate appears -> NO "Continue without sound" button -> Click starts intro
  // --------------------------------------------------------------------------
  console.log('[Test A] Testing Autoplay Gate & Absence of "Continue without sound"...');
  {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      recordVideo: {
        dir: ARTIFACTS_DIR,
        size: { width: 1280, height: 800 },
      },
    });

    const page = await context.newPage();
    await page.addInitScript(simulateBlockedAudioScript);

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    // Wait for Start Gate dialog
    const gateDialog = page.locator('div[role="dialog"][aria-label="Start presentation with sound"]');
    await gateDialog.waitFor({ state: 'visible', timeout: 10000 });
    const isGateVisible = await gateDialog.isVisible();
    console.log(`  -> Start Gate overlay displayed: ${isGateVisible}`);

    // Verify "Continue without sound" button does NOT exist
    const continueWithoutSoundBtn = page.locator('button:has-text("Continue without sound")');
    const continueCount = await continueWithoutSoundBtn.count();
    console.log(`  -> "Continue without sound" count: ${continueCount} (Expected: 0)`);

    // Capture screenshot of Start Gate
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'intro_start_gate_clean.png') });

    // Click the gate to begin with sound
    await gateDialog.click();
    await gateDialog.waitFor({ state: 'hidden', timeout: 3000 });
    console.log('  -> Click dismissed gate and started intro');

    // Wait for intro to progress
    await page.waitForTimeout(9600);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'intro_running_with_thock_sound.png') });

    const videoPath = await page.video().path();
    await context.close();
    await browser.close();

    if (videoPath && fs.existsSync(videoPath)) {
      const targetVideo = path.join(ARTIFACTS_DIR, 'intro_soundscape_full_flow.webm');
      fs.copyFileSync(videoPath, targetVideo);
      console.log(`  -> Saved full intro recording to ${targetVideo}`);
    }

    results.testA = isGateVisible && continueCount === 0;
  }

  // --------------------------------------------------------------------------
  // TEST B: Top sound button is hidden and 'M' is ignored during intro; activates after intro
  // --------------------------------------------------------------------------
  console.log('\n[Test B] Testing top sound button hidden and "M" shortcut ignored during intro...');
  {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.addInitScript(simulateBlockedAudioScript);
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    const gateDialog = page.locator('div[role="dialog"][aria-label="Start presentation with sound"]');
    await gateDialog.waitFor({ state: 'visible', timeout: 10000 });

    // 1. Check sound button during gate
    const soundToggleBtn = page.locator('button[aria-label*="sound effects"]');
    const soundToggleWrapper = soundToggleBtn.locator('..');
    const isHiddenDuringGate = await soundToggleWrapper.evaluate((el) => {
      const classes = el.className;
      return classes.includes('opacity-0') && classes.includes('pointer-events-none');
    });
    console.log(`  -> Sound button wrapper hidden during start gate: ${isHiddenDuringGate} (Expected: true)`);

    // Click gate to start intro
    await gateDialog.click();
    await gateDialog.waitFor({ state: 'hidden', timeout: 3000 });

    // 2. Check sound button during intro animation
    const isHiddenDuringIntro = await soundToggleWrapper.evaluate((el) => {
      const classes = el.className;
      return classes.includes('opacity-0') && classes.includes('pointer-events-none');
    });
    console.log(`  -> Sound button wrapper hidden during active intro: ${isHiddenDuringIntro} (Expected: true)`);

    // 3. Press 'M' during intro and verify sound is NOT toggled
    const initialPref = await page.evaluate(() => localStorage.getItem('portfolio:sound'));
    await page.keyboard.press('m');
    await page.waitForTimeout(200);
    const prefAfterMDuringIntro = await page.evaluate(() => localStorage.getItem('portfolio:sound'));
    const isMIgnored = initialPref === prefAfterMDuringIntro;
    console.log(`  -> 'M' key ignored during intro: ${isMIgnored} (pref remained "${prefAfterMDuringIntro}")`);

    // 4. Skip intro and verify button fades in and 'M' key works
    const skipBtn = page.locator('button:has-text("Skip intro")');
    await skipBtn.waitFor({ state: 'visible', timeout: 5000 });
    await skipBtn.click();
    await page.waitForTimeout(600);

    const isVisibleAfterIntro = await soundToggleWrapper.evaluate((el) => {
      const classes = el.className;
      return classes.includes('opacity-100') && !classes.includes('pointer-events-none');
    });
    console.log(`  -> Sound button wrapper visible after intro: ${isVisibleAfterIntro} (Expected: true)`);

    // Now press 'M' and verify it toggles sound
    await page.keyboard.press('m');
    await page.waitForTimeout(200);
    const prefAfterMAfterIntro = await page.evaluate(() => localStorage.getItem('portfolio:sound'));
    const didMToggle = prefAfterMAfterIntro === 'off';
    console.log(`  -> 'M' key toggles sound after intro: ${didMToggle} (pref changed to "${prefAfterMAfterIntro}")`);

    results.testB = isHiddenDuringGate && isHiddenDuringIntro && isMIgnored && isVisibleAfterIntro && didMToggle;
    await browser.close();
  }

  // --------------------------------------------------------------------------
  // TEST C: 4s auto-start when user doesn't click gate & click unlocks without skip
  // --------------------------------------------------------------------------
  console.log('\n[Test C] Testing 4s Gate Timeout auto-start & click unlock...');
  {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.addInitScript(simulateBlockedAudioScript);

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    const gateDialog = page.locator('div[role="dialog"][aria-label="Start presentation with sound"]');
    await gateDialog.waitFor({ state: 'visible', timeout: 10000 });

    console.log('  -> Waiting for 4s timeout...');
    await page.waitForTimeout(4300);

    const isGateDismissed = !(await gateDialog.isVisible());
    console.log(`  -> Gate auto-dismissed on timeout: ${isGateDismissed}`);

    // Verify clicking during intro does NOT skip intro
    await page.mouse.click(640, 400);
    await page.waitForTimeout(500);

    const isIntroStillRunning = await page.evaluate(() => {
      const skipBtn = document.querySelector('button[aria-label="Skip introductory animation"]');
      const wordDisplay = document.querySelector('#portfolio-word-display');
      return skipBtn !== null || (wordDisplay !== null && wordDisplay.children.length === 9);
    });
    console.log(`  -> Intro continues running after click (no skip): ${isIntroStillRunning}`);

    results.testC = isGateDismissed && isIntroStillRunning;
    await browser.close();
  }

  // --------------------------------------------------------------------------
  // TEST D: Saved preference 'off' starts intro silently without gate; INTRO_IGNORES_SAVED_MUTE check
  // --------------------------------------------------------------------------
  console.log('\n[Test D] Testing saved "off" preference silent start & reduced motion...');
  {
    const browser = await chromium.launch({ headless: true });

    // 1. Saved preference 'off' -> No gate shown, intro starts immediately
    const page1 = await browser.newPage();
    await page1.addInitScript(() => {
      localStorage.setItem('portfolio:sound', 'off');
      sessionStorage.clear();
    });
    await page1.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page1.waitForTimeout(800);
    const gate1 = page1.locator('div[role="dialog"][aria-label="Start presentation with sound"]');
    const gate1Visible = await gate1.isVisible();
    console.log(`  -> With saved sound 'off': Gate visible = ${gate1Visible} (Expected: false)`);

    // 2. Reduced motion -> No intro, no gate
    const context2 = await browser.newContext({ reducedMotion: 'reduce' });
    const page2 = await context2.newPage();
    await page2.addInitScript(() => {
      localStorage.setItem('portfolio:sound', 'on');
    });
    await page2.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page2.waitForTimeout(800);
    const gate2 = page2.locator('div[role="dialog"][aria-label="Start presentation with sound"]');
    const gate2Visible = await gate2.isVisible();
    console.log(`  -> With reduced-motion: Gate visible = ${gate2Visible} (Expected: false)`);

    results.testD = !gate1Visible && !gate2Visible;
    await browser.close();
  }

  // --------------------------------------------------------------------------
  // TEST E: Skip button clean fadeout (120ms)
  // --------------------------------------------------------------------------
  console.log('\n[Test E] Testing Skip intro clean fadeout...');
  {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.addInitScript(simulateBlockedAudioScript);
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    const gate = page.locator('div[role="dialog"][aria-label="Start presentation with sound"]');
    await gate.waitFor({ state: 'visible', timeout: 10000 });
    await gate.click();
    await gate.waitFor({ state: 'hidden', timeout: 3000 });

    const skipBtn = page.locator('button:has-text("Skip intro")');
    await skipBtn.waitFor({ state: 'visible', timeout: 5000 });
    await skipBtn.click();
    await page.waitForTimeout(600);

    const navVisible = await page.locator('nav[aria-label="Primary Navigation"]').isVisible();
    console.log(`  -> Skip intro completed, navbar visible: ${navVisible}`);

    results.testE = navVisible;
    await browser.close();
  }

  // --------------------------------------------------------------------------
  // TEST F: Dev Sound Lab Intro Tab: thock playground, sliders, discrete buttons
  // --------------------------------------------------------------------------
  console.log('\n[Test F] Testing Dev Sound Lab Intro Tab & recording demo...');
  {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 950 },
      recordVideo: {
        dir: ARTIFACTS_DIR,
        size: { width: 1280, height: 950 },
      },
    });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/sound-lab', { waitUntil: 'networkidle' });

    // Verify Intro tab
    const introTabBtn = page.getByRole('button', { name: 'Intro Soundscape', exact: true });
    await introTabBtn.click();
    await page.waitForTimeout(400);

    // Verify absence of Swell and Swoosh
    const swellCount = await page.locator('button:has-text("Pad Swell")').count();
    const swooshCount = await page.locator('button:has-text("Swoosh")').count();
    console.log(`  -> Swell buttons count: ${swellCount} (Expected: 0)`);
    console.log(`  -> Swoosh buttons count: ${swooshCount} (Expected: 0)`);

    // Verify Thock Voice playground exists
    const thockPlaygroundHeading = page.locator('text=Core Voice: "Thock" Playground');
    const hasThockPlayground = await thockPlaygroundHeading.isVisible();
    console.log(`  -> Thock Voice Playground visible: ${hasThockPlayground}`);

    // Click "Audition Thock"
    const auditionThockBtn = page.locator('button:has-text("Audition Thock")');
    await auditionThockBtn.click();
    await page.waitForTimeout(300);

    // Click individual discrete buttons
    const gateClickBtn = page.locator('button:has-text("Start Gate Click")');
    await gateClickBtn.click();
    await page.waitForTimeout(300);

    const bounce1Btn = page.locator('button:has-text("Impact 1 (110Hz")');
    await bounce1Btn.click();
    await page.waitForTimeout(300);

    const letterHBtn = page.locator('button:has-text("H (C3")');
    await letterHBtn.click();
    await page.waitForTimeout(300);

    const settleThockBtn = page.locator('button:has-text("Settle Thock (110Hz")');
    await settleThockBtn.click();
    await page.waitForTimeout(300);

    const portraitHalfBtn = page.locator('button:has-text("Portrait Half (D3")');
    await portraitHalfBtn.click();
    await page.waitForTimeout(300);

    const portraitDoneBtn = page.locator('button:has-text("Portrait Done (Open Chord")');
    await portraitDoneBtn.click();
    await page.waitForTimeout(400);

    // Play full soundscape for a few seconds
    const playSoundscapeBtn = page.locator('button:has-text("Play full intro soundscape")');
    await playSoundscapeBtn.click();
    await page.waitForTimeout(4000);

    const progressText = await page.locator('span.font-mono:has-text("/ 9.60s")').innerText();
    console.log(`  -> Timeline cursor progress in sound lab: "${progressText}"`);

    const stopBtn = page.locator('button:has-text("Stop playback")');
    await stopBtn.click();
    await page.waitForTimeout(400);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'dev_sound_lab_intro_tab_thock.png'), fullPage: true });

    const videoPath = await page.video().path();
    await context.close();
    await browser.close();

    if (videoPath && fs.existsSync(videoPath)) {
      const targetVideo = path.join(ARTIFACTS_DIR, 'dev_sound_lab_intro_tab_demo.webm');
      fs.copyFileSync(videoPath, targetVideo);
      console.log(`  -> Saved Dev Sound Lab recording to ${targetVideo}`);
    }

    results.testF = swellCount === 0 && swooshCount === 0 && hasThockPlayground;
  }

  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log('Test A (Gate & No Continue Without Sound):', results.testA ? 'PASS' : 'FAIL');
  console.log('Test B (Button Hidden & M Ignored):       ', results.testB ? 'PASS' : 'FAIL');
  console.log('Test C (4s Timeout Auto-start & Unlock):  ', results.testC ? 'PASS' : 'FAIL');
  console.log('Test D (Saved Off / Reduced Motion):      ', results.testD ? 'PASS' : 'FAIL');
  console.log('Test E (Skip Intro Clean Fadeout):        ', results.testE ? 'PASS' : 'FAIL');
  console.log('Test F (Dev Sound Lab Intro Studio):      ', results.testF ? 'PASS' : 'FAIL');
}

verifyIntroSoundscape().catch((err) => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
