import 'dotenv/config';
import postgres from 'postgres';

async function setupDB() {
  try {
    const cleanUrl = process.env.DATABASE_URL?.split('?')[0] || '';
    const sql = postgres(cleanUrl, {
      ssl: { rejectUnauthorized: false },
      prepare: false,
    });
    
    console.log("Setting up Enums...");
    await sql`CREATE TYPE IF NOT EXISTS property_type AS ENUM ('flat', 'villa', 'commercial', 'land', 'builder_project')`;
    await sql`CREATE TYPE IF NOT EXISTS project_status AS ENUM ('new_launch', 'under_construction', 'ready_to_move')`;
    await sql`CREATE TYPE IF NOT EXISTS unit_status AS ENUM ('available', 'booked', 'sold')`;

    console.log("Creating admin_users table...");
    await sql`CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email STRING UNIQUE NOT NULL,
        password_hash STRING NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )`;

    console.log("Creating projects table...");
    await sql`CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name STRING NOT NULL,
        location STRING NOT NULL,
        description STRING,
        property_type property_type NOT NULL DEFAULT 'flat',
        status project_status NOT NULL DEFAULT 'new_launch',
        price_range STRING,
        featured BOOLEAN DEFAULT false,
        images STRING[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )`;

    console.log("Creating units table...");
    await sql`CREATE TABLE IF NOT EXISTS units (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        unit_number STRING NOT NULL,
        size_sqft DECIMAL,
        bhk_type STRING,
        price DECIMAL,
        floor INT8,
        status unit_status NOT NULL DEFAULT 'available',
        images STRING[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )`;

    console.log("Creating inquiries table...");
    await sql`CREATE TABLE IF NOT EXISTS inquiries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        name STRING NOT NULL,
        email STRING,
        phone STRING NOT NULL,
        message STRING,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )`;

    // Check if the admin user exists
    console.log("Checking for default admin...");
    const [user] = await sql`SELECT * FROM admin_users WHERE email = 'admin@admin.com'`;
    if (!user) {
        // Create an admin user with password 'admin123'
        import('bcryptjs').then(async (bcrypt) => {
            const hash = await bcrypt.default.hash('admin123', 10);
            await sql`INSERT INTO admin_users (email, password_hash) VALUES ('admin@admin.com', ${hash})`;
            console.log("Setup complete! Admin account created.");
            process.exit(0);
        });
    } else {
        console.log("Setup complete! Admin already exists.");
        process.exit(0);
    }
  } catch (e) {
    console.error("Setup Error:", e);
    process.exit(1);
  }
}

setupDB();
