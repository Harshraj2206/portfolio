import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = 'C:/Users/hraj2/.gemini/antigravity-ide/brain/8f74d384-3a58-46be-87bb-22b7cb19de15';
const url = process.argv[2] || "http://localhost:5173";

async function runAudit() {
  console.log(`Starting Lighthouse audit against ${url}...`);
  const chrome = await launch({
    chromeFlags: ["--headless", "--no-sandbox"],
  });

  try {
    // 1. Mobile Audit
    console.log("Running Mobile Lighthouse audit...");
    const mobileResult = await lighthouse(url, {
      port: chrome.port,
      output: ["json"],
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      formFactor: "mobile",
      screenEmulation: {
        mobile: true,
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        disabled: false,
      },
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      },
    });

    const mobileLhr = mobileResult.lhr;
    const mobileScores = {
      performance: Math.round((mobileLhr.categories.performance?.score || 0) * 100),
      accessibility: Math.round((mobileLhr.categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((mobileLhr.categories["best-practices"]?.score || 0) * 100),
      seo: Math.round((mobileLhr.categories.seo?.score || 0) * 100),
    };

    console.log("Mobile Scores:", mobileScores);

    // 2. Desktop Audit
    console.log("Running Desktop Lighthouse audit...");
    const desktopResult = await lighthouse(url, {
      port: chrome.port,
      output: ["json"],
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      formFactor: "desktop",
      screenEmulation: {
        mobile: false,
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        disabled: false,
      },
      throttling: {
        rttMs: 10,
        throughputKbps: 51200,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      },
    });

    const desktopLhr = desktopResult.lhr;
    const desktopScores = {
      performance: Math.round((desktopLhr.categories.performance?.score || 0) * 100),
      accessibility: Math.round((desktopLhr.categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((desktopLhr.categories["best-practices"]?.score || 0) * 100),
      seo: Math.round((desktopLhr.categories.seo?.score || 0) * 100),
    };

    console.log("Desktop Scores:", desktopScores);

    const summary = {
      desktop: desktopScores,
      mobile: mobileScores,
      targetDesktop: ">= 90",
      targetMobile: ">= 85",
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(ARTIFACT_DIR, "lighthouse_scores.json"),
      JSON.stringify(summary, null, 2)
    );

    console.log("\nAudit Summary written to artifact directory.");
  } finally {
    await chrome.kill();
  }
}

runAudit().catch((err) => {
  console.error("Lighthouse failed:", err);
  process.exit(1);
});
