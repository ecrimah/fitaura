/**
 * scripts/run-migration.mjs
 *
 * Apply every SQL file in supabase/migrations/ to the FITAURA Supabase
 * project (in filename ASCII order). Idempotent — every migration uses
 * IF NOT EXISTS / ON CONFLICT, so re-running is safe.
 *
 * Run: node scripts/run-migration.mjs
 *      node scripts/run-migration.mjs <single-migration-filename.sql>
 *
 * Credentials (in priority order):
 *   1. DATABASE_URL              (preferred — single pooler URL from Supabase)
 *   2. SUPABASE_DB_PASSWORD      (+ NEXT_PUBLIC_SUPABASE_URL → pooled connection)
 *   3. SUPABASE_SERVICE_ROLE_KEY (only works if `exec_sql` RPC exists on the
 *      project; most fresh projects don't have it)
 *
 * Where to find the DB password / DATABASE_URL:
 *   Supabase dashboard → Project settings → Database → Connection string
 *   (use the "URI" tab, transaction-mode pooler is recommended).
 */
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIG_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const altPath = path.join(__dirname, '..', '.env');
  const p = fs.existsSync(envPath) ? envPath : fs.existsSync(altPath) ? altPath : null;
  if (!p) return {};
  return Object.fromEntries(
    fs.readFileSync(p, 'utf8').split(/\r?\n/)
      .filter((l) => /^[A-Z_]+=/.test(l.trim()))
      .map((l) => {
        const eq = l.indexOf('=');
        return [l.slice(0, eq).trim(), l.slice(eq + 1).trim()];
      }),
  );
}

const env = { ...process.env, ...loadEnv() };
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF =
  env.SUPABASE_PROJECT_REF || SUPABASE_URL?.match(/([a-zA-Z0-9]{20,})\.supabase\.co/)?.[1];

let connectionString = env.DATABASE_URL;
let directConnection = null;
if (!connectionString && env.SUPABASE_DB_PASSWORD && PROJECT_REF) {
  const pw = encodeURIComponent(env.SUPABASE_DB_PASSWORD);
  connectionString = `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
  directConnection = `postgresql://postgres:${pw}@db.${PROJECT_REF}.supabase.co:5432/postgres`;
}

const argFile = process.argv[2];
const migrationFiles = argFile
  ? [argFile]
  : fs.readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql')).sort();

if (migrationFiles.length === 0) {
  console.error('No migrations found in', MIG_DIR);
  process.exit(1);
}

async function tryConnect(connStr, label) {
  console.log(`\n→ ${label}...`);
  const client = new pg.Client({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  try {
    await client.connect();
    console.log(`  Connected via ${label}.`);
    return client;
  } catch (err) {
    console.log(`  Failed: ${err.message}`);
    return null;
  }
}

async function applyAllViaRpc() {
  if (!SUPABASE_URL || !SERVICE_KEY) return false;
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(MIG_DIR, file), 'utf8');
    console.log(`  Applying ${file}...`);
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) throw error;
  }
  return true;
}

async function applyAllViaPg(client) {
  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(MIG_DIR, file), 'utf8');
    console.log(`  Applying ${file}...`);
    await client.query(sql);
  }
}

async function main() {
  console.log('=== FITAURA · Supabase Migration ===');
  console.log(`Project: ${PROJECT_REF || '(unknown)'}`);
  console.log(`Migrations to apply (${migrationFiles.length}):`);
  migrationFiles.forEach((f) => console.log('  -', f));

  // 1. Try the exec_sql RPC first (no DB password needed) — uncommon, but free if it exists.
  if (SUPABASE_URL && SERVICE_KEY && !connectionString) {
    console.log('\n→ Trying exec_sql RPC (no DB password needed)...');
    try {
      await applyAllViaRpc();
      console.log('\n✓ All migrations applied via exec_sql RPC.');
      return;
    } catch (err) {
      const msg = String(err?.message ?? err);
      if (msg.includes('exec_sql') || msg.includes('does not exist') || msg.includes('schema cache')) {
        console.log('  exec_sql RPC not available on this project — falling back to direct Postgres.');
      } else {
        console.error('  RPC apply failed:', msg);
        process.exit(1);
      }
    }
  }

  // 2. Try a direct Postgres connection.
  let client = connectionString ? await tryConnect(connectionString, 'Pooler / DATABASE_URL') : null;
  if (!client && directConnection) {
    client = await tryConnect(directConnection, 'Direct connection (port 5432)');
  }

  if (!client) {
    console.error('\n✗ Could not connect to the database.\n');
    console.error('Add ONE of these to .env.local and re-run:');
    console.error('  DATABASE_URL=postgresql://postgres.[ref]:[pw]@aws-0-us-east-1.pooler.supabase.com:6543/postgres');
    console.error('  SUPABASE_DB_PASSWORD=<your-db-password>\n');
    console.error('Find both in: Supabase dashboard → Project settings → Database → Connection string\n');
    console.error('Alternative — paste this single file into the SQL editor:');
    console.error('  supabase/seed-fitaura.sql   (regenerate with: npm run db:build-seed)');
    console.error(`  https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
    process.exit(1);
  }

  try {
    await applyAllViaPg(client);
    console.log('\n✓ All migrations applied successfully.');
  } catch (err) {
    console.error('\n✗ Migration failed:', err.message);
    if (err.message?.includes('already exists')) {
      console.error('  → Looks like part of the schema was already applied. The migrations are idempotent, but the conflicting bit may need a manual review.');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
