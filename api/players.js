// api/players.js — GET/PATCH /api/players
import supabase from '../lib/db.js';
import { verify } from '../lib/jwt.js';
import { CURRENT_SEASON } from '../lib/config.js';

function auth(req) { return verify((req.headers.authorization || '').replace('Bearer ', '')); }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const session = auth(req);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  const url = new URL(req.url, 'http://localhost');
  const playerId = url.searchParams.get('id');
  if (req.method === 'GET') {
    if (playerId) {
      const { data, error } = await supabase.from('players').select('*, parents(*)').eq('id', playerId).single();
      if (error) return res.status(404).json({ error: 'Player not found' });
      return res.status(200).json(data);
    }
    const { data, error } = await supabase.from('players').select('*, parents(*)').eq('season', CURRENT_SEASON).order('squad').order('try_avg', { nullsFirst: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === 'PATCH') {
    if (session.role !== 'coach') return res.status(403).json({ error: 'Coach only' });
    if (!playerId) return res.status(400).json({ error: 'id required' });
    const allowed = ['squad', 'try_avg', 'year'];
    const updates = {};
    for (const key of allowed) { if (req.body?.[key] !== undefined) updates[key] = req.body[key]; }
    const { data, error } = await supabase.from('players').update(updates).eq('id', playerId).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, player: data });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
