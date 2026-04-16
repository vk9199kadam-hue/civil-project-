import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  const { project_id, id } = req.query;

  try {
    if (method === 'GET') {
      if (id) {
        const [unit] = await sql`SELECT * FROM units WHERE id = ${id as string}`;
        return res.status(200).json(unit);
      }
      const units = await sql`SELECT * FROM units WHERE project_id = ${project_id as string} ORDER BY unit_number ASC`;
      return res.status(200).json(units);
    }

    if (method === 'POST') {
      const { project_id, unit_number, size_sqft, bhk_type, price, floor, status, images } = req.body;
      const [newUnit] = await sql`
        INSERT INTO units (project_id, unit_number, size_sqft, bhk_type, price, floor, status, images)
        VALUES (${project_id}, ${unit_number}, ${size_sqft}, ${bhk_type}, ${price}, ${floor}, ${status}, ${images})
        RETURNING *
      `;
      return res.status(201).json(newUnit);
    }

    if (method === 'PUT') {
      const { unit_number, size_sqft, bhk_type, price, floor, status, images } = req.body;
      const [updatedUnit] = await sql`
        UPDATE units SET
          unit_number = ${unit_number},
          size_sqft = ${size_sqft},
          bhk_type = ${bhk_type},
          price = ${price},
          floor = ${floor},
          status = ${status},
          images = ${images}
        WHERE id = ${id as string}
        RETURNING *
      `;
      return res.status(200).json(updatedUnit);
    }

    if (method === 'DELETE') {
      await sql`DELETE FROM units WHERE id = ${id as string}`;
      return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error: any) {
    console.error('Units API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
