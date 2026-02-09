const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Railway PostgreSQL connection
const DATABASE_URL = 'postgresql://postgres:KZUhDgqjlWbQitDTfimaDcfWOUFTFYwZ@tramway.proxy.rlwy.net:35984/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const DATA_DIR = path.join(__dirname, 'extracted_data');
const COMPANY_ID = '58c872aa3ce7d5fc688b49bd';

function loadJson(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`  ⚠️  File not found: ${filename}`);
    return [];
  }
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  return Array.isArray(data) ? data : [data];
}

async function importStores() {
  console.log('\n🏪 Importing STORES...');
  const data = loadJson('stores.json');
  let count = 0;
  
  for (const item of data) {
    try {
      await pool.query(`
        INSERT INTO stores (_id, _client, _user, name, shortname, address, type, "default", include, balance, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (_id) DO UPDATE SET name = EXCLUDED.name, balance = EXCLUDED.balance, updated = EXCLUDED.updated
      `, [
        item._id, item._client || COMPANY_ID, item._user, item.name, item.shortname,
        item.address, item.type || 'store', item.default || false, item.include !== false,
        JSON.stringify(item.balance || {}), item.created, item.updated, item.deleted || false
      ]);
      count++;
    } catch (e) { /* skip errors */ }
  }
  console.log(`   ✅ Imported ${count} stores`);
  return count;
}

async function importAccounts() {
  console.log('\n🏦 Importing ACCOUNTS...');
  const data = loadJson('accounts.json');
  let count = 0;
  
  for (const item of data) {
    try {
      await pool.query(`
        INSERT INTO accounts (_id, _client, _user, name, type, balance, include, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (_id) DO UPDATE SET name = EXCLUDED.name, balance = EXCLUDED.balance
      `, [
        item._id, item._client || COMPANY_ID, item._user, item.name, item.type,
        JSON.stringify(item.balance || {}), item.include !== false, item.created, item.updated, item.deleted || false
      ]);
      count++;
    } catch (e) { /* skip errors */ }
  }
  console.log(`   ✅ Imported ${count} accounts`);
  return count;
}

async function importMoneySources() {
  console.log('\n💳 Importing MONEY SOURCES...');
  const data = loadJson('money_sources.json');
  let count = 0;
  
  for (const item of data) {
    try {
      await pool.query(`
        INSERT INTO money_sources (_id, id, title, type, country)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (_id) DO UPDATE SET title = EXCLUDED.title
      `, [item._id, item.id, item.title, item.type, item.country]);
      count++;
    } catch (e) { /* skip errors */ }
  }
  console.log(`   ✅ Imported ${count} money sources`);
  return count;
}

async function importCategories() {
  console.log('\n📁 Importing CATEGORIES...');
  const data = loadJson('categories.json');
  let count = 0;
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (typeof item === 'string') {
      try {
        await pool.query(`
          INSERT INTO categories (_id, _client, name, sort_order, deleted)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (_id) DO UPDATE SET name = EXCLUDED.name
        `, [`cat_${String(i).padStart(5, '0')}`, COMPANY_ID, item, i, false]);
        count++;
      } catch (e) { /* skip errors */ }
    }
  }
  console.log(`   ✅ Imported ${count} categories`);
  return count;
}

async function importProducts() {
  console.log('\n📦 Importing PRODUCTS...');
  const data = loadJson('products.json');
  let count = 0;
  
  for (const item of data) {
    try {
      await pool.query(`
        INSERT INTO products (_id, _client, _user, name, sku, barcode, code, type, price, cost, purchase,
                              discount, total_stock, stock, categories, unit, description, pic, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        ON CONFLICT (_id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, total_stock = EXCLUDED.total_stock, stock = EXCLUDED.stock
      `, [
        item._id, item._client || COMPANY_ID, item._user, (item.name || '').substring(0, 500),
        item.sku, item.barcode, item.code, item.type || 'inventory',
        item.price || 0, item.cost || 0, item.purchase || 0, item.discount || 0,
        item.total_stock || 0, JSON.stringify(item.stock || {}), JSON.stringify(item.categories || []),
        item.unit, item.description, item.pic, item.created, item.updated, item.deleted || false
      ]);
      count++;
    } catch (e) { /* skip errors */ }
  }
  console.log(`   ✅ Imported ${count} products`);
  return count;
}

