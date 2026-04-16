import 'dotenv/config';
import postgres from 'postgres';

async function test() {
  console.log("URL from ENV:", process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@') : 'MISSING');
  try {
    const cleanUrl = process.env.DATABASE_URL?.split('?')[0] || '';
    const sql = postgres(cleanUrl, {
      ssl: { rejectUnauthorized: false },
      prepare: false,
      connect_timeout: 10,
    });
    
    // Test basic connection
    const [{ result }] = await sql`SELECT 1 as result`;
    console.log("DB Connection SUCCESS, result =", result);
    
    // Check if admin_users table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Tables in DB:", tables.map(t => t.table_name).join(', '));
    
    process.exit(0);
  } catch (e) {
    console.error("DB Error:", e);
    process.exit(1);
  }
}

test();
