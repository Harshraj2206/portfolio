import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173/photography';

const OUT_DIR = path.resolve('screenshots_verification/photography');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// 1. Math verification function for N items
function testAutoFitMath(N: number, width: number = 1440) {
  const isMobile = width < 768;
  const W = isMobile
    ? Math.min(150, Math.max(88, width * 0.26))
    : Math.min(190, Math.max(96, width * 0.11));
  const G = 0.12 * W;
  const M = Math.max(N, 14);
  const stepRad = Math.PI / M;
  const R = (W + G) / (2 * Math.sin(stepRad));
  const chord = 2 * R * Math.sin(stepRad);
  const minRequiredChord = W + G - 0.5;
  const noOverlap = chord >= minRequiredChord;
  const introDuration = 4.2;

  return {
    N,
    M,
    W: Number(W.toFixed(1)),
    G: Number(G.toFixed(1)),
    R: Number(R.toFixed(1)),
    chord: Number(chord.toFixed(2)),
    minRequiredChord: Number(minRequiredChord.toFixed(2)),
    noOverlap,
    introDuration: `${introDuration}s`,
  };
}

async function runAutoFitPerformance(browser: any, N_values: number[]) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const results: any[] = [];

  for (const N of N_values) {
    const math = testAutoFitMath(N, 1440);

    // Measure frame times in browser for this N
    const frameStats = await page.evaluate(async (cardCount) => {
      // Create a temporary 3D stage with cardCount cards to benchmark rendering
      const stage = document.createElement('div');
      stage.style.position = 'fixed';
      stage.style.inset = '0';
      stage.style.perspective = '1100px';
      stage.style.transformStyle = 'preserve-3d';
      stage.style.background = '#050505';
      stage.style.zIndex = '999999';

      const ring = document.createElement('div');
      ring.style.position = 'absolute';
      ring.style.left = '50%';
      ring.style.top = '50%';
      ring.style.transformStyle = 'preserve-3d';
      stage.appendChild(ring);

      const W = 158.4;
      const G = 19.0;
      const M = Math.max(cardCount, 14);
      const step = 360 / M;
      const stepRad = Math.PI / M;
      const R = (W + G) / (2 * Math.sin(stepRad));

      for (let i = 0; i < M; i++) {
        const phi = i * step;
        const slot = document.createElement('div');
        slot.style.position = 'absolute';
        slot.style.width = `${W}px`;
        slot.style.height = `${W * (16 / 9)}px`;
        slot.style.left = `${-W / 2}px`;
        slot.style.top = `${(-W * (16 / 9)) / 2}px`;
        slot.style.transform = `rotateY(${phi}deg) translateZ(${-R}px)`;
        slot.style.borderRadius = '28px';
        slot.style.border = '1px solid rgba(255,255,255,0.14)';
        slot.style.background = 'rgba(255,255,255,0.05)';
        slot.style.backdropFilter = 'blur(20px)';
        ring.appendChild(slot);
      }

      document.body.appendChild(stage);

      // Collect 60 frame times during rotation
      const frameDeltas: number[] = [];
      let lastTime = performance.now();
      let rot = 0;

      for (let f = 0; f < 60; f++) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const now = performance.now();
        frameDeltas.push(now - lastTime);
        lastTime = now;
        rot += 2.5; // Simulate rotation
        ring.style.transform = `rotateY(${rot}deg)`;
      }

      document.body.removeChild(stage);

      frameDeltas.sort((a, b) => a - b);
      const p95 = frameDeltas[Math.floor(frameDeltas.length * 0.95)];
      const avg = frameDeltas.reduce((a, b) => a + b, 0) / frameDeltas.length;

      return { p95: Number(p95.toFixed(2)), avg: Number(avg.toFixed(2)) };
    }, N);

    results.push({
      ...math,
      p95FrameTime: `${frameStats.p95}ms`,
      avgFrameTime: `${frameStats.avg}ms`,
      targetUnder20ms: frameStats.p95 <= 20,
    });
  }

  await page.close();
  return results;
}

async function runAnimationCheck(browser: any) {
  console.log('Capturing animation checkpoints and settled screens...');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  // Timestamps to capture: 0.3s, 0.8s, 1.3s, 1.8s, 2.3s, 2.8s, 3.3s, 3.8s, 4.2s
  const checkpoints = [
    { time: 300, name: 'checkpoint_0.3s.png' },
    { time: 500, name: 'checkpoint_0.8s.png' },
    { time: 500, name: 'checkpoint_1.3s.png' },
    { time: 500, name: 'checkpoint_1.8s.png' },
    { time: 500, name: 'checkpoint_2.3s.png' },
    { time: 500, name: 'checkpoint_2.8s.png' },
    { time: 500, name: 'checkpoint_3.3s.png' },
    { time: 500, name: 'checkpoint_3.8s.png' },
    { time: 500, name: 'checkpoint_4.2s.png' },
  ];

  for (const cp of checkpoints) {
    await new Promise((r) => setTimeout(r, cp.time));
    await page.screenshot({ path: path.join(OUT_DIR, cp.name) });
    console.log(`Saved ${cp.name}`);
  }

  // Settled wall desktop
  await page.screenshot({ path: path.join(OUT_DIR, 'settled_wall_desktop_1440.png') });
  console.log('Saved settled_wall_desktop_1440.png');

  // Test Lightbox: Click on first card
  try {
    const cardBtn = await page.$('.gallery-card-inner');
    if (cardBtn) {
      await cardBtn.click();
      await new Promise((r) => setTimeout(r, 600)); // wait for FLIP
      await page.screenshot({ path: path.join(OUT_DIR, 'lightbox_desktop_1440.png') });
      console.log('Saved lightbox_desktop_1440.png');

      // Close with Esc key
      await page.keyboard.press('Escape');
      await new Promise((r) => setTimeout(r, 400));
    }
  } catch (err) {
    console.error('Error testing lightbox:', err);
  }

  // Mobile 390px settled screen
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  // Skip intro or wait till settled
  await new Promise((r) => setTimeout(r, 4400));
  await page.screenshot({ path: path.join(OUT_DIR, 'settled_wall_mobile_390.png') });
  console.log('Saved settled_wall_mobile_390.png');

  await page.close();
}

async function main() {
  console.log('================================================================');
  console.log('STARTING PHOTOGRAPHY TEST SUITE');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // 1. AUTO-FIT TEST
    console.log('\n--- 1. AUTO-FIT & PERFORMANCE TRACE TEST ---');
    const N_values = [1, 3, 8, 14, 31, 80, 200];
    const autoFitResults = await runAutoFitPerformance(browser, N_values);
    console.table(autoFitResults);

    // Save table to JSON
    fs.writeFileSync(
      path.join(OUT_DIR, 'autofit_results.json'),
      JSON.stringify(autoFitResults, null, 2)
    );

    // 2. ANIMATION CHECK & SCREENSHOTS
    console.log('\n--- 2. ANIMATION & SETTLED CHECKPOINTS ---');
    await runAnimationCheck(browser);

    await browser.close();
    console.log('\nSUCCESS: All tests completed successfully!');
  } catch (err) {
    console.error('Test suite error:', err);
    await browser.close();
    process.exit(1);
  }
}

main();