async function importCustomers() {
  console.log('\n👥 Importing CUSTOMERS...');
  const data = loadJson('customers.json');
  let count = 0;
  
  for (const item of data) {
    try {
      await pool.query(`
        INSERT INTO customers (_id, _client, _user, name, type, phones, emails, discount, debt, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (_id) DO UPDATE SET name = EXCLUDED.name, phones = EXCLUDED.phones, debt = EXCLUDED.debt
      `, [
        item._id, item._client || COMPANY_ID, item._user, item.name || 'Unknown', item.type || 'person',
        JSON.stringify(item.phones || []), JSON.stringify(item.emails || []),
        item.discount || 0, item.debt || 0, item.created, item.updated, item.deleted || false
      ]);
      count++;
    } catch (e) { /* skip errors */ }
  }
  console.log(`   ✅ Imported ${count} customers`);
  return count;
}

async function importSuppliers() {
  console.log('\n🏭 Importing SUPPLIERS...');
  const data = loadJson('suppliers.json');
  let count = 0;
  
  for (const item of data) {
    try {
      await pool.query(`
        INSERT INTO suppliers (_id, _client, _user, name, phones, emails, debt, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (_id) DO UPDATE SET name = EXCLUDED.name, debt = EXCLUDED.debt
      `, [
        item._id, item._client || COMPANY_ID, item._user, item.name || 'Unknown',
        JSON.stringify(item.phones || []), JSON.stringify(item.emails || []),
        item.debt || 0, item.created, item.updated, item.deleted || false
      ]);
      count++;
    } catch (e) { /* skip errors */ }
  }
  console.log(`   ✅ Imported ${count} suppliers`);
  return count;
}

async function importRegisters() {
  console.log('\n🖥️ Importing REGISTERS...');
  const data = loadJson('registers.json');
  let count = 0;
  
  for (const item of data) {
    try {
      await pool.query(`
        INSERT INTO registers (_id, _client, _user, _store, name, type, settings, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (_id) DO UPDATE SET name = EXCLUDED.name
      `, [
        item._id, item._client || COMPANY_ID, item._user, item._store, item.name, item.type,
        JSON.stringify(item.settings || {}), item.created, item.updated, item.deleted || false
      ]);
      count++;
    } catch (e) { /* skip errors */ }
  }
  console.log(`   ✅ Imported ${count} registers`);
  return count;
}

async function importDocuments() {
  console.log('\n📄 Importing DOCUMENTS...');
  const data = loadJson('documents.json');
  let count = 0;
  
  for (const item of data) {
    try {
      await pool.query(`
        INSERT INTO documents (_id, _client, _user, _shift, type, number, status, date, store, "from", "to",
                              sum, paid, discount_percent, discount_sum, products, payments, notes, comment, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        ON CONFLICT (_id) DO UPDATE SET status = EXCLUDED.status, sum = EXCLUDED.sum, paid = EXCLUDED.paid
      `, [
        item._id, item._client || COMPANY_ID, item._user, item._shift, item.type || 'sale', item.number,
        item.status !== false, item.date, item.store,
        JSON.stringify(item.from || {}), JSON.stringify(item.to || {}),
        item.sum || 0, item.paid || 0, item.discount_percent || 0, item.discount_sum || 0,
        JSON.stringify(item.products || []), JSON.stringify(item.payments || []),
        item.notes, item.comment, item.created, item.updated, item.deleted || false
      ]);
      count++;
      if (count % 1000 === 0) console.log(`      ... ${count} documents`);
    } catch (e) { /* skip errors */ }
  }
  console.log(`   ✅ Imported ${count} documents`);
  return count;
}

