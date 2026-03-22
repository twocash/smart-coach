// api/swing-note.js
import { verify } from '../lib/jwt.js';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const session = verify((req.headers.authorization || '').replace('Bearer ', ''));
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  if (session.role !== 'coach') return res.status(403).json({ error: 'Coach only' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { playerProfile, lessonFocus } = req.body || {};
  if (!playerProfile) return res.status(400).json({ error: 'playerProfile required' });
  const systemPrompt = `You are the coaching intelligence behind Fairway Forward. Generate swing notes that sound like they came from the head coach. Affirm first. One lesson. Six layers: Affirmation, Lesson Focus, Drill, Body Work, Mental Cue, Lesson Beyond the Lesson (spiritual).`;
  const userPrompt = `Generate a complete swing note for this player.\n\nPlayer profile:\n${JSON.stringify(playerProfile, null, 2)}\n\n${lessonFocus ? `Lesson focus: ${lessonFocus}` : ''}\n\nSix layers, in order. No headers.`;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 1200, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }] }) });
    if (!response.ok) { const err = await response.text(); return res.status(502).json({ error: 'Claude API error', detail: err }); }
    const data = await response.json();
    return res.status(200).json({ ok: true, note: data.content?.[0]?.text || '' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}
