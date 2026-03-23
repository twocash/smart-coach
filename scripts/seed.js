// scripts/seed.js — Seed test data into Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load env from .env file
const envFile = readFileSync(new URL('../.env', import.meta.url), 'utf-8');
const env = Object.fromEntries(envFile.split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split('=')));

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// ┌──────────────────────────────────────────────────────────┐
// │ LOOKUP KEY — Dev-only anonymized test data              │
// │ legacy_id 1: Player Alpha  (V, Jr)  — Parent Alpha     │
// │ legacy_id 2: Player Bravo  (V, Sr)  — Parent Bravo     │
// │ legacy_id 3: Player Charlie (V, Jr)                     │
// │ legacy_id 4: Player Delta  (V, So)                      │
// │ legacy_id 5: Player Echo   (JV, Fr)                     │
// │ legacy_id 6: Player Foxtrot (JV, Fr)                    │
// │ Coach PIN: 1234                                         │
// │ All phones: 317-555-01xx                                │
// └──────────────────────────────────────────────────────────┘
const PLAYERS = [
  { legacy_id: 1, first: 'Player', last: 'Alpha', squad: 'v', year: 11, try_avg: 38.2, season: '2026' },
  { legacy_id: 2, first: 'Player', last: 'Bravo', squad: 'v', year: 12, try_avg: 36.5, season: '2026' },
  { legacy_id: 3, first: 'Player', last: 'Charlie', squad: 'v', year: 11, try_avg: 39.1, season: '2026' },
  { legacy_id: 4, first: 'Player', last: 'Delta', squad: 'v', year: 10, try_avg: 41.0, season: '2026' },
  { legacy_id: 5, first: 'Player', last: 'Echo', squad: 'jv', year: 9, try_avg: 44.3, season: '2026' },
  { legacy_id: 6, first: 'Player', last: 'Foxtrot', squad: 'jv', year: 9, try_avg: 46.7, season: '2026' },
];

const EVENTS = [
  { type: 'match', name: 'vs Cathedral', location: 'Broadmoor CC', date: '2026-04-01', tee_time: '3:30 PM', season: '2026' },
  { type: 'tournament', name: 'City Championship', location: 'Eagle Creek GC', date: '2026-04-10', tee_time: '8:00 AM', season: '2026' },
  { type: 'practice', name: 'Range Session', location: 'Chatard Practice Facility', date: '2026-04-03', tee_time: '4:00 PM', season: '2026' },
];

const PARENTS = [
  { playerLegacyId: 1, name: 'Parent Alpha', phone: '3175550101' },
  { playerLegacyId: 2, name: 'Parent Bravo', phone: '3175550102' },
];

async function seed() {
  console.log('Seeding players...');
  const { data: players, error: pe } = await supabase
    .from('players')
    .upsert(PLAYERS, { onConflict: 'legacy_id' })
    .select();
  if (pe) { console.error('Players error:', pe.message); return; }
  console.log(`  ${players.length} players upserted`);

  console.log('Seeding events...');
  for (const evt of EVENTS) {
    const { data: existing } = await supabase.from('events').select('id').eq('name', evt.name).eq('date', evt.date).single();
    if (existing) { console.log(`  Skipping "${evt.name}" (exists)`); continue; }
    const { error } = await supabase.from('events').insert(evt);
    if (error) { console.error(`  Event "${evt.name}" error:`, error.message); continue; }
    console.log(`  Created "${evt.name}"`);
  }

  console.log('Seeding parents...');
  for (const p of PARENTS) {
    const player = players.find(pl => pl.legacy_id === p.playerLegacyId);
    if (!player) { console.error(`  Player legacy_id ${p.playerLegacyId} not found`); continue; }
    const { data: existing } = await supabase.from('parents').select('id').eq('phone', p.phone).single();
    if (existing) { console.log(`  Skipping "${p.name}" (exists)`); continue; }
    const { error } = await supabase.from('parents').insert({ player_id: player.id, name: p.name, phone: p.phone });
    if (error) { console.error(`  Parent "${p.name}" error:`, error.message); continue; }
    console.log(`  Created "${p.name}" → ${player.first} ${player.last}`);
  }

  console.log('Done!');
}

seed().catch(console.error);
