import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const artifactDir = 'C:\\Users\\hraj2\\.gemini\\antigravity-ide\\brain\\cf137b82-27ef-48c9-9d25-b0ec390af790';
const screenshotsDir = path.join(artifactDir, 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function capture() {
  console.log('Launching Chromium...');
  const browser = await chromium.launch();
  
  // 1. Desktop Light (1440x900)
  console.log('Capturing Desktop Light...');
  const pageDesktopLight = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light',
  });
  await pageDesktopLight.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await pageDesktopLight.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  });
  await pageDesktopLight.waitForTimeout(1000);
  const pathDesktopLight = path.join(screenshotsDir, 'desktop_light.png');
  await pageDesktopLight.screenshot({ path: pathDesktopLight, fullPage: false });
  console.log('Saved:', pathDesktopLight);

  // 2. Desktop Dark (1440x900)
  console.log('Capturing Desktop Dark...');
  const pageDesktopDark = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  await pageDesktopDark.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await pageDesktopDark.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  await pageDesktopDark.waitForTimeout(1000);
  const pathDesktopDark = path.join(screenshotsDir, 'desktop_dark.png');
  await pageDesktopDark.screenshot({ path: pathDesktopDark, fullPage: false });
  console.log('Saved:', pathDesktopDark);

  // 3. Mobile Light (390x844)
  console.log('Capturing Mobile Light...');
  const pageMobileLight = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    colorScheme: 'light',
  });
  await pageMobileLight.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await pageMobileLight.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  });
  await pageMobileLight.waitForTimeout(1000);
  const pathMobileLight = path.join(screenshotsDir, 'mobile_light.png');
  await pageMobileLight.screenshot({ path: pathMobileLight, fullPage: false });
  console.log('Saved:', pathMobileLight);

  // 4. Mobile Dark (390x844)
  console.log('Capturing Mobile Dark...');
  const pageMobileDark = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    colorScheme: 'dark',
  });
  await pageMobileDark.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await pageMobileDark.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  await pageMobileDark.waitForTimeout(1000);
  const pathMobileDark = path.join(screenshotsDir, 'mobile_dark.png');
  await pageMobileDark.screenshot({ path: pathMobileDark, fullPage: false });
  console.log('Saved:', pathMobileDark);

  // 5. Dedicated Case Study Page (/projects/aurakv)
  console.log('Capturing Case Study Route (/projects/aurakv)...');
  const pageCaseStudy = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await pageCaseStudy.goto('http://localhost:5173/projects/aurakv', { waitUntil: 'networkidle' });
  await pageCaseStudy.waitForTimeout(1000);
  const pathCaseStudy = path.join(screenshotsDir, 'case_study_route.png');
  await pageCaseStudy.screenshot({ path: pathCaseStudy, fullPage: false });
  console.log('Saved:', pathCaseStudy);

  // 6. Styled 404 Page (/404)
  console.log('Capturing 404 Page...');
  const page404 = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page404.goto('http://localhost:5173/non-existent-route', { waitUntil: 'networkidle' });
  await page404.waitForTimeout(1000);
  const path404 = path.join(screenshotsDir, '404_page.png');
  await page404.screenshot({ path: path404, fullPage: false });
  console.log('Saved:', path404);

  await browser.close();
  console.log('All 6 screenshots captured and saved to artifacts successfully!');
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