async function importMoneyMovements() {
  console.log('\n💵 Importing MONEY MOVEMENTS...');
  const data = loadJson('money_movements.json');
  let count = 0;
  
  for (const item of data) {
    try {
      await pool.query(`
        INSERT INTO money_movements (_id, _client, _user, _document, _shift, type, sum, date, "from", "to",
                                    account, source, reason, description, comment, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (_id) DO UPDATE SET sum = EXCLUDED.sum
      `, [
        item._id, item._client || COMPANY_ID, item._user, item._document, item._shift,
        item.type || 'debit', item.sum || 0, item.date,
        JSON.stringify(item.from || {}), JSON.stringify(item.to || {}),
        item.account, JSON.stringify(item.source || {}),
        item.reason, item.description, item.comment, item.created, item.updated, item.deleted || false
      ]);
      count++;
      if (count % 1000 === 0) console.log(`      ... ${count} money movements`);
    } catch (e) { /* skip errors */ }
  }
  console.log(`   ✅ Imported ${count} money movements`);
  return count;
}

async function importShifts() {
  console.log('\n⏰ Importing SHIFTS...');
  const data = loadJson('shifts.json');
  let count = 0;
  
  for (const item of data) {
    try {
      await pool.query(`
        INSERT INTO shifts (_id, _client, _user, _store, _register, number, status, opened_at, closed_at,
                           opening_balance, closing_balance, cash_sales, card_sales, total_sales, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (_id) DO UPDATE SET status = EXCLUDED.status, closing_balance = EXCLUDED.closing_balance
      `, [
        item._id, item._client || COMPANY_ID, item._user, item._store, item._register,
        item.number, item.status || 'closed', item.opened_at, item.closed_at,
        item.opening_balance || 0, item.closing_balance || 0, item.cash_sales || 0,
        item.card_sales || 0, item.total_sales || 0, item.created, item.updated, item.deleted || false
      ]);
      count++;
    } catch (e) { /* skip errors */ }
  }
  console.log(`   ✅ Imported ${count} shifts`);
  return count;
}

async function main() {
  console.log('='.repeat(80));
  console.log('🚀 IMPORTING ALL AINUR DATA TO RAILWAY POSTGRESQL');
  console.log('='.repeat(80));
  console.log(`Started: ${new Date().toISOString()}`);
  console.log(`Data source: ${DATA_DIR}`);
  console.log('='.repeat(80));
  
  try {
    console.log('\n🔌 Connecting to database...');
    await pool.query('SELECT 1');
    console.log('   ✅ Connected!');
    
    const results = {};
    results.stores = await importStores();
    results.accounts = await importAccounts();
    results.money_sources = await importMoneySources();
    results.categories = await importCategories();
    results.products = await importProducts();
    results.customers = await importCustomers();
    results.suppliers = await importSuppliers();
    results.registers = await importRegisters();
    results.shifts = await importShifts();
    results.documents = await importDocuments();
    results.money_movements = await importMoneyMovements();
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(80));
    
    let total = 0;
    for (const [name, count] of Object.entries(results)) {
      total += count;
      console.log(`   ${name.padEnd(20)}: ${String(count).padStart(10)}`);
    }
    console.log('-'.repeat(80));
    console.log(`   ${'TOTAL'.padEnd(20)}: ${String(total).padStart(10)}`);
    console.log('='.repeat(80));
    
    // Verify data
    console.log('\n🔍 Verifying imported data...');
    const tables = ['stores', 'accounts', 'products', 'customers', 'suppliers', 'documents', 'money_movements'];
    for (const table of tables) {
      const res = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`   ${table.padEnd(20)}: ${String(res.rows[0].count).padStart(10)} rows in DB`);
    }
    
    console.log('\n✅ IMPORT COMPLETE!');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
