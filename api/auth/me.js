// api/auth/me.js — GET /api/auth/me — verify token, return session
import { verify } from '../../lib/jwt.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const payload = verify(token);
  if (!payload) return res.status(401).json({ error: 'Invalid or expired session' });
  return res.status(200).json({ ok: true, user: payload });
}
