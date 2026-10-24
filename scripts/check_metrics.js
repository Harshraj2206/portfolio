import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);

  const res = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = '800 100px "Inter Variable", Inter, sans-serif';
    const tm = ctx.measureText('H');
    
    // Also create a test DOM span to measure real glyph bounding rect
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.top = '100px';
    div.style.left = '100px';
    div.style.fontFamily = '"Inter Variable", Inter, sans-serif';
    div.style.fontWeight = '800';
    div.style.fontSize = '100px';
    div.style.lineHeight = '1';
    div.style.letterSpacing = '-0.04em';
    div.innerHTML = '<span>H</span>';
    document.body.appendChild(div);
    
    const divRect = div.getBoundingClientRect();
    const span = div.querySelector('span');
    const range = document.createRange();
    range.selectNodeContents(span);
    const textRect = range.getBoundingClientRect();
    
    const wordDisplay = document.getElementById('portfolio-word-display');
    const wordRect = wordDisplay ? wordDisplay.getBoundingClientRect() : null;
    
    return {
      canvasMetrics: {
        actualAscent: tm.actualBoundingBoxAscent,
        actualDescent: tm.actualBoundingBoxDescent,
        fontAscent: tm.fontBoundingBoxAscent,
        fontDescent: tm.fontBoundingBoxDescent,
        width: tm.width,
      },
      divRect: { top: divRect.top, height: divRect.height, bottom: divRect.bottom },
      textRect: { top: textRect.top, height: textRect.height, bottom: textRect.bottom },
      wordRect,
    };
  });

  console.log('Metrics test:', JSON.stringify(res, null, 2));
  await browser.close();
}

main().catch(console.error);
