const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:KZUhDgqjlWbQitDTfimaDcfWOUFTFYwZ@tramway.proxy.rlwy.net:35984/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runSchema() {
  console.log('Running schema...');
  const schema = fs.readFileSync(path.join(__dirname, 'backend/src/database/schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('Schema created successfully!');
}

async function importData() {
  const dataDir = path.join(__dirname, 'extracted_data');
  
  // Import stores
  console.log('Importing stores...');
  const stores = JSON.parse(fs.readFileSync(path.join(dataDir, 'stores.json'), 'utf8'));
  for (const store of stores) {
    try {
      await pool.query(`
        INSERT INTO stores (_id, _client, _user, name, shortname, address, type, "default", include, balance, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (_id) DO NOTHING
      `, [
        store._id, store._client, store._user, store.name, store.shortname,
        store.address, store.type || 'store', store.default || false, 
        store.include !== false, JSON.stringify(store.balance || {}),
        store.created, store.updated, store.deleted || false
      ]);
    } catch (e) {
      console.log(`  Error inserting store ${store._id}: ${e.message}`);
    }
  }
  console.log(`  Imported ${stores.length} stores`);

  // Import categories
  console.log('Importing categories...');
  const categories = JSON.parse(fs.readFileSync(path.join(dataDir, 'categories.json'), 'utf8'));
  for (const cat of categories) {
    try {
      await pool.query(`
        INSERT INTO categories (_id, _client, name, parent_id, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (_id) DO NOTHING
      `, [cat._id, cat._client, cat.name, cat.parent_id, cat.created, cat.updated, cat.deleted || false]);
    } catch (e) {
      console.log(`  Error inserting category ${cat._id}: ${e.message}`);
    }
  }
  console.log(`  Imported ${categories.length} categories`);

  // Import products
  console.log('Importing products...');
  const products = JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf8'));
  let productCount = 0;
  for (const prod of products) {
    try {
      await pool.query(`
        INSERT INTO products (_id, _client, _user, name, sku, barcode, code, type, price, cost, purchase, 
                              discount, total_stock, stock, categories, unit, description, pic, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        ON CONFLICT (_id) DO NOTHING
      `, [
        prod._id, prod._client, prod._user, prod.name, prod.sku, prod.barcode, prod.code,
        prod.type || 'inventory', prod.price || 0, prod.cost || 0, prod.purchase || 0,
        prod.discount || 0, prod.total_stock || 0, JSON.stringify(prod.stock || {}),
        JSON.stringify(prod.categories || []), prod.unit, prod.description, prod.pic,
        prod.created, prod.updated, prod.deleted || false
      ]);
      productCount++;
    } catch (e) {
      // Skip errors silently for products
    }
  }
  console.log(`  Imported ${productCount} products`);

  // Import customers
  console.log('Importing customers...');
  const customers = JSON.parse(fs.readFileSync(path.join(dataDir, 'customers.json'), 'utf8'));
  for (const cust of customers) {
    try {
      await pool.query(`
        INSERT INTO customers (_id, _client, _user, name, type, phones, emails, discount, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (_id) DO NOTHING
      `, [
        cust._id, cust._client, cust._user, cust.name, cust.type || 'person',
        JSON.stringify(cust.phones || []), JSON.stringify(cust.emails || []),
        cust.discount || 0, cust.created, cust.updated, cust.deleted || false
      ]);
    } catch (e) {
      // Skip errors silently
    }
  }
  console.log(`  Imported ${customers.length} customers`);

  // Import suppliers
  console.log('Importing suppliers...');
  const suppliers = JSON.parse(fs.readFileSync(path.join(dataDir, 'suppliers.json'), 'utf8'));
  for (const sup of suppliers) {
    try {
      await pool.query(`
        INSERT INTO suppliers (_id, _client, _user, name, phones, emails, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (_id) DO NOTHING
      `, [
        sup._id, sup._client, sup._user, sup.name,
        JSON.stringify(sup.phones || []), JSON.stringify(sup.emails || []),
        sup.created, sup.updated, sup.deleted || false
      ]);
    } catch (e) {
      // Skip errors silently
    }
  }
  console.log(`  Imported ${suppliers.length} suppliers`);

  // Import accounts
  console.log('Importing accounts...');
  const accounts = JSON.parse(fs.readFileSync(path.join(dataDir, 'accounts.json'), 'utf8'));
  for (const acc of accounts) {
    try {
      await pool.query(`
        INSERT INTO accounts (_id, _client, _user, name, type, balance, include, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (_id) DO NOTHING
      `, [
        acc._id, acc._client, acc._user, acc.name, acc.type,
        JSON.stringify(acc.balance || {}), acc.include !== false,
        acc.created, acc.updated, acc.deleted || false
      ]);
    } catch (e) {
      // Skip errors silently
    }
  }
  console.log(`  Imported ${accounts.length} accounts`);

  // Import registers
  console.log('Importing registers...');
  const registers = JSON.parse(fs.readFileSync(path.join(dataDir, 'registers.json'), 'utf8'));
  for (const reg of registers) {
    try {
      await pool.query(`
        INSERT INTO registers (_id, _client, _user, _store, name, type, settings, created, updated, deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (_id) DO NOTHING
      `, [
        reg._id, reg._client, reg._user, reg._store, reg.name, reg.type,
        JSON.stringify(reg.settings || {}), reg.created, reg.updated, reg.deleted || false
      ]);
    } catch (e) {
      // Skip errors silently
    }
  }
  console.log(`  Imported ${registers.length} registers`);
}

async function main() {
  try {
    console.log('Connecting to database...');
    console.log('Using URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
    
    await runSchema();
    await importData();
    
    console.log('\nDatabase setup complete!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
