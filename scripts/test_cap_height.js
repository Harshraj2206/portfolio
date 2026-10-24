import { chromium } from 'playwright';

async function testCapHeight() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);

  const result = await page.evaluate(() => {
    // Let's create an offscreen canvas and draw 'H' at 100px font
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.font = '800 100px "Inter Variable", Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('H', 20, 120);

    // Scan pixel data to find exact top and bottom of 'H' pixels!
    const imgData = ctx.getImageData(0, 0, 200, 200);
    let topPixel = -1;
    let bottomPixel = -1;
    for (let y = 0; y < 200; y++) {
      for (let x = 0; x < 200; x++) {
        const alpha = imgData.data[(y * 200 + x) * 4 + 3];
        if (alpha > 50) {
          if (topPixel === -1) topPixel = y;
          bottomPixel = y;
        }
      }
    }

    // Now let's compare with DOM span rendering
    const testDiv = document.createElement('div');
    testDiv.style.font = '800 100px "Inter Variable", Inter, sans-serif';
    testDiv.style.lineHeight = '1';
    testDiv.style.position = 'absolute';
    testDiv.style.top = '0px';
    testDiv.style.left = '0px';
    testDiv.textContent = 'H';
    document.body.appendChild(testDiv);

    // Also canvas measureText metrics
    const m = ctx.measureText('H');

    return {
      pixelScan: {
        baseline: 120,
        topPixel,
        bottomPixel,
        capHeight: bottomPixel - topPixel,
        midlineFromBaseline: (topPixel + bottomPixel) / 2 - 120,
      },
      canvasMetrics: {
        actualAscent: m.actualBoundingBoxAscent,
        actualDescent: m.actualBoundingBoxDescent,
        fontAscent: m.fontBoundingBoxAscent,
        fontDescent: m.fontBoundingBoxDescent,
      },
      domDivRect: testDiv.getBoundingClientRect(),
    };
  });

  console.log('Cap-Height Exact Test:', JSON.stringify(result, null, 2));
  await browser.close();
}

testCapHeight().catch(console.error);
