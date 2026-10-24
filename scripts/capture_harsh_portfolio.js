import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/1f9f5805-9b22-48cc-b50f-157ceb35e9ef';

async function main() {
  console.log('Capturing Harsh Raj portfolio hero and skills sections...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(1000);

  // 1. Capture Hero Section (Desktop Dark Mode)
  const heroSection = page.locator('#hero');
  await heroSection.waitFor({ state: 'visible' });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'harsh_hero_dark.png'),
    clip: { x: 0, y: 0, width: 1440, height: 750 },
  });
  console.log('Captured harsh_hero_dark.png');

  // 2. Scroll to and capture Skills Section (Desktop Dark Mode)
  const skillsSection = page.locator('#skills');
  await skillsSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const skillsBoundingBox = await skillsSection.boundingBox();
  if (skillsBoundingBox) {
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'harsh_skills_dark.png'),
      clip: {
        x: Math.max(0, skillsBoundingBox.x - 40),
        y: Math.max(0, skillsBoundingBox.y - 20),
        width: Math.min(1440, skillsBoundingBox.width + 80),
        height: skillsBoundingBox.height + 40,
      },
    });
    console.log('Captured harsh_skills_dark.png');
  }

  // 3. Capture Hero & Skills together in context
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'harsh_overview_dark.png'),
    clip: { x: 100, y: 0, width: 1240, height: 900 },
  });
  console.log('Captured harsh_overview_dark.png');

  await context.close();
  await browser.close();
  console.log('Done capturing screenshots!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
