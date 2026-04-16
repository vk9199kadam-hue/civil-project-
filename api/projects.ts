import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { id } = req.query;
      if (id) {
        const [project] = await sql`SELECT * FROM projects WHERE id = ${id as string}`;
        return res.status(200).json(project);
      }
      const projects = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
      return res.status(200).json(projects);
    }

    if (method === 'POST') {
      const { name, location, description, property_type, status, price_range, featured, images } = req.body;
      const [newProject] = await sql`
        INSERT INTO projects (name, location, description, property_type, status, price_range, featured, images)
        VALUES (${name}, ${location}, ${description}, ${property_type}, ${status}, ${price_range}, ${featured}, ${images})
        RETURNING *
      `;
      return res.status(201).json(newProject);
    }

    if (method === 'PUT') {
      const { id } = req.query;
      const { name, location, description, property_type, status, price_range, featured, images } = req.body;
      const [updatedProject] = await sql`
        UPDATE projects SET
          name = ${name},
          location = ${location},
          description = ${description},
          property_type = ${property_type},
          status = ${status},
          price_range = ${price_range},
          featured = ${featured},
          images = ${images},
          updated_at = now()
        WHERE id = ${id as string}
        RETURNING *
      `;
      return res.status(200).json(updatedProject);
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM projects WHERE id = ${id as string}`;
      return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
