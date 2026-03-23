// api/events.js
import supabase from '../lib/db.js';
import { verify } from '../lib/jwt.js';
import { CURRENT_SEASON } from '../lib/config.js';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const session = verify(token);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  const url = new URL(req.url, 'http://localhost');
  const eventId = url.searchParams.get('id');
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('events').select('*').eq('season', CURRENT_SEASON).order('date');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === 'POST') {
    if (session.role !== 'coach') return res.status(403).json({ error: 'Coach only' });
    const { type, name, location, date, tee_time } = req.body || {};
    if (!name || !date) return res.status(400).json({ error: 'name and date required' });
    const { data, error } = await supabase.from('events').insert({ type: type || 'match', name, location, date, tee_time, season: CURRENT_SEASON }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ ok: true, event: data });
  }
  if (req.method === 'DELETE') {
    if (session.role !== 'coach') return res.status(403).json({ error: 'Coach only' });
    if (!eventId) return res.status(400).json({ error: 'id required' });
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
