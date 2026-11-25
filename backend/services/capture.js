const fs = require('fs');
const { chromium, firefox, webkit } = require('playwright');

const BROWSERS = { chromium, firefox, webkit };

async function captureScreenshot(url, outPath, options = {}) {
  const { width = 1366, height = 768, browserName = 'chromium' } = options;
  const browserType = BROWSERS[browserName] || chromium;

  const browser = await browserType.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.screenshot({ path: outPath, fullPage: true });
  } finally {
    await browser.close();
  }
}

function ensureBaseline(baselinePath, sourcePath) {
  if (!fs.existsSync(baselinePath) && fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, baselinePath);
    return true;
  }
  return false;
}

module.exports = { captureScreenshot, ensureBaseline };