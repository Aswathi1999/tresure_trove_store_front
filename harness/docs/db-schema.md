# Treasure Trove — Database Schema

> **Read this file when doing any database, migration, or API work.**
> Both Medusa and Payload share the same PostgreSQL instance (`Treasure Trove_db`) with separate table prefixes.

---

## Overview

| Property | Value |
|---|---|
| Database | PostgreSQL 16 |
| Instance | `Treasure Trove_db` |
| Host (local) | `localhost:5432` |
| Host (prod) | RDS / EC2 `localhost:5432` |
| Medusa tables | No prefix — managed by Medusa migrations |
| Payload tables | `payload_` prefix — managed by Payload migrations |
| ORM (Medusa) | MikroORM (managed internally) |
| ORM (Payload) | Drizzle via `@payloadcms/db-postgres` |
| Migrations | Run separately per app — never `synchronize: true` |

---

## Run Migrations

```bash
# Medusa migrations
cd apps/backend
npx medusa db:migrate

# Payload migrations (auto-runs on dev start)
cd apps/cms
npx payload migrate
```

---

## Table Index

### Medusa Tables (Commerce)

| Table | Description |
|---|---|
| `product` | Core product records |
| `product_variant` | SKU-level variants |
| `product_option` | Option definitions (Material, Size, Finish) |
| `product_option_value` | Option values per variant |
| `product_image` | Product image URLs |
| `product_collection` | Collections (Living Room, Dining, etc.) |
| `product_category` | Categories |
| `product_tag` | Tags |
| `product_tag_product` | Product ↔ tag join |
| `money_amount` | Prices per region/currency per variant |
| `inventory_item` | Inventory tracking per variant |
| `inventory_level` | Stock levels per location |
| `stock_location` | Warehouse / store locations |
| `order` | Customer orders |
| `order_item` | Line items in an order |
| `order_shipping_method` | Shipping selection on order |
| `fulfillment` | Fulfillment records |
| `fulfillment_item` | Items in a fulfillment |
| `return` | Return requests |
| `return_item` | Items in a return |
| `refund` | Refund records |
| `payment` | Payment transactions |
| `payment_collection` | Grouped payments |
| `customer` | Registered customers |
| `customer_address` | Saved customer addresses |
| `cart` | Shopping carts |
| `cart_item` | Items in a cart |
| `cart_shipping_method` | Shipping on cart |
| `region` | Geographic regions (India, UAE, SEA) |
| `country` | Countries per region |
| `currency` | Supported currencies (INR, USD, AED) |
| `shipping_option` | Available shipping methods |
| `shipping_profile` | Shipping profile groups |
| `tax_rate` | Tax rules per region |
| `discount` | Discount / promo codes |
| `discount_rule` | Discount logic (percent, fixed, free ship) |
| `gift_card` | Gift card records |
| `sales_channel` | Sales channel definitions |
| `publishable_api_key` | Storefront API keys |
| `api_key_sales_channel` | Key ↔ sales channel join |
| `user` | Admin user accounts |
| `invite` | Admin user invitations |

### Payload Tables (CMS)

| Table | Description |
|---|---|
| `payload_blog_posts` | Blog post documents |
| `payload_blog_posts_rels` | Blog post relationships (media) |
| `payload_material_stories` | Material story documents |
| `payload_material_stories_rels` | Material story relationships |
| `payload_media` | Media file records (S3 + CloudFront) |
| `payload_users` | CMS admin user accounts |
| `payload_homepage_content` | Singleton — homepage CMS content |
| `payload_preferences` | User preferences per admin user |

---

## Medusa — Core Table Schemas

### `product`

```sql
CREATE TABLE product (
  id                  VARCHAR PRIMARY KEY,       -- e.g. prod_01HXYZ
  title               VARCHAR NOT NULL,          -- "Ōkura Lounge Chair"
  handle              VARCHAR UNIQUE NOT NULL,   -- "okura-lounge-chair"
  subtitle            VARCHAR,                   -- short tagline
  description         TEXT,                      -- full product description
  status              VARCHAR NOT NULL           -- draft | published | proposed | rejected
                        DEFAULT 'draft',
  is_giftcard         BOOLEAN DEFAULT FALSE,
  discountable        BOOLEAN DEFAULT TRUE,
  thumbnail           VARCHAR,                   -- CloudFront image URL
  weight              INTEGER,                   -- grams
  length              INTEGER,                   -- cm
  width               INTEGER,                   -- cm
  height              INTEGER,                   -- cm
  hs_code             VARCHAR,                   -- harmonised system code
  origin_country      VARCHAR,                   -- "IN"
  mid_code            VARCHAR,
  material            VARCHAR,                   -- general material label
  collection_id       VARCHAR REFERENCES product_collection(id),
  type_id             VARCHAR REFERENCES product_type(id),
  external_id         VARCHAR,                   -- ERP / external system ID
  metadata            JSONB,                     -- custom key-value store (see below)
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ                -- soft delete
);
```

