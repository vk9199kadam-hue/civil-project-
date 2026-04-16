import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db';
import { signToken } from '../lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;

  try {
    const [user] = await sql`SELECT * FROM admin_users WHERE email = ${email}`;
    
    // For the first user setup, if no user exists, we can create one (Temporary)
    // Or just use a hardcoded admin for now since they are migrating
    if (!user) {
      if (email === 'admin@admin.com' && password === 'admin123') {
        const token = signToken({ email: 'admin@admin.com', role: 'admin' });
        return res.status(200).json({ token, user: { email: 'admin@admin.com' } });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ id: user.id, email: user.email });
    res.status(200).json({ token, user: { id: user.id, email: user.email } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
