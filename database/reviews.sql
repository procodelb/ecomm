-- REVIEWS + SEO PAGES — domain DDL reference
-- Source: supabase/migrations/00001_initial_schema.sql
-- Prisma models: Review, SeoPage (prisma/schema.prisma)

CREATE TYPE review_status AS ENUM (
  'pending', 'approved', 'rejected', 'flagged'
);

CREATE TABLE reviews (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id        UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  customer_id       UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name     VARCHAR(255),
  customer_email    VARCHAR(255),
  rating            INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title             VARCHAR(255),
  body              TEXT,
  pros              TEXT[] DEFAULT '{}',
  cons              TEXT[] DEFAULT '{}',
  images            JSONB DEFAULT '[]',
  videos            JSONB DEFAULT '[]',
  verified_purchase BOOLEAN DEFAULT FALSE,
  order_id          UUID REFERENCES orders(id) ON DELETE SET NULL,
  status            review_status DEFAULT 'pending',
  moderated_by      UUID REFERENCES admin_users(id),
  moderated_at      TIMESTAMPTZ,
  rejection_reason  TEXT,
  helpful_count     INTEGER DEFAULT 0,
  reported_count    INTEGER DEFAULT 0,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews (product_id);
CREATE INDEX idx_reviews_customer ON reviews (customer_id);
CREATE INDEX idx_reviews_rating ON reviews (rating);
CREATE INDEX idx_reviews_status ON reviews (status);
CREATE INDEX idx_reviews_created ON reviews (created_at DESC);
CREATE INDEX idx_reviews_verified ON reviews (verified_purchase) WHERE verified_purchase = TRUE;

-- ── SEO PAGES ───────────────────────────────────────────────────────────

CREATE TABLE seo_pages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              VARCHAR(500) NOT NULL,
  locale            VARCHAR(10) NOT NULL DEFAULT 'en-AE',
  title             VARCHAR(70) NOT NULL,
  description       VARCHAR(160),
  keywords          TEXT[] DEFAULT '{}',
  og_title          VARCHAR(70),
  og_description    VARCHAR(160),
  og_image          VARCHAR(500),
  twitter_card      VARCHAR(50) DEFAULT 'summary_large_image',
  canonical_url     VARCHAR(500),
  structured_data   JSONB DEFAULT '{}',
  h1_heading        VARCHAR(255),
  content_sections  JSONB DEFAULT '[]',
  is_indexable      BOOLEAN DEFAULT TRUE,
  priority          DECIMAL(2,1) DEFAULT 0.5,
  change_frequency  VARCHAR(20) DEFAULT 'monthly',
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (slug, locale)
);

CREATE INDEX idx_seo_pages_slug ON seo_pages (slug);
CREATE INDEX idx_seo_pages_locale ON seo_pages (locale);
CREATE INDEX idx_seo_pages_indexable ON seo_pages (is_indexable) WHERE is_indexable = TRUE;
