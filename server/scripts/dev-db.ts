import 'dotenv/config'
import { existsSync } from 'node:fs'
import path from 'node:path'
import EmbeddedPostgres from 'embedded-postgres'

/**
 * Local-development-only PostgreSQL, for environments without Docker or a
 * system Postgres install (this sandbox included). NOT used by the deployed
 * app — `server.ts` only ever talks to whatever `DATABASE_URL` points at.
 * Data persists across runs in `.pgdata/` (gitignored) so migrations/seed data
 * survive a restart of this script.
 *
 * Defaults match `.env.example`'s DATABASE_URL exactly
 * (postgres:postgres@localhost:5432/av1_company) — override via env vars below
 * if you've changed that.
 */
const DB_NAME = process.env.DEV_DB_NAME ?? 'av1_company'
const DB_USER = process.env.DEV_DB_USER ?? 'postgres'
const DB_PASSWORD = process.env.DEV_DB_PASSWORD ?? 'postgres'
const DB_PORT = Number(process.env.DEV_DB_PORT ?? 5432)
const DATA_DIR = path.join(__dirname, '../.pgdata')

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: DB_USER,
  password: DB_PASSWORD,
  port: DB_PORT,
  persistent: true,
})

async function main(): Promise<void> {
  const alreadyInitialised = existsSync(path.join(DATA_DIR, 'PG_VERSION'))

  if (!alreadyInitialised) {
    console.log('[dev-db] Initialising a new local Postgres cluster...')
    await pg.initialise()
  }

  console.log(`[dev-db] Starting Postgres on 127.0.0.1:${DB_PORT}...`)
  await pg.start()

  const client = pg.getPgClient()
  await client.connect()
  const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME])
  if (result.rowCount === 0) {
    await pg.createDatabase(DB_NAME)
    console.log(`[dev-db] Created database "${DB_NAME}"`)
  } else {
    console.log(`[dev-db] Database "${DB_NAME}" already exists`)
  }
  await client.end()

  console.log('[dev-db] Ready.')
  console.log(`[dev-db] DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}?schema=public"`)
  console.log('[dev-db] Leave this running, then in another terminal: npm run prisma:migrate / npm run seed / npm run dev')
  console.log('[dev-db] Press Ctrl+C to stop.')
}

async function shutdown(): Promise<void> {
  console.log('\n[dev-db] Stopping Postgres...')
  await pg.stop()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

main().catch((error: unknown) => {
  console.error('[dev-db] Failed to start:', error)
  process.exit(1)
})
