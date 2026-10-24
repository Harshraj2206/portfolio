import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/1f9f5805-9b22-48cc-b50f-157ceb35e9ef';

async function main() {
  console.log('Launching browser to capture nav states...');
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Nav Test
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Ensure dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await page.waitForTimeout(500);

  // 1. Idle State: Active bubble on Projects
  const navBar = page.locator('header nav[aria-label="Primary Navigation"]');
  await navBar.waitFor({ state: 'visible' });

  // Capture close-up of idle nav and top of page
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'nav_idle.png'),
    clip: { x: 200, y: 0, width: 1040, height: 260 },
  });
  console.log('Captured nav_idle.png');

  // Verify computed styles of active bubble and resume button
  const activeBubbleStyle = await page.evaluate(() => {
    const bubble = document.querySelector('.nav-glass-bubble-active');
    if (!bubble) return null;
    const computed = window.getComputedStyle(bubble);
    return {
      background: computed.backgroundColor,
      border: computed.borderColor,
      borderRadius: computed.borderRadius,
      boxShadow: computed.boxShadow,
      backdropFilter: computed.backdropFilter || computed.webkitBackdropFilter,
    };
  });
  console.log('Active Bubble Computed Style:', JSON.stringify(activeBubbleStyle, null, 2));

  const resumeBtnStyle = await page.evaluate(() => {
    const btn = document.querySelector('.nav-resume-btn');
    if (!btn) return null;
    const computed = window.getComputedStyle(btn);
    return {
      background: computed.backgroundColor,
      border: computed.borderColor,
      color: computed.color,
      borderRadius: computed.borderRadius,
      backdropFilter: computed.backdropFilter || computed.webkitBackdropFilter,
    };
  });
  console.log('Resume Button Idle Computed Style:', JSON.stringify(resumeBtnStyle, null, 2));

  // 2. Hover State: Hover over Experience or Skills link
  const experienceLink = page.locator('nav[aria-label="Primary Navigation"] a[href="#experience"]');
  await experienceLink.hover();
  await page.waitForTimeout(600); // allow spring animation to settle

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'nav_hover_experience.png'),
    clip: { x: 200, y: 0, width: 1040, height: 260 },
  });
  console.log('Captured nav_hover_experience.png');

  // Hover over Resume button (should turn system blue #0A84FF)
  const resumeBtn = page.locator('nav[aria-label="Primary Navigation"] a.nav-resume-btn');
  await resumeBtn.hover();
  await page.waitForTimeout(400);

  const resumeHoverStyle = await page.evaluate(() => {
    const btn = document.querySelector('.nav-resume-btn');
    if (!btn) return null;
    const computed = window.getComputedStyle(btn);
    return {
      background: computed.backgroundColor,
      color: computed.color,
      borderColor: computed.borderColor,
    };
  });
  console.log('Resume Button Hover Computed Style:', JSON.stringify(resumeHoverStyle, null, 2));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'nav_resume_hover.png'),
    clip: { x: 200, y: 0, width: 1040, height: 260 },
  });
  console.log('Captured nav_resume_hover.png');

  // Move mouse away to test spring back
  await page.mouse.move(10, 10);
  await page.waitForTimeout(600);

  // 3. Scrollspy State: Scroll to Experience section
  console.log('Scrolling to Experience section...');
  await page.evaluate(() => {
    const exp = document.getElementById('experience');
    if (exp) exp.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(1000);

  const activeLinkAfterScroll = await page.evaluate(() => {
    const activeLink = document.querySelector('nav[aria-label="Primary Navigation"] a[aria-current="true"]');
    return activeLink ? activeLink.textContent?.trim() : null;
  });
  console.log('Active Link After Scroll to Experience:', activeLinkAfterScroll);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'nav_scrolled_experience.png'),
    clip: { x: 200, y: 0, width: 1040, height: 400 },
  });
  console.log('Captured nav_scrolled_experience.png');

  // Also scroll to Skills
  console.log('Scrolling to Skills section...');
  await page.evaluate(() => {
    const skills = document.getElementById('skills');
    if (skills) skills.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(1000);

  const activeLinkAfterSkills = await page.evaluate(() => {
    const activeLink = document.querySelector('nav[aria-label="Primary Navigation"] a[aria-current="true"]');
    return activeLink ? activeLink.textContent?.trim() : null;
  });
  console.log('Active Link After Scroll to Skills:', activeLinkAfterSkills);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'nav_scrolled_skills.png'),
    clip: { x: 200, y: 0, width: 1040, height: 400 },
  });
  console.log('Captured nav_scrolled_skills.png');

  await context.close();

  // 4. Mobile Viewport Test (iPhone 14 / 390x844)
  console.log('Testing mobile tab bar...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: 'dark',
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await mobilePage.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await mobilePage.waitForTimeout(800);

  // Capture mobile full screen showing bottom glass tab bar
  await mobilePage.screenshot({
    path: path.join(ARTIFACT_DIR, 'nav_mobile_tab_bar.png'),
  });
  console.log('Captured nav_mobile_tab_bar.png');

  // Tap on Skills tab on mobile
  const mobileSkillsTab = mobilePage.locator('nav[aria-label="Mobile Bottom Navigation"] a[href="#skills"]');
  await mobileSkillsTab.click();
  await mobilePage.waitForTimeout(800);

  await mobilePage.screenshot({
    path: path.join(ARTIFACT_DIR, 'nav_mobile_skills_active.png'),
  });
  console.log('Captured nav_mobile_skills_active.png');

  await mobileContext.close();
  await browser.close();
  console.log('Done capturing all nav states!');
}

main().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
