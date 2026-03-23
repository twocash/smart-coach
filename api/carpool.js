// api/carpool.js — GET /api/carpool
import supabase from '../lib/db.js';
import { verify } from '../lib/jwt.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const session = verify((req.headers.authorization || '').replace('Bearer ', ''));
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const url = new URL(req.url, 'http://localhost');
  const eventId = url.searchParams.get('event_id');
  if (!eventId) return res.status(400).json({ error: 'event_id required' });
  const { data: offers, error } = await supabase.from('carpool_offers').select('*, carpool_riders(*)').eq('event_id', eventId).order('is_coach', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(offers);
}
