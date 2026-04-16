import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from './lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).end();

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) return res.status(401).end();

  res.status(200).json({ user: decoded });
}
