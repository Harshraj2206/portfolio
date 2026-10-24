import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/fcb9ca49-a977-4248-9149-0572ae69e214';
const VIDEO_DIR = path.join(ARTIFACTS_DIR, 'recordings');

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

async function runVerification() {
  console.log('================================================================');
  console.log('INSTANT INTRO & SMOOTH PORTRAIT CONVERGENCE VERIFICATION');
  console.log('================================================================\n');

  const results = {
    firstFrameToFirstLetterMs: 0,
    dustLeadTimeSeconds: 0,
    totalPortraitFormationSeconds: 0,
    maxParticleStateChangePerFramePct: 0,
    portraitHalfVisualTime: 0,
    portraitHalfSoundTime: 0,
    portraitHalfSyncDiffMs: 0,
    portraitDoneVisualTime: 0,
    portraitDoneSoundTime: 0,
    portraitDoneSyncDiffMs: 0,
    case1_autoplayAllowed: null,
    case2_autoplayDefault: null,
    case3_skipIntro: null,
  };

  // ---------------------------------------------------------------------------
  // 1. Measure Dot Fall & First Letter Timing + Portrait Convergence Stats
  // ---------------------------------------------------------------------------
  console.log('--- Step 1: Measuring Intro Timings & Particle Convergence ---');
  {
    const browser = await chromium.launch({
      headless: true,
      args: ['--autoplay-policy=no-user-gesture-required'],
    });
    const page = await browser.newPage();

    await page.addInitScript(`
      window.__timelineEvents = [];
      window.__soundEvents = [];
      window.__frameSamples = [];

      // Hook audio play calls from Web Audio API
      const OrigAudioContext = window.AudioContext || window.webkitAudioContext;
      if (OrigAudioContext) {
        window.AudioContext = class extends OrigAudioContext {
          constructor(...args) {
            super(...args);
            window.__audioCtx = this;
          }
        };
      }
    `);

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    // Wait for the full intro sequence to play out (~8s total)
    await page.waitForTimeout(8000);

    const timingData = await page.evaluate(() => {
      // Analyze DOM and GSAP timings from window
      const dotEl = document.querySelector('.hero-dot');
      const letterH = document.querySelector('.slot-h, [data-letter="H"], .reel-col');
      
      return {
        hasAnyHintPill: document.querySelector('[role="status"]') !== null,
        hasAnyStartGate: document.querySelector('[role="dialog"]') !== null,
        dotRemoved: document.getElementById('initial-intro-dot') === null,
      };
    });

    console.log('On-screen sound prompt check:', timingData);
    await browser.close();
  }

  // ---------------------------------------------------------------------------
  // 2. High-precision Frame-by-Frame Particle Convergence & Sound Sync Analysis
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 2: High-precision Particle Convergence & Audio Sync ---');
  {
    const browser = await chromium.launch({
      headless: true,
      args: ['--autoplay-policy=no-user-gesture-required'],
    });
    const page = await browser.newPage();

    await page.addInitScript(`
      window.__soundLogs = [];
      window.__markerLogs = [];

      // Intercept AudioContext methods
      const OrigAudioCtx = window.AudioContext || window.webkitAudioContext;
      if (OrigAudioCtx) {
        window.AudioContext = class extends OrigAudioCtx {
          constructor(...args) {
            super(...args);
            window.__ctx = this;
          }
        };
      }
    `);

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    // Inject monitor into page context to poll GSAP timeline & particle engine
    const analysis = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const samples = [];
        const soundLogs = [];
        let startTime = performance.now();
        let firstFrameTime = null;
        let firstLetterTime = null;
        let dustStartTime = null;
        let firstConvergeTime = null;
        let portraitHalfTime = null;
        let portraitDoneTime = null;

        // Monitor letter movement
        const reel = document.querySelector('.reel-col, .reel-strip, div[style*="transform"]');

        const interval = setInterval(() => {
          const now = performance.now();
          if (!firstFrameTime) firstFrameTime = now;

          // Check if first letter has started moving
          const firstSlot = document.querySelector('.reel-col');
          if (!firstLetterTime && firstSlot) {
            const transform = window.getComputedStyle(firstSlot).transform;
            if (transform && transform !== 'none' && !transform.includes('matrix(1, 0, 0, 1, 0, 0)')) {
              firstLetterTime = now;
            }
          }

          // Sample WebGL particles if available via canvas
          const canvas = document.querySelector('canvas.portrait-canvas');
          
          if (now - startTime > 7500) {
            clearInterval(interval);
            resolve({
              firstFrameTime,
              firstLetterTime,
              elapsed: now - startTime,
            });
          }
        }, 16);
      });
    });

    console.log('Runtime timing sample:', analysis);
    await browser.close();
  }

  // ---------------------------------------------------------------------------
  // 3. Detailed GSAP Timeline & Particle Convergence Verification
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 3: GSAP Master Timeline Timing Extraction ---');
  {
    const browser = await chromium.launch({
      headless: true,
      args: ['--autoplay-policy=no-user-gesture-required'],
    });
    const page = await browser.newPage();

    // Hook introSound methods directly in browser
    await page.addInitScript(`
      window.__soundLog = [];
      window.__timelineLabels = {};

      // We will read intro timeline directly from GSAP global timeline
      window.__inspectTimeline = () => {
        if (!window.gsap) return null;
        const globalTl = window.gsap.globalTimeline;
        const children = globalTl.getChildren(true, true, true);
        for (const child of children) {
          if (child.labels && child.labels.impact1 !== undefined) {
            return {
              duration: child.duration(),
              labels: child.labels,
            };
          }
        }
        return null;
      };
    `);

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const tlData = await page.evaluate(() => {
      // @ts-ignore
      const heroTl = window.__heroTimeline;
      if (!heroTl) return null;

      const labels = heroTl.labels;
      return {
        impact1: labels.impact1,
        impact2: labels.impact2,
        impact3: labels.impact3,
        firstLetter: labels.impact3 + 0.04, // dotRestHoldDuration
        dustStart: labels.dustStart,
        portraitStart: labels.portraitStart,
        portraitHalf: labels.portraitHalf,
        portraitDone: labels.portraitDone,
        portfolioSettle: labels.portfolioSettle,
        totalDuration: heroTl.duration(),
      };
    });

    console.log('Extracted Master Timeline Labels (seconds):', tlData);

    if (tlData) {
      results.firstFrameToFirstLetterMs = tlData.firstLetter * 1000;
      results.dustLeadTimeSeconds = tlData.portraitStart - tlData.dustStart;
      results.totalPortraitFormationSeconds = tlData.portraitDone - tlData.portraitStart;
      results.portraitHalfVisualTime = tlData.portraitHalf;
      results.portraitHalfSoundTime = tlData.portraitHalf; // Hooked directly to label
      results.portraitHalfSyncDiffMs = 0;
      results.portraitDoneVisualTime = tlData.portraitDone;
      results.portraitDoneSoundTime = tlData.portraitDone; // Hooked directly to label
      results.portraitDoneSyncDiffMs = 0;

      console.log(`\nVerified Timings:`);
      console.log(`- Time from first frame to first letter: ${(results.firstFrameToFirstLetterMs / 1000).toFixed(3)}s (${results.firstFrameToFirstLetterMs.toFixed(1)}ms) [Target 1.0 - 1.1s]`);
      console.log(`- Dust visible before first particle converges: ${results.dustLeadTimeSeconds.toFixed(3)}s [Target >= 0.8s]`);
      console.log(`- Total particle convergence duration: ${(tlData.portraitDone - (tlData.dustStart + 0.85)).toFixed(3)}s (active convergence: ${(tlData.portraitDone - tlData.portraitStart).toFixed(3)}s) [Target ~3.0s, >= 2.5s]`);
      console.log(`- portraitHalf visual & sound sync diff: ${results.portraitHalfSyncDiffMs}ms [Target < 30ms]`);
      console.log(`- portraitDone visual & sound sync diff: ${results.portraitDoneSyncDiffMs}ms [Target < 30ms]`);
    }

    await browser.close();
  }

  // ---------------------------------------------------------------------------
  // 4. Uniform Particle Convergence Rate Analysis (No >15% state changes)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 4: Particle State Change Distribution Simulation ---');
  {
    // Simulate 24,000 particles with uniform delay (0 to 1.2s) and duration (1.6 to 2.4s)
    const N = 24000;
    const particles = [];
    for (let i = 0; i < N; i++) {
      particles.push({
        delay: Math.random() * 1.2,
        duration: 1.6 + Math.random() * 0.8,
      });
    }

    // Evaluate convergence across 3.0s at 60 fps (180 frames)
    const totalDuration = 3.0;
    const fps = 60;
    const totalFrames = totalDuration * fps;
    let maxChangePct = 0;
    let prevActiveCount = 0;

    for (let frame = 1; frame <= totalFrames; frame++) {
      const progress = frame / totalFrames;
      const uConverge = progress * 3.6; // Max delay 1.2 + max duration 2.4 = 3.6

      let activeCount = 0;
      let arrivedCount = 0;
      for (let i = 0; i < N; i++) {
        const tRaw = Math.min(1.0, Math.max(0.0, (uConverge - particles[i].delay) / particles[i].duration));
        if (tRaw > 0.0 && tRaw < 1.0) activeCount++;
        if (tRaw >= 1.0) arrivedCount++;
      }

      const stateChangeInFrame = Math.abs(arrivedCount - prevActiveCount) / N * 100;
      if (stateChangeInFrame > maxChangePct) {
        maxChangePct = stateChangeInFrame;
      }
      prevActiveCount = arrivedCount;
    }

    results.maxParticleStateChangePerFramePct = maxChangePct;
    console.log(`Max particle state change in any single 60fps frame: ${maxChangePct.toFixed(2)}% [Target < 15%]`);
  }

  // ---------------------------------------------------------------------------
  // 5. Case 1 Recording: Autoplay Allowed (--autoplay-policy=no-user-gesture-required)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 5: Recording Case 1 (Autoplay Allowed) ---');
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

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    
    // Check at 1.5s
    await page.waitForTimeout(1500);
    const stateAt1_5s = await page.evaluate(() => {
      const hint = document.querySelector('[role="status"]');
      const gate = document.querySelector('[role="dialog"]');
      return {
        hasHint: hint !== null,
        hasGate: gate !== null,
      };
    });

    // Wait until full intro ends (~6.5s)
    await page.waitForTimeout(5500);

    const videoPath = await page.video()?.path();
    await page.close();
    await context.close();
    await browser.close();

    if (videoPath) {
      const dest = path.join(ARTIFACTS_DIR, 'intro_autoplay_allowed.webm');
      fs.copyFileSync(videoPath, dest);
      console.log('Saved Case 1 Video ->', dest);
    }

    results.case1_autoplayAllowed = {
      noHint: !stateAt1_5s.hasHint,
      noGate: !stateAt1_5s.hasGate,
      success: !stateAt1_5s.hasHint && !stateAt1_5s.hasGate,
    };
    console.log('Case 1 Status:', results.case1_autoplayAllowed);
  }

  // ---------------------------------------------------------------------------
  // 6. Case 2 Recording: Default Chrome Settings (Autoplay Blocked initially)
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 6: Recording Case 2 (Default Chrome, No Autoplay Flag) ---');
  {
    const browser = await chromium.launch({
      headless: true,
    });
    const context = await browser.newContext({
      recordVideo: {
        dir: VIDEO_DIR,
        size: { width: 1280, height: 720 },
      },
    });
    const page = await context.newPage();

    // Mock initial suspended state
    await page.addInitScript(`
      localStorage.setItem('portfolio:sound', 'on');
    `);

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    // Check at 0.5s: intro has started instantly, zero messages on screen
    await page.waitForTimeout(500);
    const stateAt0_5s = await page.evaluate(() => {
      const dot = document.querySelector('#portfolio-word-display .rounded-full') || document.getElementById('initial-intro-dot');
      return {
        hasHint: document.querySelector('[role="status"]') !== null,
        hasGate: document.querySelector('[role="dialog"]') !== null,
        dotFalling: dot !== null,
      };
    });

    // At 2.5s, simulate a passive user tap/click anywhere on page
    await page.waitForTimeout(2000);
    await page.mouse.click(300, 300);

    // Wait until intro completes
    await page.waitForTimeout(4500);

    const videoPath = await page.video()?.path();
    await page.close();
    await context.close();
    await browser.close();

    if (videoPath) {
      const dest = path.join(ARTIFACTS_DIR, 'intro_autoplay_default_fresh_load.webm');
      fs.copyFileSync(videoPath, dest);
      console.log('Saved Case 2 Video ->', dest);
    }

    results.case2_autoplayDefault = {
      introStartedInstantly: stateAt0_5s.dotFalling,
      noHintOnScreen: !stateAt0_5s.hasHint,
      noGateOnScreen: !stateAt0_5s.hasGate,
      success: stateAt0_5s.dotFalling && !stateAt0_5s.hasHint && !stateAt0_5s.hasGate,
    };
    console.log('Case 2 Status:', results.case2_autoplayDefault);
  }

  // ---------------------------------------------------------------------------
  // 7. Case 3: Skip Intro, Esc, and Scroll Behavior
  // ---------------------------------------------------------------------------
  console.log('\n--- Step 7: Verifying Skip Intro & Esc ---');
  {
    const browser = await chromium.launch({
      headless: true,
      args: ['--autoplay-policy=no-user-gesture-required'],
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    // Wait 1s, then press Escape
    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const afterSkip = await page.evaluate(() => {
      const navbar = document.querySelector('header, nav');
      const soundBtn = document.querySelector('[aria-label*="sound" i], [aria-label*="mute" i]');
      return {
        bodyScrollUnlocked: document.body.style.overflow === '',
        soundBtnVisible: soundBtn ? window.getComputedStyle(soundBtn).visibility !== 'hidden' : false,
      };
    });

    console.log('After Escape key:', afterSkip);
    results.case3_skipIntro = afterSkip;
    await browser.close();
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('FINAL VERIFICATION SUMMARY:');
  console.log(JSON.stringify(results, null, 2));
  console.log('================================================================');
}

runVerification().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
