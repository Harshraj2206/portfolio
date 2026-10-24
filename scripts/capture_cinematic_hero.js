import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/1f9f5805-9b22-48cc-b50f-157ceb35e9ef';

async function main() {
  console.log('Starting Calibrated Cinematic Intro capture across all key milestones...');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  // Clear session flag so intro plays fresh
  await page.addInitScript(() => {
    try {
      sessionStorage.clear();
    } catch (e) {}
  });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173');
  await page.evaluate(() => document.documentElement.classList.add('dark'));

  // Start precision timer immediately after page mount
  const pageMountTime = Date.now();
  console.log('Page loaded and mounted. Capturing milestone frames...');

  // Helper to sleep until a specific millisecond offset from pageMountTime
  const waitOffset = async (targetMs) => {
    const elapsed = Date.now() - pageMountTime;
    if (elapsed < targetMs) {
      await page.waitForTimeout(targetMs - elapsed);
    }
  };

  // 1. Frame at 0.2s: Black screen with soft radial vignette & white 14px dot centered
  await waitOffset(250);
  const frame0Path = path.join(ARTIFACT_DIR, 'hero_cinematic_0s.png');
  await page.screenshot({ path: frame0Path });
  console.log('Saved Frame 0s:', frame0Path);

  // 2. Frame at 1.5s: Dot bursts into 3D tumbling letters of "HARSH RAJ"
  await waitOffset(1500);
  const frame15Path = path.join(ARTIFACT_DIR, 'hero_cinematic_1_5s.png');
  await page.screenshot({ path: frame15Path });
  console.log('Saved Frame 1.5s:', frame15Path);

  // 3. Frame at 3.0s: Letters exit upward, giant metallic "PORTFOLIO" rises in
  await waitOffset(3000);
  const frame30Path = path.join(ARTIFACT_DIR, 'hero_cinematic_3s.png');
  await page.screenshot({ path: frame30Path });
  console.log('Saved Frame 3s:', frame30Path);

  // 4. Frame at 4.5s: Subtitle visible, white dust particles floating across viewport
  await waitOffset(4500);
  const frame45Path = path.join(ARTIFACT_DIR, 'hero_cinematic_4_5s.png');
  await page.screenshot({ path: frame45Path });
  console.log('Saved Frame 4.5s:', frame45Path);

  // 5. Frame at 6.4s: Final hero state - Halftone portrait gathered behind PORTFOLIO,
  // floating glass nav faded in at top, bottom right links, scroll cue, skip button hidden
  await waitOffset(6400);
  const frame60Path = path.join(ARTIFACT_DIR, 'hero_cinematic_6s.png');
  await page.screenshot({ path: frame60Path });
  console.log('Saved Frame 6s (Final Hero):', frame60Path);

  // 6. Scroll transition: Scroll down 500px from hero into About section
  console.log('Scrolling down into About section...');
  await page.evaluate(() => {
    window.scrollTo({ top: 500, behavior: 'instant' });
  });
  await page.waitForTimeout(600);
  const scrollTransitionPath = path.join(ARTIFACT_DIR, 'hero_to_about_scroll.png');
  await page.screenshot({ path: scrollTransitionPath });
  console.log('Saved Scroll Transition:', scrollTransitionPath);

  await context.close();

  // 7. Mobile View at 390x844 (Final Hero State)
  console.log('Capturing mobile view at 390x844...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript(() => {
    try {
      sessionStorage.setItem('has_seen_hero_intro', 'true');
    } catch (e) {}
  });
  await mobilePage.goto('http://localhost:5173');
  await mobilePage.evaluate(() => document.documentElement.classList.add('dark'));
  await mobilePage.waitForTimeout(800);

  const mobileHeroPath = path.join(ARTIFACT_DIR, 'hero_cinematic_390.png');
  await mobilePage.screenshot({ path: mobileHeroPath });
  console.log('Saved Mobile View:', mobileHeroPath);

  await mobileContext.close();
  await browser.close();
  console.log('All calibrated cinematic captures completed successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
