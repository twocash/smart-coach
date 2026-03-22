// api/carpool.js
import supabase from '../lib/db.js';
import { verify } from '../lib/jwt.js';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const session = verify((req.headers.authorization || '').replace('Bearer ', ''));
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  const url = new URL(req.url, 'http://localhost');
  const eventId = url.searchParams.get('event_id');
  const path = req.url.replace(/\?.*$/, '');
  if (req.method === 'GET') {
    if (!eventId) return res.status(400).json({ error: 'event_id required' });
    const { data: offers, error } = await supabase.from('carpool_offers').select('*, carpool_riders(*)').eq('event_id', eventId).order('is_coach', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(offers);
  }
  if (path.endsWith('/offer') && req.method === 'POST') {
    const { event_id, driver_name, driver_phone, seats_total, is_coach } = req.body || {};
    if (!event_id || !driver_name || !seats_total) return res.status(400).json({ error: 'event_id, driver_name, seats_total required' });
    if (is_coach && session.role !== 'coach') return res.status(403).json({ error: 'Only coach can add coach offer' });
    const { data, error } = await supabase.from('carpool_offers').insert({ event_id, driver_name, driver_phone, seats_total, is_coach: !!is_coach }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ ok: true, offer: data });
  }
  if (path.endsWith('/offer') && req.method === 'DELETE') {
    if (session.role !== 'coach') return res.status(403).json({ error: 'Coach only' });
    const offerId = url.searchParams.get('id');
    if (!offerId) return res.status(400).json({ error: 'id required' });
    const { error } = await supabase.from('carpool_offers').delete().eq('id', offerId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }
  if (path.endsWith('/claim') && req.method === 'POST') {
    const { offer_id, rider_name, rider_phone, player_id } = req.body || {};
    if (!offer_id || !rider_name) return res.status(400).json({ error: 'offer_id and rider_name required' });
    const { data: offer } = await supabase.from('carpool_offers').select('seats_total, carpool_riders(count)').eq('id', offer_id).single();
    const taken = offer?.carpool_riders?.[0]?.count || 0;
    if (taken >= offer?.seats_total) return res.status(409).json({ error: 'No seats available' });
    const { data, error } = await supabase.from('carpool_riders').insert({ offer_id, rider_name, rider_phone, player_id, needs_ride: true }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ ok: true, rider: data });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
