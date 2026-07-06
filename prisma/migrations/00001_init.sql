-- CreateEnum
CREATE TYPE "supplier_status" AS ENUM ('active', 'inactive', 'suspended', 'pending_review');

-- CreateEnum
CREATE TYPE "product_status" AS ENUM ('draft', 'active', 'discontinued', 'out_of_stock', 'coming_soon');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('pending', 'payment_received', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled', 'refunded', 'partially_refunded');

-- CreateEnum
CREATE TYPE "shipping_method" AS ENUM ('standard', 'express', 'overnight', 'freight', 'pickup');

-- CreateEnum
CREATE TYPE "currency_code" AS ENUM ('AED', 'AUD', 'USD', 'EUR', 'GBP');

-- CreateEnum
CREATE TYPE "inventory_movement" AS ENUM ('received', 'sold', 'returned', 'adjusted', 'transferred', 'damaged');

-- CreateEnum
CREATE TYPE "review_status" AS ENUM ('pending', 'approved', 'rejected', 'flagged');

-- CreateEnum
CREATE TYPE "admin_role" AS ENUM ('super_admin', 'admin', 'manager', 'support', 'analyst');

-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "company_name" VARCHAR(255),
    "contact_name" VARCHAR(255),
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(50),
    "website" VARCHAR(500),
    "api_url" VARCHAR(500),
    "api_key_encrypted" TEXT,
    "api_docs_url" VARCHAR(500),
    "country" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100),
    "address" TEXT,
    "shipping_methods" "shipping_method"[],
    "currencies" "currency_code"[],
    "moq" INTEGER NOT NULL DEFAULT 1,
    "lead_time_min" INTEGER,
    "lead_time_max" INTEGER,
    "returns_policy" TEXT,
    "msds_available" BOOLEAN NOT NULL DEFAULT false,
    "msds_url" VARCHAR(500),
    "certification" TEXT[],
    "notes" TEXT,
    "status" "supplier_status" NOT NULL DEFAULT 'active',
    "rating" DECIMAL(2,1) DEFAULT 0.0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "supplier_sku" VARCHAR(100),
    "barcode" VARCHAR(100),
    "title" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "category" VARCHAR(255),
    "subcategory" VARCHAR(255),
    "tags" TEXT[],
    "price_aed" DECIMAL(12,2) NOT NULL,
    "price_aud" DECIMAL(12,2) NOT NULL,
    "compare_price_aed" DECIMAL(12,2),
    "compare_price_aud" DECIMAL(12,2),
    "cost_price_aed" DECIMAL(12,2),
    "cost_price_aud" DECIMAL(12,2),
    "margin_percent" DECIMAL(5,2),
    "supplier_price" DECIMAL(12,2),
    "supplier_currency" "currency_code" NOT NULL DEFAULT 'AED',
    "moq" INTEGER NOT NULL DEFAULT 1,
    "lead_time" VARCHAR(100),
    "images" JSONB NOT NULL DEFAULT '[]',
    "videos" JSONB NOT NULL DEFAULT '[]',
    "models_3d" JSONB NOT NULL DEFAULT '[]',
    "weight_kg" DECIMAL(8,2),
    "dimensions_cm" JSONB NOT NULL DEFAULT '{}',
    "country_of_origin" VARCHAR(100),
    "hs_code" VARCHAR(20),
    "seo_title" VARCHAR(70),
    "seo_description" VARCHAR(160),
    "seo_keywords" TEXT[],
    "seo_canonical_url" VARCHAR(500),
    "status" "product_status" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "track_quantity" BOOLEAN NOT NULL DEFAULT true,
    "allow_backorder" BOOLEAN NOT NULL DEFAULT false,
    "is_digital" BOOLEAN NOT NULL DEFAULT false,
    "msds_required" BOOLEAN NOT NULL DEFAULT false,
    "msds_url" VARCHAR(500),
    "safety_labels" TEXT[],
    "age_rating" VARCHAR(20),
    "warnings" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "barcode" VARCHAR(100),
    "title" VARCHAR(500) NOT NULL,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "options_text" VARCHAR(255),
    "price_aed" DECIMAL(12,2) NOT NULL,
    "price_aud" DECIMAL(12,2) NOT NULL,
    "compare_price_aed" DECIMAL(12,2),
    "compare_price_aud" DECIMAL(12,2),
    "cost_price_aed" DECIMAL(12,2),
    "cost_price_aud" DECIMAL(12,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
    "track_quantity" BOOLEAN NOT NULL DEFAULT true,
    "allow_backorder" BOOLEAN NOT NULL DEFAULT false,
    "images" JSONB NOT NULL DEFAULT '[]',
    "models_3d" JSONB NOT NULL DEFAULT '[]',
    "weight_kg" DECIMAL(8,2),
    "dimensions_cm" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" UUID NOT NULL,
    "product_id" UUID,
    "variant_id" UUID,
    "supplier_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
    "reorder_point" INTEGER NOT NULL DEFAULT 10,
    "reorder_quantity" INTEGER NOT NULL DEFAULT 50,
    "warehouse" VARCHAR(100) NOT NULL DEFAULT 'default',
    "location_code" VARCHAR(50),
    "region" VARCHAR(50),
    "batch_number" VARCHAR(100),
    "expiry_date" DATE,
    "received_date" DATE DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" UUID NOT NULL,
    "inventory_id" UUID NOT NULL,
    "movement_type" "inventory_movement" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reference_type" VARCHAR(50),
    "reference_id" VARCHAR(100),
    "note" TEXT,
    "performed_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "auth_user_id" UUID,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "company" VARCHAR(255),
    "default_address" JSONB NOT NULL DEFAULT '{}',
    "addresses" JSONB NOT NULL DEFAULT '[]',
    "preferred_locale" VARCHAR(10) NOT NULL DEFAULT 'en-AE',
    "preferred_currency" "currency_code" NOT NULL DEFAULT 'AED',
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_spent_aed" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_spent_aud" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "last_order_at" TIMESTAMPTZ,
    "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "notes" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "auth_user_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "role" "admin_role" NOT NULL DEFAULT 'admin',
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMPTZ,
    "last_ip" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "order_number" VARCHAR(30) NOT NULL,
    "customer_id" UUID,
    "customer_email" VARCHAR(255) NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'pending',
    "currency" "currency_code" NOT NULL DEFAULT 'AED',
    "locale" VARCHAR(10) NOT NULL DEFAULT 'en-AE',
    "subtotal" DECIMAL(14,2) NOT NULL,
    "shipping_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax_rate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "coupon_code" VARCHAR(50),
    "total" DECIMAL(14,2) NOT NULL,
    "amount_paid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "payment_method" VARCHAR(50),
    "payment_intent_id" VARCHAR(255),
    "payment_status" VARCHAR(50),
    "paid_at" TIMESTAMPTZ,
    "shipping_method" "shipping_method" NOT NULL DEFAULT 'standard',
    "shipping_carrier" VARCHAR(100),
    "tracking_number" VARCHAR(255),
    "tracking_url" VARCHAR(500),
    "shipping_address" JSONB NOT NULL,
    "billing_address" JSONB NOT NULL,
    "shipping_zone" VARCHAR(100),
    "estimated_delivery" DATE,
    "delivered_at" TIMESTAMPTZ,
    "customer_notes" TEXT,
    "internal_notes" TEXT,
    "cancellation_reason" TEXT,
    "refund_amount" DECIMAL(14,2) DEFAULT 0,
    "refunded_at" TIMESTAMPTZ,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_id" UUID,
    "variant_id" UUID,
    "supplier_id" UUID,
    "sku" VARCHAR(100),
    "title" VARCHAR(500) NOT NULL,
    "variant_title" VARCHAR(500),
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "image_url" VARCHAR(500),
    "unit_price" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "line_total" DECIMAL(14,2) NOT NULL,
    "supplier_price" DECIMAL(12,2),
    "supplier_currency" "currency_code",
    "status" "order_status" NOT NULL DEFAULT 'pending',
    "tracking_number" VARCHAR(255),
    "tracking_url" VARCHAR(500),
    "carrier" VARCHAR(100),
    "shipped_at" TIMESTAMPTZ,
    "delivered_at" TIMESTAMPTZ,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_logs" (
    "id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "request_url" VARCHAR(500),
    "request_method" VARCHAR(10),
    "request_body" TEXT,
    "response_status" INTEGER,
    "response_body" TEXT,
    "response_time_ms" INTEGER,
    "error_message" TEXT,
    "error_stack" TEXT,
    "performed_by" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_logs" (
    "id" UUID NOT NULL,
    "provider" VARCHAR(100) NOT NULL,
    "event_type" VARCHAR(255) NOT NULL,
    "event_id" VARCHAR(255),
    "webhook_url" VARCHAR(500),
    "headers" JSONB NOT NULL DEFAULT '{}',
    "body" JSONB NOT NULL DEFAULT '{}',
    "raw_body" TEXT,
    "signature" VARCHAR(500),
    "signature_valid" BOOLEAN,
    "processing_status" VARCHAR(50) NOT NULL DEFAULT 'received',
    "response_status" INTEGER,
    "response_body" TEXT,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "processed_at" TIMESTAMPTZ,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "customer_id" UUID,
    "customer_name" VARCHAR(255),
    "customer_email" VARCHAR(255),
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "body" TEXT,
    "pros" TEXT[],
    "cons" TEXT[],
    "images" JSONB NOT NULL DEFAULT '[]',
    "videos" JSONB NOT NULL DEFAULT '[]',
    "verified_purchase" BOOLEAN NOT NULL DEFAULT false,
    "order_id" UUID,
    "status" "review_status" NOT NULL DEFAULT 'pending',
    "moderated_by" UUID,
    "moderated_at" TIMESTAMPTZ,
    "rejection_reason" TEXT,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "reported_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_pages" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(500) NOT NULL,
    "locale" VARCHAR(10) NOT NULL DEFAULT 'en-AE',
    "title" VARCHAR(70) NOT NULL,
    "description" VARCHAR(160),
    "keywords" TEXT[],
    "og_title" VARCHAR(70),
    "og_description" VARCHAR(160),
    "og_image" VARCHAR(500),
    "twitter_card" VARCHAR(50) NOT NULL DEFAULT 'summary_large_image',
    "canonical_url" VARCHAR(500),
    "structured_data" JSONB NOT NULL DEFAULT '{}',
    "h1_heading" VARCHAR(255),
    "content_sections" JSONB NOT NULL DEFAULT '[]',
    "is_indexable" BOOLEAN NOT NULL DEFAULT true,
    "priority" DECIMAL(2,1) NOT NULL DEFAULT 0.5,
    "change_frequency" VARCHAR(20) NOT NULL DEFAULT 'monthly',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");

-- CreateIndex
CREATE INDEX "suppliers_status_idx" ON "suppliers"("status");

-- CreateIndex
CREATE INDEX "suppliers_country_idx" ON "suppliers"("country");

-- CreateIndex
CREATE INDEX "suppliers_code_idx" ON "suppliers"("code");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_featured_idx" ON "products"("featured");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_tags_idx" ON "products" USING GIN ("tags");

-- CreateIndex
CREATE UNIQUE INDEX "products_supplier_id_sku_key" ON "products"("supplier_id", "sku");

-- CreateIndex
CREATE INDEX "product_variants_sku_idx" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_is_active_idx" ON "product_variants"("is_active");

-- CreateIndex
CREATE INDEX "product_variants_attributes_idx" ON "product_variants" USING GIN ("attributes");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_product_id_sku_key" ON "product_variants"("product_id", "sku");

-- CreateIndex
CREATE INDEX "inventory_product_id_idx" ON "inventory"("product_id");

-- CreateIndex
CREATE INDEX "inventory_variant_id_idx" ON "inventory"("variant_id");

-- CreateIndex
CREATE INDEX "inventory_supplier_id_idx" ON "inventory"("supplier_id");

-- CreateIndex
CREATE INDEX "inventory_region_idx" ON "inventory"("region");

-- CreateIndex
CREATE INDEX "inventory_movements_inventory_id_idx" ON "inventory_movements"("inventory_id");

-- CreateIndex
CREATE INDEX "inventory_movements_movement_type_idx" ON "inventory_movements"("movement_type");

-- CreateIndex
CREATE UNIQUE INDEX "customers_auth_user_id_key" ON "customers"("auth_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_auth_user_id_idx" ON "customers"("auth_user_id");

-- CreateIndex
CREATE INDEX "customers_preferred_locale_idx" ON "customers"("preferred_locale");

-- CreateIndex
CREATE INDEX "customers_tags_idx" ON "customers" USING GIN ("tags");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_auth_user_id_key" ON "admin_users"("auth_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_email_idx" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_role_idx" ON "admin_users"("role");

-- CreateIndex
CREATE INDEX "admin_users_is_active_idx" ON "admin_users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");

-- CreateIndex
CREATE INDEX "orders_customer_email_idx" ON "orders"("customer_email");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_order_number_idx" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_payment_intent_id_idx" ON "orders"("payment_intent_id");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "orders_currency_idx" ON "orders"("currency");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "order_items_supplier_id_idx" ON "order_items"("supplier_id");

-- CreateIndex
CREATE INDEX "order_items_status_idx" ON "order_items"("status");

-- CreateIndex
CREATE INDEX "supplier_logs_supplier_id_idx" ON "supplier_logs"("supplier_id");

-- CreateIndex
CREATE INDEX "supplier_logs_event_type_idx" ON "supplier_logs"("event_type");

-- CreateIndex
CREATE INDEX "supplier_logs_status_idx" ON "supplier_logs"("status");

-- CreateIndex
CREATE INDEX "supplier_logs_created_at_idx" ON "supplier_logs"("created_at");

-- CreateIndex
CREATE INDEX "webhook_logs_provider_idx" ON "webhook_logs"("provider");

-- CreateIndex
CREATE INDEX "webhook_logs_event_type_idx" ON "webhook_logs"("event_type");

-- CreateIndex
CREATE INDEX "webhook_logs_processing_status_idx" ON "webhook_logs"("processing_status");

-- CreateIndex
CREATE INDEX "webhook_logs_created_at_idx" ON "webhook_logs"("created_at");

-- CreateIndex
CREATE INDEX "reviews_product_id_idx" ON "reviews"("product_id");

-- CreateIndex
CREATE INDEX "reviews_customer_id_idx" ON "reviews"("customer_id");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE INDEX "reviews_created_at_idx" ON "reviews"("created_at");

-- CreateIndex
CREATE INDEX "reviews_verified_purchase_idx" ON "reviews"("verified_purchase");

-- CreateIndex
CREATE INDEX "seo_pages_slug_idx" ON "seo_pages"("slug");

-- CreateIndex
CREATE INDEX "seo_pages_locale_idx" ON "seo_pages"("locale");

-- CreateIndex
CREATE INDEX "seo_pages_is_indexable_idx" ON "seo_pages"("is_indexable");

-- CreateIndex
CREATE UNIQUE INDEX "seo_pages_slug_locale_key" ON "seo_pages"("slug", "locale");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_logs" ADD CONSTRAINT "supplier_logs_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_logs" ADD CONSTRAINT "supplier_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_moderated_by_fkey" FOREIGN KEY ("moderated_by") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

