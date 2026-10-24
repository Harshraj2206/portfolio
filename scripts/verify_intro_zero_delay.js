import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/fcb9ca49-a977-4248-9149-0572ae69e214';
const VIDEO_DIR = path.join(ARTIFACTS_DIR, 'recordings');

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

async function runVerification() {
  console.log('=====================================================');
  console.log('ZERO-DELAY INTRO & SOUND UNLOCK VERIFICATION');
  console.log('=====================================================\n');

  const report = {
    firstMovementUnthrottledNavMs: 0,
    firstMovementUnthrottledAfterFpMs: 0,
    firstMovementThrottled4xNavMs: 0,
    firstMovementThrottled4xAfterFpMs: 0,
    caseA_AutoplayAllowed: null,
    caseB_AutoplayBlockedNoClick: null,
    caseC1_EarlyRestart1_5s: null,
    caseC2_LateContinue5s: null,
    caseD_GateMode: null,
    caseE_SavedMuteOff: null,
  };

  const instrumentPageScript = `
    window.__introEvents = [];
    window.__introAudioLogs = [];

    // Track console timing log
    const origLog = console.log;
    console.log = function(...args) {
      origLog.apply(console, args);
      const str = args.join(' ');
      if (str.includes('[Intro] Time from navigation start to dot')) {
        window.__dotFirstMovementLog = str;
      }
      if (str.includes('[Intro] Time after first paint to dot')) {
        window.__dotAfterFpLog = str;
      }
    };

    // Track audio context creation and resume
    const OrigAudioContext = window.AudioContext || window.webkitAudioContext;
    if (OrigAudioContext) {
      window.AudioContext = class extends OrigAudioContext {
        constructor(...args) {
          super(...args);
          window.__audioCtxInstance = this;
          window.__introAudioLogs.push({
            type: 'created',
            state: this.state,
            time: performance.now()
          });

          const origResume = this.resume.bind(this);
          this.resume = async () => {
            const res = await origResume();
            window.__introAudioLogs.push({
              type: 'resumed',
              state: this.state,
              time: performance.now()
            });
            return res;
          };
        }
      };
    }
  `;

  // -------------------------------------------------------------------------
  // 1. Measure First Dot Movement (Unthrottled vs 4x CPU Throttling)
  // -------------------------------------------------------------------------
  console.log('--- 1. Measuring Time to First Dot Movement ---');

  // 1a. Unthrottled
  {
    const browser = await chromium.launch({
      headless: true,
      args: ['--autoplay-policy=no-user-gesture-required'],
    });
    const page = await browser.newPage();
    await page.addInitScript(instrumentPageScript);

    let navTime = 0;
    let fpTime = 0;
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[Intro] Time from navigation start to dot\'s first movement:')) {
        const match = text.match(/([\d.]+)ms/);
        if (match) navTime = parseFloat(match[1]);
      }
      if (text.includes('[Intro] Time after first paint to dot\'s first movement:')) {
        const match = text.match(/([\d.]+)ms/);
        if (match) fpTime = parseFloat(match[1]);
      }
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    report.firstMovementUnthrottledNavMs = navTime;
    report.firstMovementUnthrottledAfterFpMs = fpTime;
    console.log(`[Unthrottled] Time from nav start: ${navTime.toFixed(1)}ms | Time after first paint: ${fpTime.toFixed(1)}ms (Target < 150ms)`);

    const initialTransitionClean = await page.evaluate(() => {
      return {
        initialDotRemoved: document.getElementById('initial-intro-dot') === null,
        initialVignetteRemoved: document.getElementById('initial-intro-vignette') === null,
      };
    });
    console.log('Critical inline dot & vignette transition clean:', initialTransitionClean);
    await browser.close();
  }

  // 1b. 4x CPU Throttled
  {
    const browser = await chromium.launch({
      headless: true,
      args: ['--autoplay-policy=no-user-gesture-required'],
    });
    const page = await browser.newPage();
    await page.addInitScript(instrumentPageScript);

    const client = await page.context().newCDPSession(page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    let navTime4x = 0;
    let fpTime4x = 0;
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[Intro] Time from navigation start to dot\'s first movement:')) {
        const match = text.match(/([\d.]+)ms/);
        if (match) navTime4x = parseFloat(match[1]);
      }
      if (text.includes('[Intro] Time after first paint to dot\'s first movement:')) {
        const match = text.match(/([\d.]+)ms/);
        if (match) fpTime4x = parseFloat(match[1]);
      }
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    report.firstMovementThrottled4xNavMs = navTime4x;
    report.firstMovementThrottled4xAfterFpMs = fpTime4x;
    console.log(`[4x Throttled] Time from nav start: ${navTime4x.toFixed(1)}ms | Time after first paint: ${fpTime4x.toFixed(1)}ms`);
    await browser.close();
  }

  // -------------------------------------------------------------------------
  // 2. Case A - Autoplay Allowed (--autoplay-policy=no-user-gesture-required)
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Case A: Autoplay Allowed ---');
  {
    const browser = await chromium.launch({
      headless: true,
      args: ['--autoplay-policy=no-user-gesture-required'],
    });
    const context = await browser.newContext({
      recordVideo: {
        dir: VIDEO_DIR,
        size: { width: 1280, height: 720 },
      },
    });
    const page = await context.newPage();
    await page.addInitScript(instrumentPageScript);

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const statusA = await page.evaluate(() => {
      const ctx = window.__audioCtxInstance;
      const hint = document.querySelector('[role="status"]');
      const gate = document.querySelector('[role="dialog"]');
      const soundBtn = document.querySelector('[aria-label*="sound" i], [aria-label*="mute" i]');
      const isSoundBtnHidden = soundBtn ? (
        window.getComputedStyle(soundBtn).visibility === 'hidden' ||
        window.getComputedStyle(soundBtn).opacity === '0' ||
        soundBtn.getAttribute('aria-hidden') === 'true'
      ) : true;

      return {
        ctxState: ctx ? ctx.state : 'null',
        hintVisible: hint !== null,
        gateVisible: gate !== null,
        soundBtnHidden: isSoundBtnHidden,
      };
    });

    console.log('Case A Status at 2s:', statusA);
    report.caseA_AutoplayAllowed = {
      ...statusA,
      success: statusA.ctxState === 'running' && !statusA.hintVisible && !statusA.gateVisible && statusA.soundBtnHidden,
    };

    await page.waitForTimeout(4000);
    const videoPath = await page.video()?.path();
    await page.close();
    await context.close();
    await browser.close();
    if (videoPath) {
      const dest = path.join(ARTIFACTS_DIR, 'intro_autoplay_allowed.webm');
      fs.copyFileSync(videoPath, dest);
      console.log('Saved Case A Video ->', dest);
    }
  }

  // -------------------------------------------------------------------------
  // 3. Case B - Autoplay Blocked, No Click
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Case B: Autoplay Blocked, No Click ---');
  {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      recordVideo: {
        dir: VIDEO_DIR,
        size: { width: 1280, height: 720 },
      },
    });
    const page = await context.newPage();

    await page.addInitScript(`
      localStorage.setItem('portfolio:sound', 'on');
      const OrigAudioContext = window.AudioContext || window.webkitAudioContext;
      if (OrigAudioContext) {
        window.AudioContext = class extends OrigAudioContext {
          constructor(...args) {
            super(...args);
            window.__audioCtxInstance = this;
            let internalState = 'suspended';
            Object.defineProperty(this, 'state', { get: () => internalState });
            this.resume = async () => {
              if (window.__userGestureHappened) {
                internalState = 'running';
                return;
              }
              return Promise.reject(new Error('Autoplay blocked'));
            };
          }
        };
      }
    `);

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    // 0.2s: Zero delay, no gate
    await page.waitForTimeout(200);
    const state02s = await page.evaluate(() => ({
      gatePresent: document.querySelector('[role="dialog"]') !== null,
      hintPresent: document.querySelector('[role="status"]') !== null,
    }));

    // 1.1s: Hint pill visible with speaker icon and text
    await page.waitForTimeout(900);
    const state1s = await page.evaluate(() => {
      const hint = document.querySelector('[role="status"]');
      return {
        hintVisible: hint !== null,
        hintText: hint ? hint.textContent.trim() : null,
      };
    });

    // 6.5s: Hint pill auto fades out
    await page.waitForTimeout(5400);
    const state65s = await page.evaluate(() => ({
      hintVisible: document.querySelector('[role="status"]') !== null,
    }));

    console.log('Case B zero delay (0.2s):', state02s);
    console.log('Case B hint pill visible (1.1s):', state1s);
    console.log('Case B hint pill auto-faded (6.5s):', state65s);

    report.caseB_AutoplayBlockedNoClick = {
      zeroDelayNoGate: !state02s.gatePresent,
      hintAppeared: state1s.hintVisible,
      hintFadedAt6s: !state65s.hintVisible,
      success: !state02s.gatePresent && state1s.hintVisible && !state65s.hintVisible,
    };

    const videoPath = await page.video()?.path();
    await page.close();
    await context.close();
    await browser.close();
    if (videoPath) {
      const dest = path.join(ARTIFACTS_DIR, 'intro_autoplay_blocked_no_click.webm');
      fs.copyFileSync(videoPath, dest);
      console.log('Saved Case B Video ->', dest);
    }
  }

  // -------------------------------------------------------------------------
  // 4. Case C1 - Autoplay Blocked, Click at ~1.5s (Early Restart with Sound)
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Case C1: Autoplay Blocked, Click at ~1.5s (Early Restart) ---');
  {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      recordVideo: {
        dir: VIDEO_DIR,
        size: { width: 1280, height: 720 },
      },
    });
    const page = await context.newPage();

    await page.addInitScript(`
      localStorage.setItem('portfolio:sound', 'on');
      window.__userGestureHappened = false;
      const OrigAudioContext = window.AudioContext || window.webkitAudioContext;
      if (OrigAudioContext) {
        window.AudioContext = class extends OrigAudioContext {
          constructor(...args) {
            super(...args);
            window.__audioCtxInstance = this;
            let internalState = 'suspended';
            Object.defineProperty(this, 'state', { get: () => internalState });
            this.resume = async () => {
              if (window.__userGestureHappened) {
                internalState = 'running';
                return;
              }
              return Promise.reject(new Error('Autoplay blocked'));
            };
          }
        };
      }
    `);

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Trigger user gesture
    await page.evaluate(() => { window.__userGestureHappened = true; });
    await page.click('body', { position: { x: 300, y: 300 } });
    await page.waitForTimeout(300);

    const restartStatus = await page.evaluate(() => {
      const ctx = window.__audioCtxInstance;
      const hint = document.querySelector('[role="status"]');
      return {
        ctxState: ctx ? ctx.state : 'null',
        hintFadedImmediately: hint === null,
      };
    });
    console.log('Case C1 (Restart at 1.5s):', restartStatus);

    report.caseC1_EarlyRestart1_5s = {
      ctxStateRunning: restartStatus.ctxState === 'running',
      hintFadedImmediately: restartStatus.hintFadedImmediately,
      success: restartStatus.ctxState === 'running' && restartStatus.hintFadedImmediately,
    };

    await page.waitForTimeout(4000);
    const videoPath = await page.video()?.path();
    await page.close();
    await context.close();
    await browser.close();
    if (videoPath) {
      const dest = path.join(ARTIFACTS_DIR, 'intro_early_restart_1_5s.webm');
      fs.copyFileSync(videoPath, dest);
      console.log('Saved Case C1 Video ->', dest);
    }
  }

  // -------------------------------------------------------------------------
  // 5. Case C2 - Autoplay Blocked, Click at ~5.0s (Late Continue + Ack Thock)
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Case C2: Autoplay Blocked, Click at ~5.0s (Late Continue) ---');
  {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      recordVideo: {
        dir: VIDEO_DIR,
        size: { width: 1280, height: 720 },
      },
    });
    const page = await context.newPage();

    await page.addInitScript(`
      localStorage.setItem('portfolio:sound', 'on');
      window.__userGestureHappened = false;
      const OrigAudioContext = window.AudioContext || window.webkitAudioContext;
      if (OrigAudioContext) {
        window.AudioContext = class extends OrigAudioContext {
          constructor(...args) {
            super(...args);
            window.__audioCtxInstance = this;
            let internalState = 'suspended';
            Object.defineProperty(this, 'state', { get: () => internalState });
            this.resume = async () => {
              if (window.__userGestureHappened) {
                internalState = 'running';
                return;
              }
              return Promise.reject(new Error('Autoplay blocked'));
            };
          }
        };
      }
    `);

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    // Gesture at 5.0s
    await page.evaluate(() => { window.__userGestureHappened = true; });
    await page.click('body', { position: { x: 300, y: 300 } });
    await page.waitForTimeout(500);

    const lateStatus = await page.evaluate(() => {
      const ctx = window.__audioCtxInstance;
      return { ctxState: ctx ? ctx.state : 'null' };
    });
    console.log('Case C2 (Continue at 5.0s):', lateStatus);

    report.caseC2_LateContinue5s = {
      ctxStateRunning: lateStatus.ctxState === 'running',
      success: lateStatus.ctxState === 'running',
    };

    await page.waitForTimeout(3500);
    const videoPath = await page.video()?.path();
    await page.close();
    await context.close();
    await browser.close();
    if (videoPath) {
      const dest = path.join(ARTIFACTS_DIR, 'intro_late_continue_5s.webm');
      fs.copyFileSync(videoPath, dest);
      console.log('Saved Case C2 Video ->', dest);
    }
  }

  // -------------------------------------------------------------------------
  // 6. Case D - Gate Mode (?intro_mode=gate)
  // -------------------------------------------------------------------------
  console.log('\n--- 6. Case D: Gate Mode (Waits indefinitely without timeout) ---');
  {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('http://localhost:5173/?intro_mode=gate', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Gate should be visible, no countdown ring
    const gateInfoInitial = await page.evaluate(() => {
      const gate = document.querySelector('[role="dialog"]');
      const ring = document.querySelector('circle[stroke-dashoffset]');
      return {
        gatePresent: gate !== null,
        hasCountdownRing: ring !== null,
      };
    });

    // Wait 4.5s (longer than the old 4s timeout) to confirm NO auto-timeout
    await page.waitForTimeout(4500);

    const gateAfter45s = await page.evaluate(() => {
      const gate = document.querySelector('[role="dialog"]');
      return { gateStillPresent: gate !== null };
    });

    // Click gate to start
    await page.click('[role="dialog"]');
    await page.waitForTimeout(500);

    const afterClick = await page.evaluate(() => {
      const gate = document.querySelector('[role="dialog"]');
      return { gateDismissed: gate === null };
    });

    console.log('Gate Initial:', gateInfoInitial);
    console.log('Gate after 4.5s (no timeout):', gateAfter45s);
    console.log('Gate after click (starts instantly):', afterClick);

    report.caseD_GateMode = {
      gatePresent: gateInfoInitial.gatePresent,
      noCountdownRing: !gateInfoInitial.hasCountdownRing,
      noTimeoutAfter45s: gateAfter45s.gateStillPresent,
      startsInstantlyOnClick: afterClick.gateDismissed,
      success: gateInfoInitial.gatePresent && !gateInfoInitial.hasCountdownRing && gateAfter45s.gateStillPresent && afterClick.gateDismissed,
    };

    await browser.close();
  }

  // -------------------------------------------------------------------------
  // 7. Case E - Saved Mute Preference = 'off'
  // -------------------------------------------------------------------------
  console.log('\n--- 7. Case E: Saved Mute Preference = "off" ---');
  {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.addInitScript(`
      localStorage.setItem('portfolio:sound', 'off');
    `);

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const offState = await page.evaluate(() => {
      const hint = document.querySelector('[role="status"]');
      return {
        hintPresent: hint !== null,
        soundPref: localStorage.getItem('portfolio:sound'),
      };
    });
    console.log('Case E (sound="off"):', offState);

    report.caseE_SavedMuteOff = {
      noHintPill: !offState.hintPresent,
      success: !offState.hintPresent,
    };

    await browser.close();
  }

  console.log('\n=====================================================');
  console.log('FINAL VERIFICATION REPORT DATA');
  console.log('=====================================================');
  console.log(JSON.stringify(report, null, 2));
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
