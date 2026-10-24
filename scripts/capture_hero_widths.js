import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/1f9f5805-9b22-48cc-b50f-157ceb35e9ef';

const VIEWPORTS = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1920', width: 1920, height: 1080 },
];

async function main() {
  console.log('Testing Hero at 390, 768, 1440, and 1920 widths...');
  const browser = await chromium.launch({ headless: true });

  const results = [];

  for (const vp of VIEWPORTS) {
    console.log(`\nTesting viewport ${vp.name} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      colorScheme: 'dark',
    });
    const page = await context.newPage();

    await page.goto('http://localhost:5173');
    await page.evaluate(() => document.documentElement.classList.add('dark'));

    // Skip intro by pressing Escape
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000); // allow spring and particles to settle into final state

    // Measure PORTFOLIO text bounds
    const metrics = await page.evaluate(() => {
      const el = document.querySelector('#portfolio-word-display');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        text: el.textContent?.trim(),
        fontSize: style.fontSize,
        rectLeft: rect.left,
        rectRight: rect.right,
        rectWidth: rect.width,
        windowWidth: window.innerWidth,
        leftMargin: rect.left,
        rightMargin: window.innerWidth - rect.right,
        isFullyVisible: rect.left >= 16 && (window.innerWidth - rect.right) >= 16,
      };
    });

    console.log(`Metrics for ${vp.name}px:`, JSON.stringify(metrics, null, 2));
    results.push({ viewport: vp.name, ...metrics });

    const screenshotPath = path.join(ARTIFACT_DIR, `hero_final_${vp.name}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot: ${screenshotPath}`);

    await context.close();
  }

  await browser.close();
  console.log('\nAll tests complete! Summary:');
  console.table(results);
}

main().catch((err) => {
  console.error('Error in capture script:', err);
  process.exit(1);
});
