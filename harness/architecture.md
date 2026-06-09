# Treasure Trove Furniture Store — Architecture Document

**Version:** 1.0.0
**Date:** April 2026
**Stack:** pnpm Turborepo Monorepo · Next.js 15 · Medusa v2 · Payload CMS v3 · PostgreSQL · AWS S3

---

## Table of Contents

1. [Monorepo Overview](#1-monorepo-overview)
2. [Repository Structure](#2-repository-structure)
3. [Package Graph](#3-package-graph)
4. [System Architecture](#4-system-architecture)
5. [Service Architecture](#5-service-architecture)
6. [Data Architecture](#6-data-architecture)
7. [Media Architecture — S3 + CloudFront](#7-media-architecture--s3--cloudfront)
8. [Frontend Architecture — Next.js](#8-frontend-architecture--nextjs)
9. [Commerce Architecture — Medusa](#9-commerce-architecture--medusa)
10. [CMS Architecture — Payload](#10-cms-architecture--payload)
11. [Shared Packages](#11-shared-packages)
12. [CI/CD Pipeline](#12-cicd-pipeline)
13. [Deployment Architecture](#13-deployment-architecture)
14. [Environment Configuration](#14-environment-configuration)
15. [Turborepo Pipeline](#15-turborepo-pipeline)

---

## 1. Monorepo Overview

Treasure Trove uses a **pnpm + Turborepo monorepo** — a single Git repository containing all apps and shared packages. Turborepo provides intelligent build caching and parallel task execution across the workspace.

### Why pnpm + Turborepo

| Reason | Detail |
|---|---|
| Single repo | All apps (storefront, backend, CMS) in one place — one PR, one review |
| Shared packages | Types, UI components, and config shared across apps with zero duplication |
| Build caching | Turborepo caches build outputs — unchanged packages are never rebuilt |
| Parallel builds | Turborepo runs tasks in parallel respecting dependency order |
| pnpm workspaces | Fast installs, strict dependency resolution, disk-efficient via hard links |
| Type safety | Shared TypeScript types across all apps — no API contract drift |

### Workspace Tools

| Tool | Version | Role |
|---|---|---|
| pnpm | v9 | Package manager with workspace support |
| Turborepo | v2 | Monorepo build orchestration and caching |
| TypeScript | v5 | Shared types across all apps |
| ESLint | v9 | Shared lint config across all apps |
| Prettier | v3 | Shared formatting config across all apps |

---

## 2. Repository Structure

```
Treasure Trove/                                    ← Git root
│
├── pnpm-workspace.yaml                    ← Workspace definition
├── turbo.json                             ← Turborepo pipeline config
├── package.json                           ← Root package (dev tooling only)
├── tsconfig.base.json                     ← Base TypeScript config
├── .eslintrc.base.js                      ← Base ESLint config
├── .prettierrc                            ← Prettier config (shared)
├── .env.example                           ← Root env example
├── .gitignore
├── README.md
│
├── apps/                                  ← Deployable applications
│   ├── storefront/                        ← Next.js 15 customer storefront
│   │   ├── src/
│   │   │   ├── app/                       ← App Router pages
│   │   │   │   ├── (shop)/                ← Shop route group
│   │   │   │   │   ├── page.tsx           ← Homepage
│   │   │   │   │   ├── products/
│   │   │   │   │   │   ├── page.tsx       ← Products listing
│   │   │   │   │   │   └── [handle]/
│   │   │   │   │   │       └── page.tsx   ← Product detail
│   │   │   │   │   ├── collections/
│   │   │   │   │   │   └── [handle]/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── cart/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── checkout/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── (account)/             ← Account route group
│   │   │   │   │   ├── account/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── login/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── (content)/             ← CMS content route group
│   │   │   │   │   ├── journal/
│   │   │   │   │   │   ├── page.tsx       ← Blog listing
│   │   │   │   │   │   └── [slug]/
│   │   │   │   │   │       └── page.tsx   ← Blog post
│   │   │   │   │   ├── materials/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [slug]/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   └── about/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── api/                   ← API routes
│   │   │   │       ├── og/route.tsx       ← OG image generation
│   │   │   │       └── revalidate/route.ts ← ISR revalidation webhook
│   │   │   ├── components/
│   │   │   │   ├── ui/                    ← from @Treasure Trove/ui
│   │   │   │   ├── layout/
│   │   │   │   ├── product/
│   │   │   │   ├── cart/
│   │   │   │   └── content/
│   │   │   ├── lib/
│   │   │   │   ├── medusa.ts              ← Medusa SDK client
│   │   │   │   ├── payload.ts             ← Payload REST client
│   │   │   │   └── utils.ts
│   │   │   └── styles/
│   │   │       └── globals.css
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json                  ← extends ../../tsconfig.base.json
│   │   └── package.json
│   │
│   ├── backend/                           ← Medusa v2 commerce server
│   │   ├── src/
│   │   │   ├── api/                       ← Custom API routes
│   │   │   │   └── store/
│   │   │   │       └── custom/
│   │   │   ├── modules/                   ← Custom Medusa modules
│   │   │   ├── workflows/                 ← Custom workflows
│   │   │   ├── subscribers/               ← Event subscribers
│   │   │   └── admin/                     ← Admin UI extensions
│   │   ├── medusa-config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── cms/                               ← Payload CMS v3 server
│       ├── src/
│       │   ├── collections/               ← Payload collection schemas
│       │   │   ├── BlogPosts.ts
│       │   │   ├── MaterialStories.ts
│       │   │   ├── Media.ts
│       │   │   └── Users.ts
│       │   ├── globals/                   ← Singleton documents
│       │   │   └── HomepageContent.ts
│       │   ├── blocks/                    ← Reusable rich text blocks
│       │   ├── access/                    ← Role-based access functions
│       │   └── payload.config.ts          ← Main Payload config
│       ├── tsconfig.json
│       └── package.json
│
└── packages/                              ← Shared internal packages
    ├── ui/                                ← Shared React components
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── Button.tsx
    │   │   │   ├── ProductCard.tsx
    │   │   │   ├── ImageGallery.tsx
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   ├── package.json
    │   └── tsconfig.json
    │
    ├── types/                             ← Shared TypeScript types
    │   ├── src/
    │   │   ├── medusa.ts                  ← Medusa entity types
    │   │   ├── payload.ts                 ← Payload collection types
    │   │   ├── media.ts                   ← S3/CloudFront image types
    │   │   └── index.ts
    │   ├── package.json
    │   └── tsconfig.json
    │
    ├── config/                            ← Shared build configs
    │   ├── eslint/
    │   │   └── index.js                   ← Base ESLint config
    │   ├── tailwind/
    │   │   └── index.ts                   ← Base Tailwind config
    │   └── tsconfig/
    │       ├── base.json
    │       ├── nextjs.json
    │       └── node.json
    │
    └── utils/                             ← Shared utility functions
        ├── src/
        │   ├── formatPrice.ts
        │   ├── slugify.ts
        │   ├── cloudfront.ts              ← CloudFront URL builder
        │   └── index.ts
        ├── package.json
        └── tsconfig.json
```

---

## 3. Package Graph

The dependency graph shows how packages and apps relate. Arrows point from consumer to dependency.

```
                    ┌─────────────┐
                    │  @Treasure Trove/   │
                    │   config    │
                    └──────┬──────┘
                           │ (used by all)
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼───────┐
   │  @Treasure Trove/   │  │  @Treasure Trove/   │  │  @Treasure Trove/   │
   │    types    │  │    utils    │  │     ui      │
   └──────┬──────┘  └──────┬──────┘  └─────┬───────┘
          │                │               │
          └────────────────┼───────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼───────┐
   │    apps/    │  │    apps/    │  │    apps/    │
   │  storefront │  │   backend   │  │     cms     │
   │  (Next.js)  │  │  (Medusa)   │  │  (Payload)  │
   └─────────────┘  └─────────────┘  └─────────────┘
```

### Dependency Rules

- `apps/*` can depend on `packages/*`
- `packages/*` cannot depend on `apps/*`
- `packages/ui` depends on `packages/types`
- `packages/utils` depends on `packages/types`
- `apps/storefront` depends on `@Treasure Trove/ui`, `@Treasure Trove/types`, `@Treasure Trove/utils`
- `apps/backend` depends on `@Treasure Trove/types`, `@Treasure Trove/utils`
- `apps/cms` depends on `@Treasure Trove/types`, `@Treasure Trove/utils`

---

## 4. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        INTERNET                                  │
└─────────┬──────────────────────┬───────────────────┬────────────┘
          │                      │                   │
          ▼                      ▼                   ▼
┌─────────────────┐   ┌──────────────────┐  ┌───────────────────┐
│    Cloudflare   │   │    Cloudflare    │  │    Cloudflare     │
│  Treasure Trove.in      │   │  api.Treasure Trove.in   │  │  cms.Treasure Trove.in    │
│  (DNS + TLS)    │   │  (DNS + TLS)     │  │  (DNS + TLS)      │
└────────┬────────┘   └────────┬─────────┘  └────────┬──────────┘
         │                     │                      │
         ▼                     │                      │
┌─────────────────┐            │                      │
│     VERCEL      │            │                      │
│  apps/storefront│            │                      │
│  Next.js 15     │            │                      │
│  Edge Network   │            │                      │
└────────┬────────┘            │                      │
         │                     ▼                      ▼
         │          ┌─────────────────────────────────────────┐
         │          │           AWS EC2 t3.small              │
         │          │           (Ubuntu 24.04)                │
         │          │                                         │
         │          │  ┌───────────────┐ ┌─────────────────┐ │
         │          │  │  Nginx        │ │  PM2 Process    │ │
         │          │  │  Reverse Proxy│ │  Manager        │ │
         │          │  └───────┬───────┘ └────────┬────────┘ │
         │          │          │                  │          │
         │          │   ┌──────▼──────┐  ┌────────▼───────┐  │
         │          │   │  Medusa v2  │  │  Payload CMS   │  │
         │ REST API  │   │  Port 9000  │  │  Port 3001     │  │
         ├──────────────►             │  │                │  │
         │          │   └──────┬──────┘  └────────┬───────┘  │
         │ REST API  │          │                  │          │
         ├──────────────────────────────────────►  │          │
         │          │          └──────────┬───────┘          │
         │          │                     │                   │
         │          │          ┌──────────▼──────────┐        │
         │          │          │   PostgreSQL v16     │        │
         │          │          │   Treasure Trove_db          │        │
         │          │          │   Port 5432          │        │
         │          │          └─────────────────────┘        │
         │          │                                         │
         │          │          ┌─────────────────────┐        │
         │          │          │   Redis v7           │        │
         │          │          │   Port 6379          │        │
         │          │          └─────────────────────┘        │
         │          └─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│              AWS CloudFront CDN              │
│           cdn.Treasure Trove.in                     │
│  (serves images from S3 globally)           │
└───────────────────────┬─────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │    AWS S3       │
              │  Treasure Trove-media   │
              │  ap-south-1     │
              └─────────────────┘
```

---

## 5. Service Architecture

### 5.1 Service Map

| Service | App | Port | Host | Process |
|---|---|---|---|---|
| Next.js storefront | apps/storefront | 443 (prod) / 3000 (dev) | Vercel | Vercel Edge |
| Medusa commerce API | apps/backend | 9000 | EC2 | PM2 |
| Medusa Admin UI | apps/backend | 9000/app | EC2 | PM2 |
| Payload CMS API | apps/cms | 3001 | EC2 | PM2 |
| Payload Admin UI | apps/cms | 3001/admin | EC2 | PM2 |
| PostgreSQL | — | 5432 | EC2 / RDS | systemd |
| Redis | — | 6379 | EC2 / Upstash | systemd |

### 5.2 Nginx Routing (EC2)

```nginx
# /etc/nginx/sites-available/Treasure Trove

# Medusa API
server {
    listen 80;
    server_name api.Treasure Trove.in;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Payload CMS
server {
    listen 80;
    server_name cms.Treasure Trove.in;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.3 PM2 Process Config

```javascript
// ecosystem.config.js (on EC2)
module.exports = {
  apps: [
    {
      name: 'Treasure Trove-backend',
      cwd: '/var/www/Treasure Trove/apps/backend',
      script: 'npm',
      args: 'run start',
      env: { NODE_ENV: 'production', PORT: 9000 },
      max_memory_restart: '512M',
    },
    {
      name: 'Treasure Trove-cms',
      cwd: '/var/www/Treasure Trove/apps/cms',
      script: 'npm',
      args: 'run start',
      env: { NODE_ENV: 'production', PORT: 3001 },
      max_memory_restart: '512M',
    },
  ],
}
```

---

## 6. Data Architecture

### 6.1 Shared PostgreSQL Strategy

Both Medusa and Payload share a single PostgreSQL instance (`Treasure Trove_db`) using separate table prefixes. This eliminates the need for a second database server.

```
Treasure Trove_db
│
├── Medusa tables (managed by Medusa migrations)
│   ├── product
│   ├── product_variant
│   ├── product_collection
│   ├── order
│   ├── order_item
│   ├── customer
│   ├── cart
│   ├── cart_item
│   ├── region
│   ├── shipping_option
│   └── ...
│
└── Payload tables (managed by Payload migrations)
    ├── payload_blog_posts
    ├── payload_blog_posts_rels
    ├── payload_material_stories
    ├── payload_media
    ├── payload_users
    ├── payload_homepage_content
    └── payload_preferences
```

### 6.2 Data Flow — Product Page

```
Browser requests /products/okura-lounge-chair
         │
         ▼
Next.js Server Component (ISR — revalidate: 3600)
         │
         ├──► Medusa SDK → GET /store/products/okura-lounge-chair
         │         Returns: title, variants, price, thumbnail, metadata
         │
         └──► (optional) Payload REST → GET /api/material-stories?where[woodType][equals]=walnut
                   Returns: material description, sustainability rating
         │
         ▼
Page renders with product data + material story
Images served from CloudFront (cdn.Treasure Trove.in)
```

### 6.3 Data Flow — Blog Post

```
Browser requests /journal/why-we-use-teak
         │
         ▼
Next.js Server Component (ISR — revalidate: 1800)
         │
         └──► Payload REST → GET /api/blog-posts?where[slug][equals]=why-we-use-teak
                   Returns: title, body (richtext), coverImage (CloudFront URL), author
         │
         ▼
Page renders with blog post content
Cover image served from CloudFront (cdn.Treasure Trove.in)
```

### 6.4 Cache Strategy

| Page | Render Type | Revalidate | Trigger |
|---|---|---|---|
| Homepage | ISR | 3600s (1hr) | Payload webhook on publish |
| Products listing | ISR | 3600s | Medusa product update event |
| Product detail | ISR | 3600s | Medusa product update event |
| Collection page | ISR | 3600s | Medusa collection update event |
| Blog listing | ISR | 1800s (30min) | Payload webhook on publish |
| Blog post | ISR | 1800s | Payload webhook on publish |
| Materials page | ISR | 86400s (24hr) | Payload webhook on publish |
| Cart / Checkout | CSR | — | Always fresh |
| Account pages | CSR | — | Always fresh |

### 6.5 Payload → Next.js Revalidation Webhook

```typescript
// apps/cms/src/collections/BlogPosts.ts
hooks: {
  afterChange: [
    async ({ doc }) => {
      await fetch(`${process.env.STOREFRONT_URL}/api/revalidate`, {
        method: 'POST',
        headers: { 'x-revalidate-secret': process.env.REVALIDATE_SECRET },
        body: JSON.stringify({ slug: doc.slug, type: 'blog' }),
      })
    }
  ]
}

// apps/storefront/src/app/api/revalidate/route.ts
export async function POST(req: Request) {
  const { slug, type } = await req.json()
  revalidatePath(`/journal/${slug}`)
  revalidatePath('/journal')
  return Response.json({ revalidated: true })
}
```

---

## 7. Media Architecture — S3 + CloudFront

### 7.1 Upload Flow

```
Content editor opens Payload Admin (cms.Treasure Trove.in/admin)
         │
         ▼
Selects image and clicks Upload
         │
         ▼
Payload receives multipart/form-data
         │
         ▼
@payloadcms/plugin-cloud-storage intercepts
         │
         ▼
Image uploaded to S3
  Bucket: Treasure Trove-media
  Region: ap-south-1 (Mumbai)
  Key:    /blog/2026/04/why-we-use-teak-cover.webp
         │
         ▼
S3 returns object URL
Payload stores CloudFront URL in PostgreSQL:
  https://cdn.Treasure Trove.in/blog/2026/04/why-we-use-teak-cover.webp
         │
         ▼
Editor sees image preview in Payload Admin
Next.js reads URL from Payload API and renders via <Image>
```

### 7.2 S3 Bucket Structure

```
Treasure Trove-media/                    ← S3 bucket root
├── products/                    ← Medusa product images
│   ├── okura-lounge-chair/
│   │   ├── hero.webp
│   │   ├── side.webp
│   │   └── detail.webp
│   └── kayu-dining-table/
│       └── ...
├── blog/                        ← Payload blog cover images
│   └── 2026/
│       └── 04/
│           └── cover.webp
├── materials/                   ← Payload material story images
│   ├── teak-grain.webp
│   └── walnut-cross-section.webp
└── misc/                        ← Other uploads
    └── ...
```

### 7.3 CloudFront Configuration

```
Distribution:       Treasure Trove-cloudfront
Domain:             cdn.Treasure Trove.in (CNAME)
Origin:             Treasure Trove-media.s3.ap-south-1.amazonaws.com
Origin Access:      OAC (Origin Access Control) — S3 not public
Price Class:        PriceClass_200 (includes India + Asia + Europe)
Default TTL:        86400s (24 hours)
Max TTL:            31536000s (1 year)
Compress:           Yes (gzip + brotli)
HTTPS:              Redirect HTTP → HTTPS
Alternate domain:   cdn.Treasure Trove.in
SSL certificate:    ACM certificate (ap-south-1)
```

### 7.4 IAM Policy for EC2

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::Treasure Trove-media",
        "arn:aws:s3:::Treasure Trove-media/*"
      ]
    }
  ]
}
```

---

## 8. Frontend Architecture — Next.js

### 8.1 App Router Structure

```
apps/storefront/src/app/
│
├── layout.tsx                   ← Root layout (fonts, providers)
├── globals.css
│
├── (shop)/                      ← Route group — no layout impact
│   ├── layout.tsx               ← Shop layout (navbar, footer)
│   ├── page.tsx                 ← / Homepage
│   ├── products/
│   │   ├── page.tsx             ← /products
│   │   └── [handle]/
│   │       ├── page.tsx         ← /products/[handle]
│   │       └── loading.tsx
│   ├── collections/[handle]/
│   │   └── page.tsx
│   ├── cart/page.tsx
│   └── checkout/page.tsx
│
├── (account)/                   ← Route group — account layout
│   ├── layout.tsx
│   ├── account/page.tsx
│   └── login/page.tsx
│
├── (content)/                   ← Route group — editorial layout
│   ├── layout.tsx
│   ├── journal/
│   │   ├── page.tsx             ← /journal
│   │   └── [slug]/page.tsx      ← /journal/[slug]
│   ├── materials/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   └── about/page.tsx
│
└── api/
    ├── og/route.tsx             ← OG image generation
    └── revalidate/route.ts      ← ISR webhook from Payload
```

### 8.2 Data Fetching Pattern

```typescript
// Server Component — product detail page
// apps/storefront/src/app/(shop)/products/[handle]/page.tsx

import { getMedusaProduct } from '@/lib/medusa'
import { getMaterialStory } from '@/lib/payload'

export const revalidate = 3600

export default async function ProductPage({
  params,
}: {
  params: { handle: string }
}) {
  // Both fetches run in parallel
  const [product, materialStory] = await Promise.all([
    getMedusaProduct(params.handle),
    getMaterialStory(product?.metadata?.wood_type),
  ])

  return <ProductTemplate product={product} material={materialStory} />
}
```

### 8.3 Client Hierarchy

```
apps/storefront/src/lib/
│
├── medusa.ts          ← Medusa JS SDK instance
│   export const medusa = new Medusa({
│     baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
│     publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
│   })
│
└── payload.ts         ← Payload REST client
    export async function getPayloadCollection(
      collection: string,
      params?: Record<string, string>
    ) {
      const query = new URLSearchParams(params).toString()
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/${collection}?${query}`,
        { next: { revalidate: 1800 } }
      )
      return res.json()
    }
```

### 8.4 Component Architecture

```
apps/storefront/src/components/
│
├── layout/
│   ├── Navbar.tsx               ← Top navigation
│   ├── Footer.tsx               ← Site footer
│   └── MarqueeBar.tsx           ← Announcement strip
│
├── product/
│   ├── ProductCard.tsx          ← Grid card (from @Treasure Trove/ui)
│   ├── ProductGallery.tsx       ← Image gallery with zoom
│   ├── VariantSelector.tsx      ← Material/size/finish picker
│   └── RelatedProducts.tsx
│
├── cart/
│   ├── CartDrawer.tsx           ← Slide-in cart
│   ├── CartItem.tsx
│   └── CartSummary.tsx
│
├── content/
│   ├── RichText.tsx             ← Payload Lexical renderer
│   ├── BlogCard.tsx
│   └── MaterialCard.tsx
│
└── ui/                          ← Re-exports from @Treasure Trove/ui
    └── index.ts
```

---

## 9. Commerce Architecture — Medusa

### 9.1 Module Structure

```
apps/backend/src/
│
├── api/
│   └── store/
│       └── custom/              ← Custom storefront endpoints
│           └── route.ts
│
├── modules/
│   └── (custom modules if needed)
│
├── workflows/
│   └── (custom fulfillment workflows)
│
├── subscribers/
│   └── order-placed.ts          ← Trigger email on order
│
└── medusa-config.ts
```

### 9.2 Medusa Config

```typescript
// apps/backend/medusa-config.ts
import { defineConfig } from '@medusajs/medusa'

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
    },
  },
  modules: {
    // Event bus for subscribers
    eventBus: {
      resolve: '@medusajs/event-bus-redis',
      options: { redisUrl: process.env.REDIS_URL },
    },
  },
})
```

### 9.3 Key API Endpoints Used by Storefront

| Method | Endpoint | Used for |
|---|---|---|
| GET | /store/products | Products listing |
| GET | /store/products/:handle | Product detail |
| GET | /store/collections | Collections |
| GET | /store/collections/:handle | Collection detail |
| POST | /store/carts | Create cart |
| POST | /store/carts/:id/line-items | Add to cart |
| DELETE | /store/carts/:id/line-items/:itemId | Remove from cart |
| POST | /store/customers | Register |
| POST | /auth/customer/emailpass | Login |
| GET | /store/customers/me | Get customer |
| GET | /store/customers/me/orders | Order history |

---

## 10. CMS Architecture — Payload

### 10.1 Collection Schemas

```typescript
// apps/cms/src/collections/BlogPosts.ts
import { CollectionConfig } from 'payload'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'publishedAt'] },
  access: {
    read: () => true,                     // Public read
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, admin: { readOnly: true } },
    { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' },
    { name: 'publishedAt', type: 'date' },
    { name: 'coverImage', type: 'upload', relationTo: 'media', required: true },
    { name: 'excerpt', type: 'textarea', maxLength: 200 },
    { name: 'body', type: 'richText', editor: lexicalEditor({}) },
    { name: 'author', type: 'text' },
  ],
  hooks: {
    beforeChange: [generateSlug],          // Auto-generate slug from title
    afterChange: [revalidateStorefront],   // Trigger ISR revalidation
  },
}
```

### 10.2 S3 Plugin Config

```typescript
// apps/cms/src/payload.config.ts
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { cloudStorage } from '@payloadcms/plugin-cloud-storage'
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3'

export default buildConfig({
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
  }),
  plugins: [
    cloudStorage({
      collections: {
        media: {
          adapter: s3Adapter({
            config: {
              region: process.env.AWS_REGION,
              credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              },
            },
            bucket: process.env.S3_BUCKET,
            // Return CloudFront URL instead of S3 URL
            generateFileURL: ({ filename, prefix }) =>
              `${process.env.CLOUDFRONT_URL}/${prefix ?? ''}${filename}`,
          }),
        },
      },
    }),
  ],
  collections: [BlogPosts, MaterialStories, Media, Users],
  globals: [HomepageContent],
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  secret: process.env.PAYLOAD_SECRET,
})
```

---

## 11. Shared Packages

### 11.1 @Treasure Trove/types

Shared TypeScript interfaces consumed by all apps. Auto-generated from Payload config using `payload generate:types`.

```typescript
// packages/types/src/payload.ts
export interface BlogPost {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  publishedAt: string
  coverImage: Media
  excerpt: string
  body: SerializedEditorState
  author: string
}

export interface MaterialStory {
  id: string
  title: string
  slug: string
  woodType: 'teak' | 'walnut' | 'oak' | 'mango' | 'rosewood'
  origin: string
  description: SerializedEditorState
  sustainabilityRating: number
  featuredImage: Media
}

export interface Media {
  id: string
  url: string
  alt: string
  width: number
  height: number
  filename: string
  mimeType: string
}
```

### 11.2 @Treasure Trove/utils

```typescript
// packages/utils/src/cloudfront.ts
export function getCloudfrontUrl(key: string): string {
  return `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${key}`
}

// packages/utils/src/formatPrice.ts
export function formatPrice(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

// packages/utils/src/slugify.ts
export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}
```

### 11.3 @Treasure Trove/ui

```typescript
// packages/ui/src/components/ProductCard.tsx
import type { Product } from '@Treasure Trove/types'
import { formatPrice } from '@Treasure Trove/utils'

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-[3/4] overflow-hidden bg-stone-100">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="mt-4">
        <h3 className="font-serif text-lg">{product.title}</h3>
        <p className="mt-1 text-sm text-stone-500">
          {product.variants[0]?.prices[0]
            ? formatPrice(product.variants[0].prices[0].amount)
            : 'Price on request'}
        </p>
      </div>
    </div>
  )
}
```

---

## 12. CI/CD Pipeline

### 12.1 GitHub Actions Workflow

```
Developer pushes to feature branch
         │
         ▼
┌─────────────────────────────────┐
│   GitHub Actions — PR Check     │
│                                 │
│  pnpm install                   │
│  turbo lint                     │  ← ESLint all packages
│  turbo type-check               │  ← TypeScript all packages
│  turbo test                     │  ← Unit tests (if any)
│  turbo build                    │  ← Build all (cached)
└─────────────────────────────────┘
         │ Pass
         ▼
Developer merges PR to main
         │
         ▼
┌─────────────────────────────────────────────────────┐
│              GitHub Actions — Deploy                │
│                                                     │
│  ┌─────────────────┐     ┌───────────────────────┐  │
│  │  Vercel Deploy  │     │     EC2 Deploy        │  │
│  │  (automatic)    │     │                       │  │
│  │                 │     │  ssh into EC2         │  │
│  │  apps/storefront│     │  git pull origin main │  │
│  │  deployed to    │     │  pnpm install         │  │
│  │  Vercel CDN     │     │  turbo build          │  │
│  └─────────────────┘     │    --filter=backend   │  │
│                          │    --filter=cms       │  │
│                          │  pm2 reload all       │  │
│                          └───────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 12.2 turbo.json Pipeline

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**"]
    },
    "lint": {
      "dependsOn": ["^lint"],
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^type-check"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 12.3 pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 12.4 Root package.json

```json
{
  "name": "Treasure Trove",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "clean": "turbo clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\""
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.0.0",
    "prettier": "^3.0.0"
  },
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=20",
    "pnpm": ">=9"
  }
}
```

---

## 13. Deployment Architecture

### 13.1 Production Services

```
Treasure Trove.in              → Vercel (Next.js storefront)
api.Treasure Trove.in          → EC2 → Nginx → Medusa :9000
cms.Treasure Trove.in          → EC2 → Nginx → Payload :3001
cdn.Treasure Trove.in          → CloudFront → S3 (Treasure Trove-media)
db                     → PostgreSQL on EC2 or RDS
cache                  → Redis on EC2 or Upstash
```

### 13.2 EC2 Directory Layout

```
/var/www/Treasure Trove/               ← app root (git clone here)
├── apps/
│   ├── backend/               ← Medusa built and running
│   └── cms/                   ← Payload built and running
├── packages/
├── node_modules/
├── ecosystem.config.js        ← PM2 config
└── .env.production            ← Production env vars
```

### 13.3 Deployment Commands

```bash
# Initial setup on EC2
git clone https://github.com/your-org/Treasure Trove /var/www/Treasure Trove
cd /var/www/Treasure Trove
pnpm install
turbo build --filter=backend --filter=cms

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Deploy update (run from GitHub Actions)
cd /var/www/Treasure Trove
git pull origin main
pnpm install --frozen-lockfile
turbo build --filter=backend --filter=cms
pm2 reload all
```

### 13.4 Vercel Config

```json
// apps/storefront/vercel.json
{
  "buildCommand": "cd ../.. && turbo build --filter=storefront",
  "outputDirectory": "apps/storefront/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

---

## 14. Environment Configuration

### 14.1 apps/backend/.env

```bash
# Database
DATABASE_URL=postgres://postgres:password@localhost:5432/Treasure Trove_db

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=change-me-in-production
COOKIE_SECRET=change-me-in-production

# CORS
STORE_CORS=https://Treasure Trove.in,http://localhost:3000
ADMIN_CORS=https://api.Treasure Trove.in,http://localhost:9000
AUTH_CORS=https://Treasure Trove.in,https://api.Treasure Trove.in

# Port
PORT=9000
```

### 14.2 apps/cms/.env

```bash
# Database (same instance as Medusa)
DATABASE_URI=postgres://postgres:password@localhost:5432/Treasure Trove_db

# Payload
PAYLOAD_SECRET=change-me-in-production
PAYLOAD_PUBLIC_SERVER_URL=https://cms.Treasure Trove.in

# AWS S3
AWS_ACCESS_KEY_ID=your-key-id
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1
S3_BUCKET=Treasure Trove-media

# CloudFront
CLOUDFRONT_URL=https://cdn.Treasure Trove.in

# Storefront (for ISR revalidation webhook)
STOREFRONT_URL=https://Treasure Trove.in
REVALIDATE_SECRET=change-me-in-production

# Port
PORT=3001
```

### 14.3 apps/storefront/.env.local

```bash
# Medusa
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.Treasure Trove.in
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_live_xxxxx

# Payload
NEXT_PUBLIC_PAYLOAD_URL=https://cms.Treasure Trove.in

# CloudFront
NEXT_PUBLIC_CLOUDFRONT_URL=https://cdn.Treasure Trove.in

# ISR revalidation
REVALIDATE_SECRET=change-me-in-production
```

---

## 15. Turborepo Pipeline

### 15.1 Local Development

```bash
# Install all dependencies (from repo root)
pnpm install

# Start all apps in parallel
pnpm dev
# Turborepo starts:
#   apps/storefront  → localhost:3000
#   apps/backend     → localhost:9000
#   apps/cms         → localhost:3001

# Start individual app
pnpm dev --filter=storefront
pnpm dev --filter=backend
pnpm dev --filter=cms

# Build all (uses cache — only rebuilds changed packages)
pnpm build

# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check

# Clean all build outputs
pnpm clean
```

### 15.2 Turborepo Cache Behaviour

```
First build:   turbo build  →  builds all 3 apps + 4 packages  ~4 min
Second build:  turbo build  →  nothing changed → 0s (100% cache hit)
After editing storefront:
               turbo build  →  rebuilds storefront only  ~45s
               (backend, cms, packages — all cache hits)
```

Remote caching can be enabled via Vercel Remote Cache (free) to share cache across CI and team members:

```bash
# Link to Vercel Remote Cache
npx turbo login
npx turbo link
```

---

*Treasure Trove Atelier — Architecture v1.0.0 — April 2026*
