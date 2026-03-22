// api/signups.js
import supabase from '../lib/db.js';
import { verify } from '../lib/jwt.js';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const session = verify((req.headers.authorization || '').replace('Bearer ', ''));
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  const url = new URL(req.url, 'http://localhost');
  const eventId = url.searchParams.get('event_id');
  if (req.method === 'GET') {
    if (!eventId) return res.status(400).json({ error: 'event_id required' });
    const { data, error } = await supabase.from('parent_signups').select('user_id, attending, bring').eq('event_id', eventId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === 'POST') {
    const { event_id, attending, bring } = req.body || {};
    if (!event_id) return res.status(400).json({ error: 'event_id required' });
    const userId = session.id;
    const { data, error } = await supabase.from('parent_signups').upsert({ event_id, user_id: userId, attending: !!attending, bring: bring || '' }, { onConflict: 'event_id,user_id' }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, signup: data });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
