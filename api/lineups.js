// api/lineups.js
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
    const { data, error } = await supabase.from('lineups').select('player_id').eq('event_id', eventId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data.map(r => r.player_id));
  }
  if (req.method === 'POST') {
    if (session.role !== 'coach') return res.status(403).json({ error: 'Coach only' });
    const { event_id, player_id, action } = req.body || {};
    if (!event_id || !player_id) return res.status(400).json({ error: 'event_id and player_id required' });
    if (action === 'remove') {
      const { error } = await supabase.from('lineups').delete().eq('event_id', event_id).eq('player_id', player_id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true, action: 'removed' });
    } else {
      const { error } = await supabase.from('lineups').upsert({ event_id, player_id }, { onConflict: 'event_id,player_id' });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true, action: 'added' });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
