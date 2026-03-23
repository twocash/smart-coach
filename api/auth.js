// api/auth.js — POST /api/auth — verify PIN, return JWT
import supabase from '../lib/db.js';
import { sign, verify } from '../lib/jwt.js';
import crypto from 'crypto';

function hashPin(pin, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pin, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPin(pin, stored) {
  const [salt] = stored.split(':');
  return hashPin(pin, salt) === stored;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { pin, role, identifier } = req.body || {};
  if (!pin || !role) return res.status(400).json({ error: 'pin and role required' });
  if (role === 'coach') {
    const { data: user, error } = await supabase.from('users').select('id, role, name, pin_hash').eq('role', 'coach').single();
    if (error || !user) return res.status(404).json({ error: 'No coach account found. Create one first.' });
    if (!verifyPin(String(pin), user.pin_hash)) return res.status(401).json({ error: 'Wrong PIN' });
    const token = sign({ id: user.id, role: 'coach', name: user.name, exp: Math.floor(Date.now()/1000) + 86400 * 30 });
    return res.status(200).json({ ok: true, token, user: { id: user.id, role: 'coach', name: user.name } });
  }
  if (role === 'player') {
    const legacyId = parseInt(identifier);
    const { data: player } = await supabase.from('players').select('id, first, last, user_id').eq('legacy_id', legacyId).single();
    if (!player?.user_id) return res.status(404).json({ error: 'No PIN set for this player yet. Ask Coach.' });
    const { data: user } = await supabase.from('users').select('id, pin_hash').eq('id', player.user_id).single();
    if (!user) return res.status(404).json({ error: 'Account not found' });
    if (!verifyPin(String(pin), user.pin_hash)) return res.status(401).json({ error: 'Wrong PIN' });
    const token = sign({ id: user.id, role: 'player', playerId: player.id, name: `${player.first} ${player.last}`, legacyId, exp: Math.floor(Date.now()/1000) + 86400 * 30 });
    return res.status(200).json({ ok: true, token, user: { id: user.id, role: 'player', playerId: player.id, name: `${player.first} ${player.last}`, legacyId } });
  }
  if (role === 'parent') {
    const phone = (identifier || '').replace(/\D/g, '');
    const { data: parent } = await supabase.from('parents').select('id, name, user_id').eq('phone', phone).single();
    if (!parent?.user_id) return res.status(404).json({ error: 'No PIN set for this number yet. Ask Coach.' });
    const { data: user } = await supabase.from('users').select('id, pin_hash').eq('id', parent.user_id).single();
    if (!user) return res.status(404).json({ error: 'Account not found' });
    if (!verifyPin(String(pin), user.pin_hash)) return res.status(401).json({ error: 'Wrong PIN' });
    const token = sign({ id: user.id, role: 'parent', parentId: parent.id, phone, name: parent.name, exp: Math.floor(Date.now()/1000) + 86400 * 30 });
    return res.status(200).json({ ok: true, token, user: { id: user.id, role: 'parent', parentId: parent.id, phone, name: parent.name } });
  }
  return res.status(400).json({ error: 'Invalid role' });
}
