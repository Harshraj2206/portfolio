import { chromium } from 'playwright';

async function testAssertionValues() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.addInitScript(() => {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch (e) {}
  });

  page.on('console', (msg) => {
    console.log(msg.text());
  });

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3500);

  await browser.close();
}

testAssertionValues().catch(console.error);
