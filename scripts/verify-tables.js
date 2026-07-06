require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();

  const tables = ['suppliers', 'products', 'inventory', 'orders', 'customers', 'admin_users', 'product_variants', 'order_items', 'reviews', 'shipping_addresses', 'webhook_logs'];
  
  for (const table of tables) {
    try {
      const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "${table}"`);
      console.log(`✓ ${table}: ${result[0].count} rows`);
    } catch (err) {
      console.log(`✗ ${table}: NOT FOUND (${err.message})`);
    }
  }

  // List all tables in public schema
  const allTables = await prisma.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  );
  console.log('\nAll tables:', allTables.map(t => t.table_name).join(', '));

  // List all enums
  const enums = await prisma.$queryRawUnsafe(
    `SELECT t.typname FROM pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e' ORDER BY t.typname`
  );
  console.log('Enums:', enums.map(e => e.typname).join(', '));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
