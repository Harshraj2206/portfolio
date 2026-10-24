import { chromium } from 'playwright';

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://localhost:5173/');

  try {
    const btn = await page.waitForSelector('button:has-text("Skip intro")', { timeout: 2000 });
    if (btn) await btn.click();
  } catch {}
  await page.waitForTimeout(1000);

  // Scroll down to about section
  await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
  await page.waitForTimeout(500);

  const elementAtPoint = await page.evaluate(() => {
    const el = document.elementFromPoint(100, 500);
    return {
      tagName: el ? el.tagName : null,
      id: el ? el.id : null,
      className: el ? el.className : null,
      bgColor: el ? window.getComputedStyle(el).backgroundColor : null,
    };
  });
  console.log('Element at point (100, 500):', elementAtPoint);

  const ambientBgInfo = await page.evaluate(() => {
    // AmbientBackground has aria-hidden="true" and class containing "fixed inset-0"
    const el = document.querySelector('div[aria-hidden="true"].fixed.inset-0');
    if (!el) return 'Not found';
    const cs = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const children = Array.from(el.children).map(c => ({
      tagName: c.tagName,
      className: c.className,
      styleBackground: c.style.background || c.style.backgroundImage,
      csBackground: window.getComputedStyle(c).background,
      opacity: window.getComputedStyle(c).opacity,
    }));
    return {
      zIndex: cs.zIndex,
      position: cs.position,
      display: cs.display,
      visibility: cs.visibility,
      opacity: cs.opacity,
      bgColor: cs.backgroundColor,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      children,
    };
  });
  console.log('AmbientBg Info:', JSON.stringify(ambientBgInfo, null, 2));

  await browser.close();
}

debug().catch(console.error);