**Metadata JSONB fields (custom, stored in `product.metadata`):**

| Key | Type | Example |
|---|---|---|
| `wood_type` | string | `"teak"` |
| `finish` | string | `"natural"` |
| `origin` | string | `"Bangalore, India"` |
| `care_instructions` | string | `"Wipe with dry cloth..."` |
| `warranty_years` | number | `10` |
| `dimensions_cm` | string | `"85W × 75H × 80D"` |
| `assembly_required` | boolean | `false` |

---

### `product_variant`

```sql
CREATE TABLE product_variant (
  id                   VARCHAR PRIMARY KEY,      -- e.g. variant_01HXYZ
  product_id           VARCHAR NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  title                VARCHAR NOT NULL,         -- "Teak / Large"
  sku                  VARCHAR UNIQUE,           -- "MAT-OLC-TK-L"
  barcode              VARCHAR,
  ean                  VARCHAR,
  upc                  VARCHAR,
  inventory_quantity   INTEGER DEFAULT 0,
  allow_backorder      BOOLEAN DEFAULT FALSE,
  manage_inventory     BOOLEAN DEFAULT TRUE,
  hs_code              VARCHAR,
  origin_country       VARCHAR,
  mid_code             VARCHAR,
  material             VARCHAR,                  -- variant-level material override
  weight               INTEGER,
  length               INTEGER,
  width                INTEGER,
  height               INTEGER,
  metadata             JSONB,
  variant_rank         INTEGER DEFAULT 0,        -- display order
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  deleted_at           TIMESTAMPTZ
);
```

---

### `product_option`

```sql
CREATE TABLE product_option (
  id          VARCHAR PRIMARY KEY,
  product_id  VARCHAR NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  title       VARCHAR NOT NULL,   -- "Material" | "Size" | "Finish"
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
```

---

### `product_option_value`

```sql
CREATE TABLE product_option_value (
  id          VARCHAR PRIMARY KEY,
  variant_id  VARCHAR NOT NULL REFERENCES product_variant(id) ON DELETE CASCADE,
  option_id   VARCHAR NOT NULL REFERENCES product_option(id),
  value       VARCHAR NOT NULL,   -- "Solid Teak" | "Large" | "Natural"
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
```

---

### `product_image`

```sql
CREATE TABLE product_image (
  id          VARCHAR PRIMARY KEY,
  product_id  VARCHAR NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  url         VARCHAR NOT NULL,   -- CloudFront CDN URL
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
```

---

### `product_collection`

```sql
CREATE TABLE product_collection (
  id          VARCHAR PRIMARY KEY,
  title       VARCHAR NOT NULL,           -- "Living Room"
  handle      VARCHAR UNIQUE NOT NULL,    -- "living-room"
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
```

---

### `money_amount`

```sql
CREATE TABLE money_amount (
  id           VARCHAR PRIMARY KEY,
  currency_code VARCHAR NOT NULL,   -- "inr" | "usd" | "aed"
  amount        INTEGER NOT NULL,   -- in smallest unit (paise, cents, fils)
  region_id     VARCHAR REFERENCES region(id),
  variant_id    VARCHAR REFERENCES product_variant(id) ON DELETE CASCADE,
  price_list_id VARCHAR,            -- for sale prices
  min_quantity  INTEGER,
  max_quantity  INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);
```

**Price examples:**

| Product | Currency | Amount (stored) | Displayed |
|---|---|---|---|
| Ōkura Chair | INR | `12400000` | ₹1,24,000 |
| Ōkura Chair | USD | `149000` | $1,490 |
| Ōkura Chair | AED | `550000` | AED 5,500 |

> Prices stored in smallest unit — INR in paise (×100), USD in cents (×100), AED in fils (×100).

---

### `inventory_item`

