const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\7b853099-11bb-4c6c-aa17-4257082bd936\\screenshots';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();

  try {
    // 1. Register & seed items
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' });
    const email = `curator_${Date.now()}@fashiontech.ai`;
    await page.type('#register-name', 'Camille Laurent');
    await page.type('#register-email', email);
    await page.type('#register-password', 'Password123!');
    await page.click('button[type="submit"]');
    await sleep(2500);

    // 1b. Directly insert 4 high-fashion wardrobe items via Mongoose
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/outfit-app');
    }
    const User = require('./src/modules/auth/auth.model');
    const Wardrobe = require('./src/modules/wardrobe/wardrobe.model');

    const userDoc = await User.findOne({ email });
    if (!userDoc) throw new Error('User not found in DB');

    const items = [
      {
        userId: userDoc._id,
        cloudinaryId: 'seed_top_01',
        name: 'Crisp Cotton Poplin Shirt',
        category: 'top',
        subcategory: 'dress_shirt',
        length: 'regular',
        layerType: 'base',
        fabric: 'cotton',
        formality: 7,
        color: {
          hex: '#ffffff',
          name: 'Crisp White',
          temperature: 'neutral',
        },
        season: ['spring', 'summer', 'fall'],
        imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop&q=60',
        tags: ['formal', 'office', 'classic'],
      },
      {
        userId: userDoc._id,
        cloudinaryId: 'seed_bottom_01',
        name: 'Tailored Charcoal Trousers',
        category: 'bottom',
        subcategory: 'tailored_trouser',
        length: 'regular',
        fabric: 'wool',
        formality: 8,
        color: {
          hex: '#334155',
          name: 'Charcoal Grey',
          temperature: 'cool',
        },
        season: ['fall', 'winter', 'spring'],
        imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60',
        tags: ['tailored', 'executive', 'smart'],
      },
      {
        userId: userDoc._id,
        cloudinaryId: 'seed_layer_01',
        name: 'Classic Camel Trench Coat',
        category: 'layer',
        subcategory: 'trench_coat',
        length: 'knee',
        layerType: 'outer',
        fabric: 'cotton',
        formality: 8,
        color: {
          hex: '#c29b62',
          name: 'Camel Tan',
          temperature: 'warm',
        },
        season: ['spring', 'fall'],
        imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=60',
        tags: ['outerwear', 'trench', 'water-resistant'],
      },
      {
        userId: userDoc._id,
        cloudinaryId: 'seed_shoe_01',
        name: 'Italian Leather Chelsea Boots',
        category: 'shoe',
        subcategory: 'chelsea_boots',
        fabric: 'leather',
        formality: 7,
        color: {
          hex: '#1e293b',
          name: 'Midnight Black',
          temperature: 'neutral',
        },
        season: ['fall', 'winter', 'spring'],
        imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=500&auto=format&fit=crop&q=60',
        tags: ['boots', 'leather', 'sleek'],
      },
    ];

    await Wardrobe.insertMany(items);
    console.log('Seeded 4 items via Mongoose successfully.');

    // 2. Go to studio
    await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle2' });
    await sleep(2000);

    // Capture loaded mannequin runway in Studio
    const studioShotPath = path.join(SCREENSHOT_DIR, '08_studio_curated_runway.png');
    await page.screenshot({ path: studioShotPath, fullPage: true });
    console.log(`Saved screenshot: ${studioShotPath}`);

    // Click Share Look button
    const shareBtns = await page.$$('button');
    for (const btn of shareBtns) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text.includes('Share Look')) {
        await btn.click();
        console.log('Clicked Share Look button');
        break;
      }
    }
    await sleep(800);

    const shareShotPath = path.join(SCREENSHOT_DIR, '09_studio_share_toast.png');
    await page.screenshot({ path: shareShotPath });
    console.log(`Saved screenshot: ${shareShotPath}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

run();
