import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ainur_pos',
  user: process.env.DB_USER || process.env.USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
};

// Use DATABASE_URL if provided (for production)
if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;
  poolConfig.ssl = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;
}

export const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err.message);
});

// Initial connection test with retry
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log('Database connection established');
      client.release();
      return;
    } catch (err: any) {
      console.error(`Failed to connect to database (attempt ${i + 1}/${retries}):`, err.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error('Could not connect to database after retries. App will continue without initial connection test.');
};

connectWithRetry();

export default pool;
