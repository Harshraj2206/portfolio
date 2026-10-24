import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/8f74d384-3a58-46be-87bb-22b7cb19de15';
const url = process.argv[2] || 'http://localhost:4173';

async function measure() {
  console.log(`Profiling scroll frames on ${url}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  try {
    const skip = await page.waitForSelector('button:has-text("Skip intro")', { timeout: 2000 });
    if (skip) await skip.click();
  } catch {}
  await page.waitForTimeout(1000);

  const metrics = await page.evaluate(async () => {
    return new Promise((resolve) => {
      const deltas = [];
      let lastTime = performance.now();
      let active = true;

      function frameLoop(now) {
        const delta = now - lastTime;
        lastTime = now;
        deltas.push(delta);
        if (active) {
          requestAnimationFrame(frameLoop);
        } else {
          const valid = deltas.slice(3); // Warmup frames dropped
          const max = Math.max(...valid);
          const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
          const slow = valid.filter((d) => d > 24);
          resolve({
            totalFrames: valid.length,
            maxFrameTimeMs: max,
            avgFrameTimeMs: avg,
            slowFramesCount: slow.length,
            slowFramesPct: ((slow.length / valid.length) * 100).toFixed(2),
            allFramesUnder24: slow.length === 0,
          });
        }
      }

      requestAnimationFrame(frameLoop);

      // Perform user-realistic smooth scroll down over 4 seconds
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const start = performance.now();
      const dur = 4000;

      function smoothStep() {
        const elapsed = performance.now() - start;
        const p = Math.min(elapsed / dur, 1);
        // EaseInOutQuad
        const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
        window.scrollTo(0, maxScroll * ease);

        if (p < 1) {
          requestAnimationFrame(smoothStep);
        } else {
          setTimeout(() => {
            active = false;
          }, 200);
        }
      }
      requestAnimationFrame(smoothStep);
    });
  });

  console.log('\n--- Production Scroll Performance Results ---');
  console.log('Total Frames Measured:', metrics.totalFrames);
  console.log(`Max Frame Time: ${metrics.maxFrameTimeMs.toFixed(2)} ms`);
  console.log(`Average Frame Time: ${metrics.avgFrameTimeMs.toFixed(2)} ms (~${(1000 / metrics.avgFrameTimeMs).toFixed(1)} FPS)`);
  console.log(`Frames > 24ms: ${metrics.slowFramesCount} (${metrics.slowFramesPct}%)`);
  console.log('Scroll frame pass requirement (no frames > 24ms):', metrics.allFramesUnder24 ? 'PASSED' : 'CHECK');

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'scroll_frame_results.json'),
    JSON.stringify(metrics, null, 2)
  );

  await context.close();
  await browser.close();
}

measure().catch((e) => {
  console.error('Measurement failed:', e);
  process.exit(1);
});
