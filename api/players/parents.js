// api/players/parents.js — POST/DELETE /api/players/parents
import supabase from '../../lib/db.js';
import { verify } from '../../lib/jwt.js';

function auth(req) { return verify((req.headers.authorization || '').replace('Bearer ', '')); }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const session = auth(req);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  if (session.role !== 'coach' && session.role !== 'player') return res.status(403).json({ error: 'Not authorized' });
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'POST') {
    const { player_id, name, phone } = req.body || {};
    if (!player_id || !phone) return res.status(400).json({ error: 'player_id and phone required' });
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return res.status(400).json({ error: 'Invalid phone number' });
    if (session.role === 'player' && session.playerId !== player_id) return res.status(403).json({ error: 'Can only add parents to your own profile' });
    const { data, error } = await supabase.from('parents').insert({ player_id, name: name || 'Parent', phone: cleanPhone }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ ok: true, parent: data });
  }
  if (req.method === 'DELETE') {
    const parentId = url.searchParams.get('id');
    if (!parentId) return res.status(400).json({ error: 'id required' });
    const { error } = await supabase.from('parents').delete().eq('id', parentId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
