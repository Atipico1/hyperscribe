#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { writeFileSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { render } from "../plugins/hyperscribe/scripts/render.mjs";
import {
  GALLERY_COMPONENTS,
  GALLERY_ASSET_DIR,
  ensureDir,
  updateReadmeGallery,
  writeJson
} from "./component-gallery.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TMP_DIR = resolve(ROOT, ".tmp", "component-gallery");
const PNG_DIR = resolve(ROOT, GALLERY_ASSET_DIR);
const README_PATH = resolve(ROOT, "README.md");

async function main() {
  const chrome = findChromeBinary();
  const cwebp = findCwebpBinary();

  ensureDir(TMP_DIR);
  ensureDir(PNG_DIR);

  for (const entry of GALLERY_COMPONENTS) {
    const doc = entry.buildDoc();
    const html = await render(doc, { theme: "studio", mode: "light" });
    const framed = addCaptureFrame(html, entry);
    const htmlPath = resolve(TMP_DIR, `${entry.slug}.html`);
    const jsonPath = resolve(TMP_DIR, `${entry.slug}.json`);
    const pngPath = resolve(TMP_DIR, `${entry.slug}.png`);
    const webpPath = resolve(ROOT, entry.imagePath);

    writeFileSync(htmlPath, framed, "utf8");
    writeJson(jsonPath, doc);
    console.log(`Capturing ${entry.label} -> ${entry.imagePath}`);
    captureScreenshot(chrome, htmlPath, pngPath);
    convertToWebp(cwebp, pngPath, webpPath);
    rmSync(pngPath, { force: true });
  }

  updateReadmeGallery(README_PATH);
  console.log(`Generated ${GALLERY_COMPONENTS.length} component previews into ${PNG_DIR}`);
}

function findCwebpBinary() {
  const candidates = [
    process.env.CWEBP_BIN,
    "/opt/homebrew/bin/cwebp",
    "/usr/local/bin/cwebp"
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error("cwebp binary not found. Set CWEBP_BIN or install libwebp.");
}

function findChromeBinary() {
  const candidates = [
    process.env.CHROME_BIN,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error("Chrome binary not found. Set CHROME_BIN or install Google Chrome.");
}

function convertToWebp(cwebp, pngPath, webpPath) {
  execFileSync(cwebp, [
    "-quiet",
    "-q",
    "82",
    pngPath,
    "-o",
    webpPath
  ], {
    stdio: "pipe",
    timeout: 15000
  });
}

function addCaptureFrame(html, entry) {
  const headerDisplay = entry.showHeader ? "block" : "none";
  const extraCss = `
    <style>
      html, body {
        min-height: 100%;
        background: #f8fafc;
      }

      body {
        display: grid;
        place-items: center;
        justify-content: center;
        padding: 0;
      }

      .hs-mode-toggler {
        display: none !important;
      }

      .hs-page {
        width: min(1180px, calc(100vw - 64px));
        min-height: calc(100vh - 64px);
        padding: 28px 32px;
        display: grid;
        grid-template-rows: ${entry.showHeader ? "auto 1fr" : "1fr"};
        align-items: center;
      }

      .hs-page-header {
        display: ${headerDisplay};
        margin: 0 0 20px;
        text-align: center;
      }

      .hs-page-title {
        font-size: 44px;
        letter-spacing: -1.2px;
      }

      .hs-page-subtitle,
      .hs-section-lead {
        font-size: 18px;
      }

      .hs-page-main {
        width: 100%;
        display: grid;
        place-items: center;
      }

      .hs-page-main > * {
        width: min(100%, ${entry.captureWidth});
        margin: 0 !important;
        transform: scale(${entry.captureScale});
        transform-origin: center center;
      }
    </style>
  `;

  return html.replace("</head>", `${extraCss}\n</head>`);
}

function captureScreenshot(chrome, htmlPath, pngPath) {
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1400,1050",
    "--run-all-compositor-stages-before-draw",
    "--virtual-time-budget=7000",
    `--screenshot=${pngPath}`,
    `file://${htmlPath}`
  ], {
    stdio: "pipe",
    timeout: 15000
  });
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
