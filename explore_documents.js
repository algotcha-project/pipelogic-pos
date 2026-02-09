const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AINUR_URL = 'https://web.ainur.app';
const EMAIL = 'o_kytsuk@mail.ru';
const PASSWORD = 'olegister14041992';
const SCREENSHOTS_DIR = './ainur_screenshots/documents';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'uk-UA'
  });
  const page = await context.newPage();
  
  try {
    // Login
    console.log('Logging in...');
    await page.goto(AINUR_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await sleep(2000);
    
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].fill(EMAIL);
      await inputs[1].fill(PASSWORD);
      await page.keyboard.press('Enter');
    }
    await sleep(5000);
    console.log('Logged in. URL:', page.url());
    
    // Find and click "Create document" button
    console.log('\nLooking for Create document button...');
    await page.click('text=Create document');
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '00_create_document_menu.png'), fullPage: true });
    console.log('Screenshot: 00_create_document_menu.png');
    
    // Get all document type options
    const docTypes = [
      'Sale order',
      'Purchase', 
      'Return sale',
      'Return purchase',
      'Stocktake',
      'Stock adjustment',
      'Write-off',
      'Movement'
    ];
    
    // Document type details storage
    const documentDetails = {};
    
    for (let i = 0; i < docTypes.length; i++) {
      const docType = docTypes[i];
      console.log(`\n=== Exploring: ${docType} ===`);
      
      try {
        // Go back to dashboard and click Create document
        await page.goto(AINUR_URL, { waitUntil: 'networkidle' });
        await sleep(2000);
        
        // Click Create document
        await page.click('text=Create document');
        await sleep(1000);
        
        // Click the specific document type
        await page.click(`text=${docType}`);
        await sleep(3000);
        
        // Take screenshot of the form
        const filename = `${String(i + 1).padStart(2, '0')}_${docType.replace(/ /g, '_').toLowerCase()}.png`;
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, filename), fullPage: true });
        console.log(`Screenshot: ${filename}`);
        
        // Get form fields
        const formFields = await page.$$eval('input, select, textarea', elements => 
          elements.map(el => ({
            type: el.type || el.tagName.toLowerCase(),
            name: el.name || el.getAttribute('data-name') || '',
            placeholder: el.placeholder || '',
            id: el.id || '',
            class: el.className || ''
          }))
        );
        
        // Get labels
        const labels = await page.$$eval('label', elements => 
          elements.map(el => el.textContent?.trim())
        );
        
        // Get buttons
        const buttons = await page.$$eval('button', elements =>
          elements.map(el => el.textContent?.trim()).filter(t => t && t.length < 50)
        );
        
        documentDetails[docType] = {
          url: page.url(),
          formFields: formFields,
          labels: labels,
          buttons: buttons
        };
        
        console.log(`  URL: ${page.url()}`);
        console.log(`  Form fields: ${formFields.length}`);
        console.log(`  Labels:`, labels.filter(l => l).slice(0, 10));
        console.log(`  Buttons:`, buttons.slice(0, 10));
        
        // Look for sub-sections or tabs
        const tabs = await page.$$eval('[role="tab"], .tab, [class*="tab"]', elements =>
          elements.map(el => el.textContent?.trim())
        );
        if (tabs.length > 0) {
          console.log(`  Tabs:`, tabs);
        }
        
      } catch (error) {
        console.log(`  Error exploring ${docType}: ${error.message}`);
      }
    }
    
    // Save document details
    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, 'document_types.json'),
      JSON.stringify(documentDetails, null, 2)
    );
    console.log('\n\nSaved document details to document_types.json');
    
    // Also explore the sidebar menu items
    console.log('\n=== Exploring sidebar menu ===');
    const sidebarItems = [
      { name: 'Catalog', selector: 'text=Catalog' },
      { name: 'Orders', selector: 'text=Orders' },
      { name: 'Transactions', selector: 'text=Transactions' },
      { name: 'Reports', selector: 'text=Reports' },
      { name: 'Contacts', selector: 'text=Contacts' }
    ];
    
    for (const item of sidebarItems) {
      try {
        await page.click(item.selector);
        await sleep(2000);
        await page.screenshot({ 
          path: path.join(SCREENSHOTS_DIR, `sidebar_${item.name.toLowerCase()}.png`), 
          fullPage: true 
        });
        console.log(`Screenshot: sidebar_${item.name.toLowerCase()}.png`);
      } catch (e) {
        console.log(`Could not click ${item.name}`);
      }
    }
    
    console.log('\n\nExploration complete!');
    await sleep(5000);
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
