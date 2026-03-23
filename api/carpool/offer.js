// api/carpool/offer.js — POST/DELETE /api/carpool/offer
import supabase from '../../lib/db.js';
import { verify } from '../../lib/jwt.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const session = verify((req.headers.authorization || '').replace('Bearer ', ''));
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'POST') {
    const { event_id, driver_name, driver_phone, seats_total, is_coach } = req.body || {};
    if (!event_id || !driver_name || !seats_total) return res.status(400).json({ error: 'event_id, driver_name, seats_total required' });
    if (is_coach && session.role !== 'coach') return res.status(403).json({ error: 'Only coach can add coach offer' });
    const { data, error } = await supabase.from('carpool_offers').insert({ event_id, driver_name, driver_phone, seats_total, is_coach: !!is_coach }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ ok: true, offer: data });
  }
  if (req.method === 'DELETE') {
    if (session.role !== 'coach') return res.status(403).json({ error: 'Coach only' });
    const offerId = url.searchParams.get('id');
    if (!offerId) return res.status(400).json({ error: 'id required' });
    const { error } = await supabase.from('carpool_offers').delete().eq('id', offerId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
