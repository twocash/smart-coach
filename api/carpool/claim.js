// api/carpool/claim.js — POST /api/carpool/claim — claim a seat
import supabase from '../../lib/db.js';
import { verify } from '../../lib/jwt.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const session = verify((req.headers.authorization || '').replace('Bearer ', ''));
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  const { offer_id, rider_name, rider_phone, player_id } = req.body || {};
  if (!offer_id || !rider_name) return res.status(400).json({ error: 'offer_id and rider_name required' });
  const { data: offer } = await supabase.from('carpool_offers').select('seats_total').eq('id', offer_id).single();
  const { count: taken } = await supabase.from('carpool_riders').select('*', { count: 'exact', head: true }).eq('offer_id', offer_id);
  if ((taken ?? 0) >= (offer?.seats_total ?? 0)) return res.status(409).json({ error: 'No seats available' });
  const { data, error } = await supabase.from('carpool_riders').insert({ offer_id, rider_name, rider_phone, player_id, needs_ride: true }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ ok: true, rider: data });
}
