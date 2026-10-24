import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/1f9f5805-9b22-48cc-b50f-157ceb35e9ef';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    colorScheme: 'dark',
    recordVideo: {
      dir: ARTIFACT_DIR,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(1000);

  // 1. Idle state on Projects
  await page.waitForTimeout(800);

  // 2. Hover across navigation links
  const links = ['#experience', '#skills', '#about', '#contact'];
  for (const href of links) {
    const link = page.locator(`header nav a[href="${href}"]`);
    await link.hover();
    await page.waitForTimeout(600);
  }

  // 3. Hover quiet glass Resume button (turns #0A84FF)
  const resumeBtn = page.locator('header nav a.nav-resume-btn');
  await resumeBtn.hover();
  await page.waitForTimeout(900);

  // 4. Move pointer away - springs back to active link
  await page.mouse.move(50, 50);
  await page.waitForTimeout(700);

  // 5. Scroll smoothly through sections
  await page.evaluate(() => {
    document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
  });
  await page.waitForTimeout(1200);

  await page.evaluate(() => {
    document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
  });
  await page.waitForTimeout(1200);

  await page.evaluate(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  });
  await page.waitForTimeout(1200);

  // Scroll back to top
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  await page.waitForTimeout(1200);

  await context.close(); // Saves the video
  await browser.close();
  console.log('Video recording completed and saved.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
