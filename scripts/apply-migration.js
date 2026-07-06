require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Connecting...');
  const prisma = new PrismaClient();
  await prisma.$connect();
  console.log('Connected.');

  const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations', '00001_init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 5 && !s.split('\n').every(l => l.trim().startsWith('--')));

  console.log(`Executing ${statements.length} statements...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log(`  [${i + 1}/${statements.length}] OK`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`  [${i + 1}/${statements.length}] SKIP (already exists)`);
      } else {
        console.error(`  [${i + 1}/${statements.length}] ERROR: ${err.message}`);
      }
    }
  }

  // Create _prisma_migrations if needed
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" TEXT PRIMARY KEY,
        "checksum" TEXT NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" TEXT NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL,
        "applied_steps_count" INTEGER NOT NULL
      );
    `);
    console.log('_prisma_migrations table ensured.');
  } catch (err) {
    console.log('Note:', err.message);
  }

  await prisma.$disconnect();
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