```sql
CREATE TABLE inventory_item (
  id                VARCHAR PRIMARY KEY,
  sku               VARCHAR UNIQUE,
  origin_country    VARCHAR,
  hs_code           VARCHAR,
  requires_shipping BOOLEAN DEFAULT TRUE,
  weight            INTEGER,
  length            INTEGER,
  width             INTEGER,
  height            INTEGER,
  metadata          JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);
```

---

### `inventory_level`

```sql
CREATE TABLE inventory_level (
  id                    VARCHAR PRIMARY KEY,
  inventory_item_id     VARCHAR NOT NULL REFERENCES inventory_item(id),
  location_id           VARCHAR NOT NULL REFERENCES stock_location(id),
  stocked_quantity      INTEGER DEFAULT 0,
  reserved_quantity     INTEGER DEFAULT 0,    -- in pending orders
  incoming_quantity     INTEGER DEFAULT 0,    -- incoming stock
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (inventory_item_id, location_id)
);
```

---

### `order`

```sql
CREATE TABLE "order" (
  id                  VARCHAR PRIMARY KEY,   -- e.g. order_01HXYZ
  status              VARCHAR NOT NULL       -- pending | completed | archived | canceled | requires_action
                        DEFAULT 'pending',
  fulfillment_status  VARCHAR NOT NULL       -- not_fulfilled | partially_fulfilled | fulfilled | shipped | delivered | canceled
                        DEFAULT 'not_fulfilled',
  payment_status      VARCHAR NOT NULL       -- not_paid | awaiting | captured | partially_refunded | refunded | canceled
                        DEFAULT 'not_paid',
  display_id          SERIAL,               -- human-readable order number
  customer_id         VARCHAR REFERENCES customer(id),
  email               VARCHAR NOT NULL,
  region_id           VARCHAR NOT NULL REFERENCES region(id),
  currency_code       VARCHAR NOT NULL,
  tax_rate            NUMERIC,
  shipping_address_id VARCHAR REFERENCES customer_address(id),
  billing_address_id  VARCHAR REFERENCES customer_address(id),
  draft_order_id      VARCHAR,
  cart_id             VARCHAR UNIQUE REFERENCES cart(id),
  no_notification     BOOLEAN DEFAULT FALSE,
  metadata            JSONB,
  external_id         VARCHAR,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  canceled_at         TIMESTAMPTZ
);
```

---

### `order_item`

