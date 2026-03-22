// api/auth.js
// POST /api/auth       — verify PIN, return JWT
// POST /api/auth/setup — first-time PIN creation (coach only)
// GET  /api/auth/me    — verify token, return session info

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const path = req.url.replace(/\?.*$/, '');
  if (req.method === 'GET') {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const payload = verify(token);
    if (!payload) return res.status(401).json({ error: 'Invalid or expired session' });
    return res.status(200).json({ ok: true, user: payload });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { pin, role, identifier } = req.body || {};
  if (path.endsWith('/setup')) {
    if (!pin || pin.length < 4) return res.status(400).json({ error: 'PIN must be at least 4 digits' });
    if (!role || !['coach','player','parent'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const pin_hash = hashPin(String(pin));
    if (role === 'coach') {
      const { data: existing } = await supabase.from('users').select('id').eq('role', 'coach').single();
      if (existing) {
        const token = (req.headers.authorization || '').replace('Bearer ', '');
        const payload = verify(token);
        if (!payload || payload.role !== 'coach') return res.status(403).json({ error: 'Must be authenticated as coach to reset PIN' });
        const { error } = await supabase.from('users').update({ pin_hash }).eq('role', 'coach');
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ ok: true, message: 'Coach PIN updated' });
      }
      const { data, error } = await supabase.from('users').insert({ role: 'coach', name: 'Coach', pin_hash }).select('id, role, name').single();
      if (error) return res.status(500).json({ error: error.message });
      const token = sign({ id: data.id, role: 'coach', name: 'Coach', exp: Math.floor(Date.now()/1000) + 86400 * 30 });
      return res.status(201).json({ ok: true, token, user: data });
    }
    if (role === 'player') {
      const legacyId = parseInt(identifier);
      if (!legacyId) return res.status(400).json({ error: 'Player identifier required' });
      const { data: player, error: pe } = await supabase.from('players').select('id, first, last, user_id').eq('legacy_id', legacyId).single();
      if (pe || !player) return res.status(404).json({ error: 'Player not found' });
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      const payload = verify(token);
      if (!payload || payload.role !== 'coach') return res.status(403).json({ error: 'Coach authentication required to set player PINs' });
      let userId = player.user_id;
      if (userId) { await supabase.from('users').update({ pin_hash }).eq('id', userId); }
      else {
        const { data: newUser, error: ue } = await supabase.from('users').insert({ role: 'player', name: `${player.first} ${player.last}`, pin_hash }).select('id').single();
        if (ue) return res.status(500).json({ error: ue.message });
        userId = newUser.id;
        await supabase.from('players').update({ user_id: userId }).eq('id', player.id);
      }
      return res.status(200).json({ ok: true, message: `PIN set for ${player.first} ${player.last}` });
    }
    if (role === 'parent') {
      if (!identifier) return res.status(400).json({ error: 'Phone number required' });
      const phone = identifier.replace(/\D/g, '');
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      const payload = verify(token);
      if (!payload || payload.role !== 'coach') return res.status(403).json({ error: 'Coach authentication required to set parent PINs' });
      const { data: parentRec } = await supabase.from('parents').select('id, name, user_id').eq('phone', phone).single();
      if (!parentRec) return res.status(404).json({ error: 'Parent not found - add them to a player first' });
      let userId = parentRec.user_id;
      if (userId) { await supabase.from('users').update({ pin_hash }).eq('id', userId); }
      else {
        const { data: newUser, error: ue } = await supabase.from('users').insert({ role: 'parent', name: parentRec.name, phone, pin_hash }).select('id').single();
        if (ue) return res.status(500).json({ error: ue.message });
        userId = newUser.id;
        await supabase.from('parents').update({ user_id: userId }).eq('id', parentRec.id);
      }
      return res.status(200).json({ ok: true, message: 'Parent PIN set' });
    }
  }
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
