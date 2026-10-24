import { chromium } from 'playwright';

async function testDomAlignment() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);

  const data = await page.evaluate(() => {
    const wordDisplay = document.getElementById('portfolio-word-display');
    const hero = document.getElementById('hero');
    if (!wordDisplay || !hero) return null;

    // Create a temporary test span with 'H' inside wordDisplay
    const span = document.createElement('span');
    span.textContent = 'H';
    span.style.font = window.getComputedStyle(wordDisplay).font;
    span.style.lineHeight = '1em';
    span.style.display = 'inline-block';
    wordDisplay.appendChild(span);

    const spanRect = span.getBoundingClientRect();
    const wordRect = wordDisplay.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();

    // Canvas metrics
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const fontSize = parseFloat(window.getComputedStyle(wordDisplay).fontSize);
    ctx.font = `800 ${fontSize}px "Inter Variable", Inter, sans-serif`;
    const m = ctx.measureText('H');

    // Also draw on canvas to find exact top & bottom pixels relative to baseline
    const testBaseline = 200;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('H', 50, testBaseline);
    const imgData = ctx.getImageData(0, 0, 400, 400);
    let topPixel = -1;
    let bottomPixel = -1;
    for (let y = 0; y < 400; y++) {
      for (let x = 0; x < 400; x++) {
        if (imgData.data[(y * 400 + x) * 4 + 3] > 50) {
          if (topPixel === -1) topPixel = y;
          bottomPixel = y;
        }
      }
    }

    // Now let's find the exact visual cap-height midline of 'H' in the DOM!
    // Since 'H' is drawn inside span, let's render 'H' alone on an offscreen canvas at span size:
    // With line-height: 1em, spanRect.height is equal to fontSize.
    // The baseline in CSS font rendering with line-height: 1:
    // In CSS, half-leading is (line-height - (ascent + descent)) / 2.
    // Let's compute where the letters' cap-height midline is relative to spanRect:
    // actualAscent = testBaseline - topPixel
    // actualDescent = bottomPixel - testBaseline (or 0 for H)
    // fontAscent vs fontDescent
    const fontAscent = m.fontBoundingBoxAscent;
    const fontDescent = m.fontBoundingBoxDescent;
    const fontEmHeight = fontAscent + fontDescent;
    // baseline inside the line box:
    const baselineInSpan = (spanRect.height - fontEmHeight) / 2 + fontAscent;
    const capTopInSpan = baselineInSpan - m.actualBoundingBoxAscent;
    const capBottomInSpan = baselineInSpan; // H sits on baseline
    const capMidlineInSpan = (capTopInSpan + capBottomInSpan) / 2;
    const capMidlineScreenY = spanRect.top + capMidlineInSpan;

    span.remove();

    return {
      fontSize,
      heroRect,
      wordRect,
      spanRect: { top: spanRect.top, height: spanRect.height },
      actualAscent: m.actualBoundingBoxAscent,
      fontAscent,
      fontDescent,
      baselineInSpan,
      capMidlineInSpan,
      capMidlineScreenY,
      pixelCapHeight: bottomPixel - topPixel,
      ratioToFontSize: capMidlineInSpan / fontSize,
    };
  });

  console.log('DOM Alignment Result:', JSON.stringify(data, null, 2));
  await browser.close();
}

testDomAlignment().catch(console.error);
