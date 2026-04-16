import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const inquiries = await sql`SELECT * FROM inquiries ORDER BY created_at DESC`;
      return res.status(200).json(inquiries);
    }

    if (method === 'POST') {
      const { project_id, name, email, phone, message } = req.body;
      const [newInquiry] = await sql`
        INSERT INTO inquiries (project_id, name, email, phone, message)
        VALUES (${project_id || null}, ${name}, ${email || null}, ${phone}, ${message || null})
        RETURNING *
      `;
      return res.status(201).json(newInquiry);
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM inquiries WHERE id = ${id as string}`;
      return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error: any) {
    console.error('Inquiries API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
