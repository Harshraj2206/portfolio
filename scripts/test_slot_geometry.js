import { chromium } from 'playwright';

async function testSlotGeometry() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);

  const results = await page.evaluate(() => {
    const wordDisplay = document.getElementById('portfolio-word-display');
    if (!wordDisplay) return null;

    // Let's create a test harness matching our new flex row structure:
    // Container: flex items-center justify-center
    const testRow = document.createElement('div');
    testRow.style.display = 'flex';
    testRow.style.alignItems = 'center';
    testRow.style.justifyContent = 'center';
    testRow.style.position = 'relative';
    testRow.style.fontSize = '100px';
    testRow.style.fontFamily = '"Inter Variable", Inter, sans-serif';
    testRow.style.fontWeight = '800';
    testRow.style.width = '100%';
    testRow.style.height = '100px';
    document.body.appendChild(testRow);

    const slotWidths = [60, 58, 60, 56, 60, 26, 60, 58, 48];
    const dotDiameter = 14;

    const slots = [];
    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div');
      slot.style.width = '0px';
      slot.style.height = '100px';
      slot.style.flexShrink = '0';
      slot.style.position = 'relative';
      slot.style.overflow = 'visible';

      const reel = document.createElement('div');
      reel.textContent = ['H', 'A', 'R', 'S', 'H', ' ', 'R', 'A', 'J'][i];
      reel.style.position = 'relative';
      reel.style.width = '100%';
      reel.style.height = '100px';
      reel.style.textAlign = 'center';
      slot.appendChild(reel);

      testRow.appendChild(slot);
      slots.push({ slot, reel });
    }

    const dot = document.createElement('div');
    dot.style.width = `${dotDiameter}px`;
    dot.style.height = `${dotDiameter}px`;
    dot.style.borderRadius = '50%';
    dot.style.backgroundColor = 'white';
    dot.style.flexShrink = '0';
    testRow.appendChild(dot);

    const steps = [];

    // Step 0: Initial state (all slots 0px)
    const initialDotRect = dot.getBoundingClientRect();
    const rowRect = testRow.getBoundingClientRect();
    steps.push({
      step: 'initial',
      dotCenter: initialDotRect.left + initialDotRect.width / 2,
      rowCenter: rowRect.left + rowRect.width / 2,
      dotDiffFromRowCenter: (initialDotRect.left + initialDotRect.width / 2) - (rowRect.left + rowRect.width / 2),
    });

    // Step 1 to 9: Open slots sequentially
    for (let i = 0; i < 9; i++) {
      // Before opening slot i, measure dot and slot
      const dRectBefore = dot.getBoundingClientRect();
      const sRectBefore = slots[i].slot.getBoundingClientRect();
      const dotCenterXBefore = dRectBefore.left + dRectBefore.width / 2;
      const dotCenterYBefore = dRectBefore.top + dRectBefore.height / 2;
      const slotCenterXBefore = sRectBefore.left + sRectBefore.width / 2;
      const slotCenterYBefore = sRectBefore.top + sRectBefore.height / 2;

      const launchOffsetX = dotCenterXBefore - slotCenterXBefore;
      const launchOffsetY = dotCenterYBefore - slotCenterYBefore;

      // Open slot i
      slots[i].slot.style.width = `${slotWidths[i]}px`;

      // After opening slot i
      const dRectAfter = dot.getBoundingClientRect();
      const sRectAfter = slots[i].slot.getBoundingClientRect();

      steps.push({
        letter: ['H', 'A', 'R', 'S', 'H', ' ', 'R', 'A', 'J'][i],
        launchOffsetX,
        launchOffsetY,
        dotCenterBefore: dotCenterXBefore,
        slotCenterBefore: slotCenterXBefore,
        dotCenterAfter: dRectAfter.left + dRectAfter.width / 2,
        slotCenterAfter: sRectAfter.left + sRectAfter.width / 2,
      });
    }

    testRow.remove();
    return steps;
  });

  console.log('Slot Geometry Result:', JSON.stringify(results, null, 2));
  await browser.close();
}

testSlotGeometry().catch(console.error);
