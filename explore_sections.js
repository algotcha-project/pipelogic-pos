const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function exploreAinur() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  
  // Create screenshots directories
  const screenshotsDir = path.join(__dirname, 'ainur_screenshots', 'sections');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // Login to Ainur
    console.log('Logging in to Ainur...');
    await page.goto('https://web.ainur.app/auth/login');
    await page.waitForTimeout(2000);
    
    // Fill login form
    await page.fill('input[type="email"], input[placeholder*="Email"], input[placeholder*="email"]', 'o_kytsuk@mail.ru');
    await page.fill('input[type="password"]', 'olegister14041992');
    await page.click('button:has-text("Sign in"), button[type="submit"]');
    
    console.log('Waiting for dashboard...');
    await page.waitForTimeout(5000);
    
    // Take dashboard screenshot
    await page.screenshot({ path: path.join(screenshotsDir, '00_dashboard.png'), fullPage: false });
    console.log('Captured dashboard');

    // Sections to explore
    const sections = [
      { name: 'Orders', text: 'Orders', path: 'orders' },
      { name: 'Transactions', text: 'Transactions', path: 'transactions' },
      { name: 'Reports', text: 'Reports', path: 'reports' },
      { name: 'Catalog', text: 'Catalog', path: 'catalog' },
      { name: 'Contacts', text: 'Contacts', path: 'contacts' },
      { name: 'Company', text: 'Company', path: 'company' },
      { name: 'EStore', text: 'EStore', path: 'estore' },
      { name: 'Billing', text: 'Billing', path: 'billing' },
    ];

    const sectionDetails = {};

    for (const section of sections) {
      try {
        console.log(`Exploring ${section.name}...`);
        
        // Click on the sidebar item
        const sidebarItem = await page.$(`text="${section.text}"`);
        if (sidebarItem) {
          await sidebarItem.click();
          await page.waitForTimeout(2000);
          
          // Take screenshot
          await page.screenshot({ 
            path: path.join(screenshotsDir, `${section.path}.png`), 
            fullPage: false 
          });
          console.log(`Captured ${section.name}`);

          // Get current URL
          const url = page.url();
          
          // Try to find submenu items
          const subItems = await page.$$eval('.sidebar a, .menu a, nav a', links => 
            links.map(l => ({
              text: l.textContent?.trim(),
              href: l.getAttribute('href')
            }))
          );

          // Get main content structure
          const mainContent = await page.$$eval('h1, h2, h3, .title, .header', els => 
            els.map(el => el.textContent?.trim()).filter(Boolean)
          );

          // Get buttons
          const buttons = await page.$$eval('button', btns => 
            btns.map(b => b.textContent?.trim()).filter(Boolean)
          );

          sectionDetails[section.name] = {
            url,
            mainContent,
            buttons,
            subItems: subItems.filter(item => item.text && item.href)
          };

          // Go back to main page for next section
          await page.goto('https://web.ainur.app/');
          await page.waitForTimeout(2000);
        } else {
          console.log(`Could not find sidebar item for ${section.name}`);
        }
      } catch (err) {
        console.log(`Error exploring ${section.name}:`, err.message);
      }
    }

    // Explore Reports submenu in detail
    console.log('Exploring Reports submenu...');
    try {
      await page.click('text="Reports"');
      await page.waitForTimeout(2000);
      
      // Get all report types
      const reportLinks = await page.$$eval('a[href*="reports"], .menu-item', links => 
        links.map(l => ({
          text: l.textContent?.trim(),
          href: l.getAttribute('href')
        }))
      );

      // Take screenshot of reports main page
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'reports_main.png'), 
        fullPage: false 
      });

      sectionDetails['ReportsDetail'] = { reportLinks };

      // Click on different report types if available
      const reportTypes = ['Sales', 'Profit', 'Inventory', 'ABC', 'Employees'];
      for (const reportType of reportTypes) {
        try {
          const reportLink = await page.$(`text="${reportType}"`);
          if (reportLink) {
            await reportLink.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ 
              path: path.join(screenshotsDir, `reports_${reportType.toLowerCase()}.png`), 
              fullPage: false 
            });
            console.log(`Captured ${reportType} report`);
            
            // Go back
            await page.click('text="Reports"');
            await page.waitForTimeout(1000);
          }
        } catch (e) {
          console.log(`Could not capture ${reportType} report:`, e.message);
        }
      }
    } catch (err) {
      console.log('Error exploring Reports:', err.message);
    }

    // Save section details
    const outputPath = path.join(screenshotsDir, 'section_details.json');
    fs.writeFileSync(outputPath, JSON.stringify(sectionDetails, null, 2));
    console.log(`Saved section details to ${outputPath}`);

    console.log('Exploration complete!');

  } catch (error) {
    console.error('Error during exploration:', error);
  } finally {
    await browser.close();
  }
}

exploreAinur();
