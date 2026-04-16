import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("CRITICAL: DATABASE_URL is missing!");
}

// Strip query parameters for cleaner connection handling
const cleanUrl = connectionString?.split('?')[0] || '';

export const sql = postgres(cleanUrl, {
  ssl: { rejectUnauthorized: false }, 
  prepare: false, 
  connect_timeout: 10,
});


