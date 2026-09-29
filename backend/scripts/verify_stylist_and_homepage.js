const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\7b853099-11bb-4c6c-aa17-4257082bd936\\screenshots';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('Launching Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();

  try {
    // 1. Check Homepage with Live Weather Intelligence
    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await sleep(2000);

    const homeShotPath = path.join(SCREENSHOT_DIR, '06_homepage_weather_intelligence.png');
    await page.screenshot({ path: homeShotPath, fullPage: true });
    console.log(`Saved screenshot: ${homeShotPath}`);

    // 2. Register/Login
    console.log('Navigating to /register...');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' });
    await sleep(1000);

    const email = `stylist_user_${Date.now()}@fashiontech.ai`;
    await page.type('#register-name', 'Elena Rostova');
    await page.type('#register-email', email);
    await page.type('#register-password', 'Password123!');
    await page.click('button[type="submit"]');
    await sleep(2500);

    // 2b. Populate 4 high-fashion wardrobe items via frontend page context
    console.log('Adding 4 test garments to wardrobe...');
    await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      const items = [
        {
          name: 'Crisp Cotton Poplin Shirt',
          category: 'top',
          subcategory: 'dress_shirt',
          length: 'regular',
          layerType: 'base',
          fabric: 'cotton',
          formality: 7,
          color: '#ffffff',
          colorName: 'Crisp White',
          season: ['spring', 'summer', 'fall'],
          imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop&q=60',
          tags: ['formal', 'office', 'classic'],
        },
        {
          name: 'Tailored Charcoal Trousers',
          category: 'bottom',
          subcategory: 'tailored_trouser',
          length: 'regular',
          fabric: 'wool',
          formality: 8,
          color: '#334155',
          colorName: 'Charcoal Grey',
          season: ['fall', 'winter', 'spring'],
          imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60',
          tags: ['tailored', 'executive', 'smart'],
        },
        {
          name: 'Classic Camel Trench Coat',
          category: 'layer',
          subcategory: 'trench_coat',
          length: 'long',
          layerType: 'outer',
          fabric: 'gabardine',
          formality: 8,
          color: '#c29b62',
          colorName: 'Camel Tan',
          season: ['spring', 'fall'],
          imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=60',
          tags: ['outerwear', 'trench', 'water-resistant'],
        },
        {
          name: 'Italian Leather Chelsea Boots',
          category: 'shoe',
          subcategory: 'chelsea_boots',
          fabric: 'leather',
          formality: 7,
          color: '#1e293b',
          colorName: 'Midnight Black',
          season: ['fall', 'winter', 'spring'],
          imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=500&auto=format&fit=crop&q=60',
          tags: ['boots', 'leather', 'sleek'],
        },
      ];

      for (const item of items) {
        await fetch('http://localhost:5000/api/wardrobe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(item),
        });
      }
    });
    console.log('Wardrobe garments seeded successfully.');

    // 3. Go to Outfit Studio
    console.log('Navigating to /studio ...');
    await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle2' });
    await sleep(2000);

    // 4. Open AI Stylist Modal
    console.log('Opening AI Stylist modal...');
    const stylistBtns = await page.$$('button');
    let stylistClicked = false;
    for (const btn of stylistBtns) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text.includes('Ask AI Stylist') || text.includes('AI Stylist')) {
        await btn.click();
        stylistClicked = true;
        console.log(`Clicked: "${text.trim()}"`);
        break;
      }
    }

    if (!stylistClicked) {
      throw new Error('Could not find AI Stylist button on /studio');
    }

    await page.waitForSelector('.stylist-modal', { timeout: 10000 });
    await sleep(1500);

    // 5. Generate styling / capsule recommendations
    console.log('Consulting AI Stylist with occasion...');
    const consultBtn = await page.waitForSelector('.stylist-generate-btn', { timeout: 8000 });
    await consultBtn.click();

    console.log('Waiting for Stylist engine response (capsule or outfits)...');
    await page.waitForFunction(
      () => document.querySelector('.capsule-box') || document.querySelector('.stylist-look-card'),
      { timeout: 15000 }
    );
    await sleep(1500);

    const stylistShotPath = path.join(SCREENSHOT_DIR, '07_ai_stylist_modal.png');
    await page.screenshot({ path: stylistShotPath });
    console.log(`Saved screenshot: ${stylistShotPath}`);

    // Test clicking a feedback button if available
    const feedbackBtns = await page.$$('.feedback-btn');
    if (feedbackBtns.length > 0) {
      console.log(`Found ${feedbackBtns.length} feedback buttons. Clicking first one...`);
      await feedbackBtns[0].click();
      await sleep(1000);
      const feedbackShotPath = path.join(SCREENSHOT_DIR, '08_ai_stylist_feedback.png');
      await page.screenshot({ path: feedbackShotPath });
      console.log(`Saved screenshot: ${feedbackShotPath}`);
    }

    console.log('All verification steps succeeded smoothly!');
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await browser.close();
  }
}

run();
