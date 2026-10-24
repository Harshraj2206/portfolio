import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/fcb9ca49-a977-4248-9149-0572ae69e214';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching browser for verification captures...');
  const browser = await chromium.launch({ headless: true });

  // ==========================================
  // 1. DESKTOP (1440px) CAPTURES
  // ==========================================
  console.log('\n--- 1. Capturing Desktop (1440x900) ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Dismiss intro if skip button appears
  try {
    const skipBtn = await desktopPage.waitForSelector('button:has-text("Skip intro")', { timeout: 2500 });
    if (skipBtn) {
      await skipBtn.click();
      console.log('Clicked Skip Intro button on desktop');
    }
  } catch (e) {
    console.log('Skip intro button not clicked or passed:', e.message);
  }
  await desktopPage.waitForTimeout(1000);

  // A. Projects section (with 3rd demo project)
  console.log('Capturing Desktop: Projects...');
  const projectsElem = await desktopPage.$('#projects');
  if (projectsElem) {
    await projectsElem.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(600);
    await projectsElem.screenshot({
      path: path.join(SCREENSHOT_DIR, 'desktop_projects.png'),
    });
  }

  // B. Highlights: Tab 1 - Achievements
  console.log('Capturing Desktop: Highlights - Achievements...');
  const highlightsElem = await desktopPage.$('#highlights');
  if (highlightsElem) {
    await highlightsElem.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOT_DIR, 'desktop_highlights_achievements.png'),
    });

    // Highlights: Tab 2 - Certifications
    console.log('Capturing Desktop: Highlights - Certifications...');
    const certTab = await desktopPage.$('#tab-certifications');
    if (certTab) {
      await certTab.click();
      await desktopPage.waitForTimeout(600);
      await desktopPage.screenshot({
        path: path.join(SCREENSHOT_DIR, 'desktop_highlights_certifications.png'),
      });
    }

    // Highlights: Tab 3 - Activities
    console.log('Capturing Desktop: Highlights - Activities...');
    const actTab = await desktopPage.$('#tab-activities');
    if (actTab) {
      await actTab.click();
      await desktopPage.waitForTimeout(600);
      await desktopPage.screenshot({
        path: path.join(SCREENSHOT_DIR, 'desktop_highlights_activities.png'),
      });
    }
  }

  // C. Social Dock band ("Find me online")
  console.log('Capturing Desktop: Social Dock band...');
  const socialSection = await desktopPage.$('section[aria-label="Find me online"]');
  if (socialSection) {
    await socialSection.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(600);
    // Hover first icon to demonstrate dock magnification and tooltip
    const firstIcon = await socialSection.$('a');
    if (firstIcon) {
      await firstIcon.hover();
      await desktopPage.waitForTimeout(300);
    }
    await socialSection.screenshot({
      path: path.join(SCREENSHOT_DIR, 'desktop_social_dock.png'),
    });
  }

  // D. Contact Section
  console.log('Capturing Desktop: Contact...');
  const contactElem = await desktopPage.$('#contact');
  if (contactElem) {
    await contactElem.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(600);
    await contactElem.screenshot({
      path: path.join(SCREENSHOT_DIR, 'desktop_contact.png'),
    });
  }

  // E. Footer
  console.log('Capturing Desktop: Footer...');
  const footerElem = await desktopPage.$('footer');
  if (footerElem) {
    await footerElem.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(600);
    await footerElem.screenshot({
      path: path.join(SCREENSHOT_DIR, 'desktop_footer.png'),
    });
  }

  // ==========================================
  // 2. MOBILE (390px) CAPTURES
  // ==========================================
  console.log('\n--- 2. Capturing Mobile (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    colorScheme: 'dark',
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Dismiss intro immediately with Escape or button click
  await mobilePage.keyboard.press('Escape');
  await mobilePage.waitForTimeout(600);
  try {
    const skipBtn = await mobilePage.$('button[aria-label="Skip introductory animation"]');
    if (skipBtn) {
      await skipBtn.click({ force: true });
    }
  } catch {
    // Already skipped
  }
  await mobilePage.waitForTimeout(1000);

  // A. Mobile Projects
  console.log('Capturing Mobile: Projects...');
  const mProjects = await mobilePage.$('#projects');
  if (mProjects) {
    await mProjects.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(600);
    await mProjects.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile_projects.png'),
    });
  }

  // B. Mobile Highlights (Achievements, Certifications, Activities)
  console.log('Capturing Mobile: Highlights...');
  const mHighlights = await mobilePage.$('#highlights');
  if (mHighlights) {
    await mHighlights.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(600);
    await mHighlights.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile_highlights_achievements.png'),
    });

    const mCertTab = await mobilePage.$('#tab-certifications');
    if (mCertTab) {
      await mCertTab.click();
      await mobilePage.waitForTimeout(500);
      await mHighlights.screenshot({
        path: path.join(SCREENSHOT_DIR, 'mobile_highlights_certifications.png'),
      });
    }

    const mActTab = await mobilePage.$('#tab-activities');
    if (mActTab) {
      await mActTab.click();
      await mobilePage.waitForTimeout(500);
      await mHighlights.screenshot({
        path: path.join(SCREENSHOT_DIR, 'mobile_highlights_activities.png'),
      });
    }
  }

  // C. Mobile Social Dock
  console.log('Capturing Mobile: Social Dock...');
  const mSocial = await mobilePage.$('section[aria-label="Find me online"]');
  if (mSocial) {
    await mSocial.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(600);
    await mSocial.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile_social_dock.png'),
    });
  }

  // D. Mobile Contact
  console.log('Capturing Mobile: Contact...');
  const mContact = await mobilePage.$('#contact');
  if (mContact) {
    await mContact.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(600);
    await mContact.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile_contact.png'),
    });
  }

  // E. Mobile Footer
  console.log('Capturing Mobile: Footer...');
  const mFooter = await mobilePage.$('footer');
  if (mFooter) {
    await mFooter.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(600);
    await mFooter.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile_footer.png'),
    });
  }

  console.log('\nAll verification screenshots captured successfully!');
  await browser.close();
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
