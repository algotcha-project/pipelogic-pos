const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AINUR_URL = 'https://web.ainur.app';
const EMAIL = 'o_kytsuk@mail.ru';
const PASSWORD = 'olegister14041992';
const SCREENSHOTS_DIR = './ainur_screenshots';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // Create screenshots directory
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'uk-UA'
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to Ainur
    console.log('Navigating to Ainur...');
    await page.goto(AINUR_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await sleep(2000);
    
    // Login - use placeholder text to find inputs
    console.log('Logging in...');
    const emailInput = await page.$('input[placeholder*="Email"], input[placeholder*="email"], input[placeholder*="phone"]');
    const passwordInput = await page.$('input[placeholder*="Password"], input[placeholder*="password"], input[type="password"]');
    
    if (emailInput && passwordInput) {
      await emailInput.fill(EMAIL);
      await passwordInput.fill(PASSWORD);
      
      // Click Sign in button
      await page.click('button:has-text("Sign in"), button:has-text("Login"), button[type="submit"]');
      console.log('Clicked login button');
    } else {
      // Try clicking on inputs directly
      const inputs = await page.$$('input');
      if (inputs.length >= 2) {
        await inputs[0].fill(EMAIL);
        await inputs[1].fill(PASSWORD);
        await page.keyboard.press('Enter');
      }
    }
    
    // Wait for navigation
    await sleep(5000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_after_login.png'), fullPage: true });
    console.log('Screenshot: 02_after_login.png');
    
    // Check current URL
    console.log('Current URL:', page.url());
    
    // Wait for page to fully load
    await sleep(3000);
    
    // Take dashboard screenshot
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_dashboard.png'), fullPage: true });
    console.log('Screenshot: 03_dashboard.png');
    
    // Get all visible text elements to understand the UI
    const allText = await page.$$eval('*', elements => {
      return elements
        .filter(el => el.textContent && el.children.length === 0)
        .map(el => el.textContent.trim())
        .filter(t => t.length > 0 && t.length < 100);
    });
    console.log('Page text elements:', [...new Set(allText)].slice(0, 50));
    
    // Look for menu/sidebar items
    const menuItems = await page.$$eval('a, button', elements => 
      elements
        .map(el => ({ 
          text: el.textContent?.trim(), 
          href: el.getAttribute('href'),
          class: el.className
        }))
        .filter(item => item.text && item.text.length > 0 && item.text.length < 50)
    );
    console.log('Menu items found:', menuItems.length);
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'menu_items.json'), JSON.stringify(menuItems, null, 2));
    
    // Look for document creation button/link
    console.log('\nSearching for document creation options...');
    
    // Try different selectors for "create document"
    const createSelectors = [
      'text=Створити',
      'text=створити',
      'text=Create',
      'button:has-text("+")',
      '[class*="create"]',
      '[class*="add"]',
      'text=документ',
      'text=Документ'
    ];
    
    for (const selector of createSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} elements matching: ${selector}`);
        }
      } catch (e) {
        // Continue
      }
    }
    
    // Try to find and click on sidebar/menu items
    const sidebarLinks = await page.$$('nav a, .sidebar a, aside a');
    console.log(`Found ${sidebarLinks.length} sidebar links`);
    
    // Take screenshot of any dropdown/modal that might appear
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_current_state.png'), fullPage: true });
    
    // Save page HTML for analysis
    const html = await page.content();
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'page_content.html'), html);
    console.log('Saved page HTML');
    
    console.log('\nExploration complete! Check ainur_screenshots folder.');
    
    // Keep browser open for manual inspection
    console.log('\nBrowser will stay open for 30 seconds for manual inspection...');
    await sleep(30000);
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
