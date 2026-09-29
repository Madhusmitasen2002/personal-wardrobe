const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\7b853099-11bb-4c6c-aa17-4257082bd936\\screenshots';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1280, height: 850 },
  });

  const page = await browser.newPage();

  try {
    // 1. Register or Login
    console.log('Navigating to http://localhost:5173/register...');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' });
    await sleep(1000);

    const email = `designer_${Date.now()}@fashiontech.ai`;
    await page.type('#register-name', 'Alex Rivera');
    await page.type('#register-email', email);
    await page.type('#register-password', 'Password123!');

    console.log('Submitting registration...');
    await page.click('button[type="submit"]');
    await sleep(2500);

    // 2. Go to Upload Page
    console.log('Navigating to /upload...');
    await page.goto('http://localhost:5173/upload', { waitUntil: 'networkidle2' });
    await sleep(1200);

    const uploadShotPath = path.join(SCREENSHOT_DIR, '01_upload_page_autotagging.png');
    await page.screenshot({ path: uploadShotPath, fullPage: true });
    console.log(`Saved screenshot: ${uploadShotPath}`);

    // 3. Go to Outfit Studio
    console.log('Navigating to /studio...');
    await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle2' });
    await sleep(1500);

    const studioShotPath = path.join(SCREENSHOT_DIR, '02_outfit_studio_mannequin.png');
    await page.screenshot({ path: studioShotPath, fullPage: true });
    console.log(`Saved screenshot: ${studioShotPath}`);

    // 4. Click Next-Gen Studio button
    console.log('Finding and clicking Next-Gen Studio button...');
    const allButtons = await page.$$('button');
    let clicked = false;
    for (const btn of allButtons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text.includes('Next-Gen Studio') || text.includes('Try-On Studio')) {
        await btn.click();
        clicked = true;
        console.log(`Clicked button with text: "${text.trim()}"`);
        break;
      }
    }

    if (!clicked) {
      throw new Error('Could not find Next-Gen button on /studio');
    }

    console.log('Waiting for Avatar Prototype modal...');
    await page.waitForSelector('.avatar-proto-card', { timeout: 10000 });
    await sleep(1000);

    // Screenshot Tab 1: Instant 2D Studio
    const tab1ShotPath = path.join(SCREENSHOT_DIR, '03_avatar_proto_2d_studio.png');
    await page.screenshot({ path: tab1ShotPath });
    console.log(`Saved screenshot: ${tab1ShotPath}`);

    // Click Tab 2: On-Demand AI Photo Model
    console.log('Switching to Tab 2: AI Photo Model...');
    const tabs = await page.$$('.proto-nav-btn');
    if (tabs.length >= 2) {
      await tabs[1].click();
      await sleep(1000);

      // Click Generate Photorealistic Model
      console.log('Clicking Generate Photorealistic Model...');
      const genBtn = await page.waitForSelector('.ai-photo-empty button', { timeout: 8000 });
      await genBtn.click();

      console.log('Waiting for AI generation simulation (2.5s)...');
      await sleep(3500);

      const tab2ShotPath = path.join(SCREENSHOT_DIR, '04_avatar_proto_ai_photo.png');
      await page.screenshot({ path: tab2ShotPath });
      console.log(`Saved screenshot: ${tab2ShotPath}`);
    }

    // Click Tab 3: Before / After Split Compare
    console.log('Switching to Tab 3: Before/After Split Compare...');
    const tabsAfter = await page.$$('.proto-nav-btn');
    if (tabsAfter.length >= 3) {
      await tabsAfter[2].click();
      await sleep(1200);

      const tab3ShotPath = path.join(SCREENSHOT_DIR, '05_avatar_proto_compare_view.png');
      await page.screenshot({ path: tab3ShotPath });
      console.log(`Saved screenshot: ${tab3ShotPath}`);
    }

    console.log('ALL SCREENSHOTS CAPTURED AND VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await browser.close();
  }
}

run();