```sql
CREATE TABLE order_item (
  id                  VARCHAR PRIMARY KEY,
  order_id            VARCHAR NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  variant_id          VARCHAR REFERENCES product_variant(id),
  title               VARCHAR NOT NULL,       -- snapshot of product title
  description         VARCHAR,
  thumbnail           VARCHAR,                -- snapshot of thumbnail at order time
  quantity            INTEGER NOT NULL,
  fulfilled_quantity  INTEGER DEFAULT 0,
  returned_quantity   INTEGER DEFAULT 0,
  shipped_quantity    INTEGER DEFAULT 0,
  unit_price          INTEGER NOT NULL,       -- price in smallest unit at order time
  metadata            JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `customer`

```sql
CREATE TABLE customer (
  id             VARCHAR PRIMARY KEY,
  email          VARCHAR UNIQUE NOT NULL,
  first_name     VARCHAR,
  last_name      VARCHAR,
  phone          VARCHAR,
  has_account    BOOLEAN DEFAULT FALSE,
  password_hash  VARCHAR,
  metadata       JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ
);
```

---

### `customer_address`

```sql
CREATE TABLE customer_address (
  id            VARCHAR PRIMARY KEY,
  customer_id   VARCHAR NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
  first_name    VARCHAR,
  last_name     VARCHAR,
  phone         VARCHAR,
  company       VARCHAR,
  address_1     VARCHAR NOT NULL,
  address_2     VARCHAR,
  city          VARCHAR NOT NULL,
  country_code  VARCHAR NOT NULL,   -- "in" | "ae"
  province      VARCHAR,            -- state
  postal_code   VARCHAR NOT NULL,
  is_default_shipping BOOLEAN DEFAULT FALSE,
  is_default_billing  BOOLEAN DEFAULT FALSE,
  metadata      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `cart`

```sql
CREATE TABLE cart (
  id                  VARCHAR PRIMARY KEY,
  email               VARCHAR,
  billing_address_id  VARCHAR REFERENCES customer_address(id),
  shipping_address_id VARCHAR REFERENCES customer_address(id),
  region_id           VARCHAR NOT NULL REFERENCES region(id),
  customer_id         VARCHAR REFERENCES customer(id),
  payment_id          VARCHAR,
  type                VARCHAR DEFAULT 'default',   -- default | swap | draft_order | payment_link | claim
  completed_at        TIMESTAMPTZ,
  payment_authorized_at TIMESTAMPTZ,
  idempotency_key     VARCHAR,
  context             JSONB,
  metadata            JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);
```

---

### `cart_item`

```sql
CREATE TABLE cart_item (
  id               VARCHAR PRIMARY KEY,
  cart_id          VARCHAR NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
  variant_id       VARCHAR REFERENCES product_variant(id),
  title            VARCHAR NOT NULL,
  description      VARCHAR,
  thumbnail        VARCHAR,
  quantity         INTEGER NOT NULL DEFAULT 1,
  unit_price       INTEGER NOT NULL,
  allow_discounts  BOOLEAN DEFAULT TRUE,
  is_giftcard      BOOLEAN DEFAULT FALSE,
  should_merge     BOOLEAN DEFAULT TRUE,
  metadata         JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `region`

```sql
CREATE TABLE region (
  id                   VARCHAR PRIMARY KEY,
  name                 VARCHAR NOT NULL,      -- "India" | "UAE" | "Southeast Asia"
  currency_code        VARCHAR NOT NULL,      -- "inr" | "usd" | "aed"
  tax_rate             NUMERIC DEFAULT 0,
  tax_code             VARCHAR,
  gift_cards_taxable   BOOLEAN DEFAULT TRUE,
  automatic_taxes      BOOLEAN DEFAULT TRUE,
  metadata             JSONB,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  deleted_at           TIMESTAMPTZ
);
```

---

### `discount`

```sql
CREATE TABLE discount (
  id               VARCHAR PRIMARY KEY,
  code             VARCHAR UNIQUE NOT NULL,   -- "Treasure Trove20" | "LAUNCH10"
  is_dynamic       BOOLEAN DEFAULT FALSE,
  rule_id          VARCHAR REFERENCES discount_rule(id),
  is_disabled      BOOLEAN DEFAULT FALSE,
  parent_discount_id VARCHAR,
  starts_at        TIMESTAMPTZ DEFAULT NOW(),
  ends_at          TIMESTAMPTZ,
  valid_duration   VARCHAR,
  usage_limit      INTEGER,                  -- null = unlimited
  usage_count      INTEGER DEFAULT 0,
  metadata         JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);
```

---

### `discount_rule`

```sql
CREATE TABLE discount_rule (
  id          VARCHAR PRIMARY KEY,
  description VARCHAR,
  type        VARCHAR NOT NULL,    -- percentage | fixed | free_shipping
  value       INTEGER NOT NULL,    -- e.g. 20 for 20% or 500000 for ₹5,000 fixed
  allocation  VARCHAR,             -- total | item
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
```

---

## Payload CMS — Table Schemas

### `payload_blog_posts`

```sql
CREATE TABLE payload_blog_posts (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR NOT NULL,
  slug          VARCHAR UNIQUE NOT NULL,
  status        VARCHAR NOT NULL DEFAULT 'draft',   -- draft | published
  published_at  TIMESTAMPTZ,
  excerpt       TEXT,                               -- max 200 chars
  body          JSONB,                              -- Lexical editor state
  author        VARCHAR,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Relationship to media (cover image)
CREATE TABLE payload_blog_posts_rels (
  id               SERIAL PRIMARY KEY,
  order            INTEGER,
  parent_id        INTEGER NOT NULL REFERENCES payload_blog_posts(id) ON DELETE CASCADE,
  path             VARCHAR NOT NULL,   -- "coverImage"
  media_id         INTEGER REFERENCES payload_media(id)
);
```

---

### `payload_material_stories`

```sql
CREATE TABLE payload_material_stories (
  id                    SERIAL PRIMARY KEY,
  title                 VARCHAR NOT NULL,
  slug                  VARCHAR UNIQUE NOT NULL,
  wood_type             VARCHAR NOT NULL,    -- teak | walnut | oak | mango | rosewood
  origin                VARCHAR,             -- "Kerala, India"
  description           JSONB,              -- Lexical editor state
  sustainability_rating INTEGER,             -- 1 to 5
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Relationship to media (featured image)
CREATE TABLE payload_material_stories_rels (
  id               SERIAL PRIMARY KEY,
  order            INTEGER,
  parent_id        INTEGER NOT NULL REFERENCES payload_material_stories(id) ON DELETE CASCADE,
  path             VARCHAR NOT NULL,     -- "featuredImage"
  media_id         INTEGER REFERENCES payload_media(id)
);
```

---

### `payload_media`

```sql
CREATE TABLE payload_media (
  id          SERIAL PRIMARY KEY,
  alt         VARCHAR NOT NULL,         -- required, enforced by schema
  filename    VARCHAR NOT NULL,
  mime_type   VARCHAR,
  filesize    INTEGER,
  width       INTEGER,
  height      INTEGER,
  url         VARCHAR,                  -- CloudFront CDN URL (cdn.Treasure Trove.in/...)
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

> The raw S3 key is derived by stripping the CloudFront base URL from `url`.  
> Example: `cdn.Treasure Trove.in/blog/2026/04/cover.webp` → S3 key: `blog/2026/04/cover.webp`

---

### `payload_homepage_content`

```sql
CREATE TABLE payload_homepage_content (
  id                       SERIAL PRIMARY KEY,
  hero_headline            VARCHAR,
  hero_subtext             TEXT,
  marquee_items            JSONB,   -- array of strings ["Free delivery", "Handcrafted in Bangalore"]
  featured_collection_title  VARCHAR,
  featured_collection_handle VARCHAR,
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `payload_users`

```sql
CREATE TABLE payload_users (
  id             SERIAL PRIMARY KEY,
  email          VARCHAR UNIQUE NOT NULL,
  password       VARCHAR NOT NULL,          -- bcrypt hash
  role           VARCHAR DEFAULT 'editor',  -- admin | editor | viewer
  first_name     VARCHAR,
  last_name      VARCHAR,
  login_attempts INTEGER DEFAULT 0,
  lock_until     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Key Relationships Diagram

```
product
  ├── product_variant (1:N)
  │     ├── product_option_value (1:N)  →  product_option
  │     ├── money_amount (1:N)          →  region / currency
  │     └── inventory_item (1:1)        →  inventory_level (1:N) → stock_location
  ├── product_image (1:N)
  ├── product_collection (N:1)
  ├── product_category (N:M)
  └── product_tag (N:M)

cart
  ├── cart_item (1:N)  →  product_variant
  ├── customer (N:1)
  └── region (N:1)

order
  ├── order_item (1:N)       →  product_variant (snapshot)
  ├── customer (N:1)
  ├── fulfillment (1:N)
  │     └── fulfillment_item (1:N)
  ├── return (1:N)
  │     └── return_item (1:N)
  ├── payment (1:N)
  └── refund (1:N)

customer
  ├── customer_address (1:N)
  ├── cart (1:N)
  └── order (1:N)

payload_blog_posts
  └── payload_blog_posts_rels  →  payload_media (cover image)

payload_material_stories
  └── payload_material_stories_rels  →  payload_media (featured image)
```

---

## Important Notes for Developers

### Prices are always in smallest unit
Never store or display raw amounts without converting. Always divide by 100 for display:
```typescript
// in @Treasure Trove/utils
export function formatPrice(amount: number, currency = 'inr'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

// Usage
formatPrice(12400000, 'inr') // → "₹1,24,000"
formatPrice(149000, 'usd')   // → "$1,490"
```

### Soft deletes
Medusa uses `deleted_at` for soft deletes on most tables. Always filter `WHERE deleted_at IS NULL` in custom queries. Medusa's repository layer handles this automatically — only relevant if writing raw QueryBuilder queries.

### Product metadata
All Treasure Trove-specific product fields (wood type, dimensions, warranty, care instructions) live in `product.metadata` JSONB. Access them in the storefront:
```typescript
const woodType = product.metadata?.wood_type as string | undefined
const warrantyYears = product.metadata?.warranty_years as number | undefined
```

### Shared database — table isolation
Medusa and Payload both connect to `Treasure Trove_db`. They use completely separate tables and run separate migrations. There are no foreign keys between Medusa tables and Payload tables. The only link is conceptual — `product.metadata.wood_type` matches `payload_material_stories.wood_type` by value.

### Never query across apps
The storefront fetches Medusa data via Medusa JS SDK and Payload data via Payload REST API. It does not connect to PostgreSQL directly. Never add a direct DB connection to `apps/storefront`.

### Payload body / description fields
Rich text (`body`, `description`) is stored as Lexical editor JSON (`JSONB`). Render it using `@payloadcms/richtext-lexical`'s React renderer in the storefront — never try to parse or display raw JSON.
```typescript
import { RichText } from '@payloadcms/richtext-lexical/react'
<RichText data={post.body} />
```