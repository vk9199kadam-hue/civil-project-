import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("CRITICAL: DATABASE_URL is missing!");
}

export const sql = postgres(connectionString || '', {
  ssl: { rejectUnauthorized: false }, // Necessary for some CockroachDB cloud environments
  prepare: false, 
  connect_timeout: 10,
});

