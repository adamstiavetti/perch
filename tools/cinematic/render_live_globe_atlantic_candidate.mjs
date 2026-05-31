import fs from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "playwright";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const previewsDir = path.join(repoRoot, "public", "cinematic", "previews");
const baselineDesktopPath = path.join(previewsDir, "live-globe-proof-atlantic-baseline-desktop.png");
const baselineMobilePath = path.join(previewsDir, "live-globe-proof-atlantic-baseline-mobile.png");
const candidateDesktopPath = path.join(previewsDir, "live-globe-proof-atlantic-desktop.png");
const candidateMobilePath = path.join(previewsDir, "live-globe-proof-atlantic-mobile.png");
const comparisonPath = path.join(previewsDir, "live-globe-proof-atlantic-comparison.png");
const comparisonHtmlPath = path.join(previewsDir, "_tmp-live-globe-atlantic-comparison.html");
const baseUrl = process.env.LIVE_GLOBE_BASE_URL ?? "http://localhost:3001";

async function ensurePreviewDir() {
  await fs.mkdir(previewsDir, { recursive: true });
}

async function captureCandidateScreens(browser) {
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await desktopPage.emulateMedia({ reducedMotion: "reduce" });
  await desktopPage.goto(`${baseUrl}/lab/live-globe-proof?candidate=atlantic&grade=atlantic`, { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(2200);
  await desktopPage.screenshot({ path: candidateDesktopPath, fullPage: true });
  await desktopPage.close();

  const mobileContext = await browser.newContext({ ...devices["iPhone 14 Pro Max"] });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.emulateMedia({ reducedMotion: "reduce" });
  await mobilePage.goto(`${baseUrl}/lab/live-globe-proof?candidate=atlantic&grade=atlantic`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(2200);
  await mobilePage.screenshot({ path: candidateMobilePath, fullPage: true });
  await mobileContext.close();
}

async function buildComparisonSheet() {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Live Globe Atlantic Comparison</title>
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: Helvetica, Arial, sans-serif; background: rgb(2, 7, 15); color: rgb(247, 251, 255); }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 24px; }
      .card { border-radius: 18px; overflow: hidden; background: rgb(4, 11, 22); border: 1px solid rgba(115, 174, 230, 0.24); }
      .card img { display: block; width: 100%; height: auto; background: rgb(2, 7, 15); }
      .meta { padding: 14px 18px 16px; }
      .title { font-size: 18px; line-height: 1.2; margin: 0 0 6px; }
      .subtitle { font-size: 13px; color: rgba(214, 229, 245, 0.74); margin: 0; }
    </style>
  </head>
  <body>
    <div class="grid">
      <section class="card">
        <img src="file://${baselineDesktopPath}" alt="Baseline desktop" />
        <div class="meta">
          <p class="title">Atlantic Baseline Desktop</p>
          <p class="subtitle">accepted polar default before Atlantic candidate</p>
        </div>
      </section>
      <section class="card">
        <img src="file://${candidateDesktopPath}" alt="Atlantic candidate desktop" />
        <div class="meta">
          <p class="title">Atlantic Candidate Desktop</p>
          <p class="subtitle">candidate=atlantic grade=atlantic</p>
        </div>
      </section>
      <section class="card">
        <img src="file://${baselineMobilePath}" alt="Baseline mobile" />
        <div class="meta">
          <p class="title">Atlantic Baseline Mobile</p>
          <p class="subtitle">accepted polar default before Atlantic candidate</p>
        </div>
      </section>
      <section class="card">
        <img src="file://${candidateMobilePath}" alt="Atlantic candidate mobile" />
        <div class="meta">
          <p class="title">Atlantic Candidate Mobile</p>
          <p class="subtitle">candidate=atlantic grade=atlantic</p>
        </div>
      </section>
    </div>
  </body>
</html>`;

  await fs.writeFile(comparisonHtmlPath, html);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1480, height: 1900 }, deviceScaleFactor: 1 });
    await page.goto(`file://${comparisonHtmlPath}`);
    await page.screenshot({ path: comparisonPath, fullPage: true });
    await page.close();
  } finally {
    await browser.close();
    await fs.rm(comparisonHtmlPath, { force: true });
  }
}

async function main() {
  await ensurePreviewDir();
  const browser = await chromium.launch({ headless: true });
  try {
    await captureCandidateScreens(browser);
  } finally {
    await browser.close();
  }

  await buildComparisonSheet();

  console.log(
    JSON.stringify(
      {
        candidateDesktopPath: path.relative(repoRoot, candidateDesktopPath),
        candidateMobilePath: path.relative(repoRoot, candidateMobilePath),
        comparisonPath: path.relative(repoRoot, comparisonPath),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
