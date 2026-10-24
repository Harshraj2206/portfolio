import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  try {
    const skip = await page.waitForSelector('button:has-text("Skip intro")', { timeout: 2500 });
    if (skip) await skip.click();
  } catch {}
  await page.waitForTimeout(1000);

  const projectsEl = await page.$('#projects');
  await projectsEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const baseScroll = await page.evaluate(() => window.scrollY);
  console.log('Base scroll at #projects:', baseScroll);

  for (let s = 300; s <= 2000; s += 150) {
    await page.evaluate((y) => window.scrollTo(0, y), baseScroll + s);
    await page.waitForTimeout(80);
    const info = await page.evaluate(() => {
      const cards = document.querySelectorAll('#projects .glass-card-opaque');
      if (cards.length < 2) return null;
      const c1 = cards[0].getBoundingClientRect();
      const c2 = cards[1].getBoundingClientRect();
      const inner = cards[0].querySelector('.transition-opacity');
      return {
        scrollY: window.scrollY,
        c1Top: Math.round(c1.top),
        c2Top: Math.round(c2.top),
        c2ToC1TopDiff: Math.round(c2.top - c1.top),
        c1ContentOpacity: inner ? parseFloat(window.getComputedStyle(inner).opacity).toFixed(3) : null,
      };
    });
    console.log(info);
  }

  await browser.close();
}

main().catch(console.error);
