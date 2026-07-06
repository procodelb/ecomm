require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...\n');

  // Clean existing data (order matters for FK constraints)
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplierLog.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.webhookLog.deleteMany();
  console.log('  Cleaned existing data.\n');

  // ── Supplier ──
  const supplier = await prisma.supplier.create({
    data: {
      id: randomUUID(),
      code: 'CJ_DROPSHIPPING',
      name: 'CJ Dropshipping',
      companyName: 'CJ Dropshipping Ltd.',
      country: 'China',
      city: 'Shenzhen',
      shippingMethods: ['standard', 'express'],
      currencies: ['USD', 'AED', 'AUD'],
      moq: 1,
      leadTimeMin: 7,
      leadTimeMax: 15,
      status: 'active',
      rating: 4.5,
      metadata: {},
    },
  });
  console.log(`✓ Supplier: ${supplier.name}`);

  // ── Products ──
  const productDefs = [
    {
      title: 'Luxury Carbon Fiber Jet Board',
      slug: 'luxury-carbon-fiber-jet-board',
      description: 'Premium carbon fiber jet board with 45 mph top speed, 60 min runtime, and smartphone app integration.',
      shortDescription: '45 mph | 60 min runtime | Smart app',
      category: 'Jet Boards',
      subcategory: 'Electric',
      tags: ['carbon-fiber', 'electric', 'premium', 'jet-board'],
      images: ['https://picsum.photos/seed/jetboard1/800/800', 'https://picsum.photos/seed/jetboard2/800/800'],
      priceAed: 28500.00,
      priceAud: 11500.00,
      comparePriceAed: 32999.00,
      comparePriceAud: 13500.00,
      costPriceAed: 18000.00,
      costPriceAud: 7200.00,
      marginPercent: 36.84,
      sku: 'CJF-JB-001',
      status: 'active',
      weightKg: 28.5,
      dimensionsCm: { length: 180, width: 60, height: 15 },
      countryOfOrigin: 'China',
      hsCode: '9506.29',
      featured: true,
      taxable: true,
      trackQuantity: true,
      allowBackorder: false,
      variants: [
        { sku: 'CJF-JB-001-BLK', title: 'Stealth Black', attributes: { color: 'Black' }, priceAed: 28500, priceAud: 11500, stock: 5 },
        { sku: 'CJF-JB-001-WHT', title: 'Pearl White', attributes: { color: 'White' }, priceAed: 29500, priceAud: 11900, stock: 3 },
        { sku: 'CJF-JB-001-RED', title: 'Racing Red', attributes: { color: 'Red' }, priceAed: 29900, priceAud: 12100, stock: 2 },
      ],
    },
    {
      title: 'Hydrofoil E-Surfboard Elite',
      slug: 'hydrofoil-e-surfboard-elite',
      description: 'Silent electric hydrofoil surfboard with whisper-quiet motor, 30 mph cruise, and carbon-Kevlar hybrid construction.',
      shortDescription: '30 mph | Whisper-quiet | 45 min',
      category: 'E-Surfboards',
      subcategory: 'Hydrofoil',
      tags: ['hydrofoil', 'electric', 'elite', 'e-surfboard'],
      images: ['https://picsum.photos/seed/esurf1/800/800', 'https://picsum.photos/seed/esurf2/800/800'],
      priceAed: 42000.00,
      priceAud: 17000.00,
      costPriceAed: 28000.00,
      costPriceAud: 11200.00,
      marginPercent: 33.33,
      sku: 'CJF-HF-002',
      status: 'active',
      weightKg: 22.0,
      dimensionsCm: { length: 200, width: 70, height: 20 },
      countryOfOrigin: 'China',
      hsCode: '9506.29',
      featured: true,
      taxable: true,
      trackQuantity: true,
      allowBackorder: false,
      variants: [
        { sku: 'CJF-HF-002-BLU', title: 'Ocean Blue', attributes: { color: 'Blue' }, priceAed: 42000, priceAud: 17000, stock: 2 },
        { sku: 'CJF-HF-002-GRY', title: 'Titanium Grey', attributes: { color: 'Grey' }, priceAed: 43500, priceAud: 17600, stock: 4 },
      ],
    },
    {
      title: 'Premium Inflatable Jet Ski',
      slug: 'premium-inflatable-jet-ski',
      description: 'Portable inflatable jet ski with 25 HP motor, fits in a car trunk, sets up in 15 minutes.',
      shortDescription: '25 HP | Portable | 15 min setup',
      category: 'Jet Skis',
      subcategory: 'Inflatable',
      tags: ['inflatable', 'portable', 'jet-ski', 'premium'],
      images: ['https://picsum.photos/seed/jetski1/800/800', 'https://picsum.photos/seed/jetski2/800/800'],
      priceAed: 18500.00,
      priceAud: 7500.00,
      comparePriceAed: 22000.00,
      comparePriceAud: 8900.00,
      costPriceAed: 11000.00,
      costPriceAud: 4400.00,
      marginPercent: 40.54,
      sku: 'CJF-IJS-003',
      status: 'active',
      weightKg: 45.0,
      dimensionsCm: { length: 120, width: 80, height: 50 },
      countryOfOrigin: 'China',
      hsCode: '9506.29',
      featured: false,
      taxable: true,
      trackQuantity: true,
      allowBackorder: true,
      variants: [
        { sku: 'CJF-IJS-003-YLW', title: 'Solar Yellow', attributes: { color: 'Yellow' }, priceAed: 18500, priceAud: 7500, stock: 8 },
        { sku: 'CJF-IJS-003-ORG', title: 'Tangerine Orange', attributes: { color: 'Orange' }, priceAed: 18500, priceAud: 7500, stock: 6 },
      ],
    },
  ];

  for (const def of productDefs) {
    const { variants, ...productData } = def;

    const product = await prisma.product.create({
      data: {
        id: randomUUID(),
        supplierId: supplier.id,
        supplierCurrency: 'USD',
        moq: 1,
        leadTime: '7-15 days',
        videos: [],
        models3d: [],
        seoTitle: null,
        seoDescription: null,
        seoKeywords: [],
        seoCanonicalUrl: null,
        barcode: null,
        supplierSku: null,
        supplierPrice: null,
        ...productData,
      },
    });
    console.log(`✓ Product: ${product.title}`);

    for (const v of variants) {
      const { stock, ...variantFields } = v;
      const variantId = randomUUID();

      await prisma.productVariant.create({
        data: {
          id: variantId,
          productId: product.id,
          ...variantFields,
          isActive: true,
        },
      });

      await prisma.inventory.create({
        data: {
          id: randomUUID(),
          productId: product.id,
          variantId: variantId,
          supplierId: supplier.id,
          quantity: stock,
          reserved: 0,
          lowStockThreshold: 2,
          warehouse: 'Main Warehouse - Shenzhen',
        },
      });
      console.log(`  Variant: ${v.title} (stock: ${stock})`);
    }
  }

  // ── Admin User ──
  await prisma.adminUser.create({
    data: {
      id: randomUUID(),
      authUserId: randomUUID(),
      email: 'admin@ecomm-store.com',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      isActive: true,
    },
  });
  console.log(`\n✓ Admin: admin@ecomm-store.com`);

  // Summary
  const counts = {
    suppliers: await prisma.supplier.count(),
    products: await prisma.product.count(),
    variants: await prisma.productVariant.count(),
    inventory: await prisma.inventory.count(),
    admin_users: await prisma.adminUser.count(),
  };
  console.log('\n── Seed Summary ──');
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k}: ${v}`);
  }
}

main()
  .catch(e => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
