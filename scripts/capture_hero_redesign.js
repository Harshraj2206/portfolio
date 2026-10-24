import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/1f9f5805-9b22-48cc-b50f-157ceb35e9ef';

async function main() {
  console.log('Capturing Hero redesign screenshots...');
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop 1440x900
  console.log('Capturing Desktop (1440x900)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await desktopPage.evaluate(() => document.documentElement.classList.add('dark'));
  await desktopPage.waitForTimeout(1000);

  // Check scrollspy on desktop at top
  const activeNavElements = await desktopPage.$$eval('[aria-current="true"]', (els) =>
    els.map((el) => el.textContent?.trim())
  );
  console.log('Active nav elements at Hero on Desktop:', activeNavElements);

  // Screenshot hero on desktop
  const desktopHeroPath = path.join(ARTIFACT_DIR, 'hero_desktop_1440.png');
  await desktopPage.screenshot({
    path: desktopHeroPath,
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  });
  console.log('Saved:', desktopHeroPath);

  // Also test mouse hover parallax
  await desktopPage.mouse.move(1100, 450);
  await desktopPage.waitForTimeout(300);

  await desktopContext.close();

  // 2. Mobile 390x844 (iPhone 14 / 15 size)
  console.log('Capturing Mobile (390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await mobilePage.evaluate(() => document.documentElement.classList.add('dark'));
  await mobilePage.waitForTimeout(1000);

  // Check scrollspy on mobile at top
  const activeMobileElements = await mobilePage.$$eval('[aria-current="true"]', (els) =>
    els.map((el) => el.textContent?.trim())
  );
  console.log('Active mobile nav elements at Hero:', activeMobileElements);

  // Screenshot hero on mobile
  const mobileHeroPath = path.join(ARTIFACT_DIR, 'hero_mobile_390.png');
  await mobilePage.screenshot({
    path: mobileHeroPath,
    fullPage: false,
  });
  console.log('Saved:', mobileHeroPath);

  await mobileContext.close();
  await browser.close();
  console.log('Screenshot capture completed successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
