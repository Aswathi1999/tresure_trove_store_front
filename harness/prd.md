# Treasure Trove Furniture Store — Product Requirements Document

**Version:** 2.0.0
**Date:** April 2026
**Author:** Treasure Trove Product Team
**Status:** Draft — In Review
**Stack:** Next.js 15 + Medusa v2 + Payload CMS + PostgreSQL + AWS S3

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Tech Stack](#3-tech-stack)
4. [Architecture Overview](#4-architecture-overview)
5. [Feature Requirements](#5-feature-requirements)
6. [Page Inventory](#6-page-inventory)
7. [Data Models](#7-data-models)
8. [Content Management — Payload CMS](#8-content-management--payload-cms)
9. [Media & Image Storage — AWS S3](#9-media--image-storage--aws-s3)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Development Phases](#11-development-phases)
12. [Local Development Setup](#12-local-development-setup)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [Success Metrics](#14-success-metrics)
15. [Changelog](#15-changelog)

---

## 1. Executive Summary

Treasure Trove is a luxury furniture ecommerce platform built for the Indian and international market. It showcases handcrafted, sustainably sourced furniture targeting discerning buyers who value craftsmanship, material quality, and a refined shopping experience.

The platform is built entirely on open-source, self-hosted infrastructure — giving the client full ownership with no recurring SaaS licensing fees. The stack combines:

- **Next.js 15** for the customer-facing storefront
- **Medusa v2** for all commerce logic (products, orders, inventory)
- **Payload CMS** for editorial content management (blog, materials, homepage)
- **PostgreSQL** as the single shared database for both Medusa and Payload
- **AWS S3** for all media and image storage with CDN delivery

Development is AI-assisted using Claude Code, reducing delivery time by approximately 60% compared to traditional development.

---

## 2. Product Vision & Goals

### 2.1 Vision Statement

To create the most refined online furniture shopping experience in India — one that mirrors the quality of the products it sells. Treasure Trove's platform should feel as carefully crafted as its furniture: unhurried, elegant, and deeply intentional.

### 2.2 Business Goals

- Launch a fully functional furniture ecommerce store serving India and international markets
- Achieve a conversion rate of 2.5% or above within 6 months of launch
- Support a product catalogue of up to 500 SKUs across 5 collections
- Enable non-technical content editors to manage blog, materials, and homepage content via Payload CMS admin UI
- Achieve Core Web Vitals scores of 90+ across all pages
- Zero ongoing SaaS licensing costs — fully owned infrastructure

### 2.3 Target Audience

| Segment | Profile | Key Need |
|---|---|---|
| Primary | Urban Indian professionals, 28–45, household income ₹25L+ | Unique quality furniture with transparent craftsmanship story |
| Secondary | Interior designers and architects | Reliable trade pricing, bulk order capability |
| Tertiary | NRI / international buyers (UAE, UK, SEA) | Indian-origin luxury furniture, international shipping |

---

## 3. Tech Stack

### 3.1 Frontend — Next.js Storefront

| Package | Version | Purpose |
|---|---|---|
| Next.js | v15 | App Router, SSR, ISR, API routes |
| React | v19 | UI component library |
| Tailwind CSS | v4 | Utility-first styling |
| Framer Motion | v11 | Animations and scroll reveals |
| TypeScript | v5 | Type safety across codebase |
| Medusa JS SDK | v2 | Commerce API client |
| Payload SDK | v3 | CMS API client (REST / GraphQL) |

### 3.2 Commerce Backend — Medusa

| Package | Version | Purpose |
|---|---|---|
| Medusa.js | v2 | Headless commerce engine |
| Node.js | v20+ | Runtime environment |
| PostgreSQL | v16 | Shared primary database |
| Redis | v7 | Sessions and cache |
| MikroORM | v6 | ORM used internally by Medusa |

### 3.3 Content Management — Payload CMS

| Package | Version | Purpose |
|---|---|---|
| Payload CMS | v3 | Headless CMS engine |
| Node.js | v20+ | Runtime environment |
| PostgreSQL | v16 | Shared database (same instance as Medusa) |
| @payloadcms/db-postgres | v3 | PostgreSQL adapter for Payload |
| @payloadcms/richtext-lexical | v3 | Rich text editor |
| @payloadcms/plugin-cloud-storage | v3 | S3 media storage plugin |

### 3.4 Media Storage — AWS S3

| Service | Purpose |
|---|---|
| AWS S3 | Primary image and file storage |
| AWS CloudFront | CDN for fast global image delivery |
| S3 Bucket Policy | Public read access for media assets |

### 3.5 Infrastructure & Deployment

| Service | Provider | Role |
|---|---|---|
| Next.js hosting | Vercel | CDN and edge deployment |
| Medusa + Payload server | EC2 t3.small | Node.js backend host (both services) |
| PostgreSQL | RDS or self-hosted on EC2 | Managed shared database |
| Redis | Upstash (free tier) | Managed cache |
| Media storage | AWS S3 | Images and files |
| Media CDN | AWS CloudFront | Global image delivery |
| Domain and SSL | Cloudflare | DNS and TLS |

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT BROWSER                    │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              NEXT.JS 15 STOREFRONT                  │
│                   (Vercel)                          │
│  ┌─────────────────┐    ┌──────────────────────┐   │
│  │  Medusa JS SDK  │    │    Payload REST API   │   │
│  └────────┬────────┘    └──────────┬───────────┘   │
└───────────┼─────────────────────────┼───────────────┘
            │                         │
┌───────────▼──────────┐  ┌───────────▼───────────────┐
│    MEDUSA v2 SERVER  │  │    PAYLOAD CMS SERVER      │
│   localhost:9000     │  │      localhost:3001         │
│   (EC2 t3.small)     │  │     (same EC2)             │
└───────────┬──────────┘  └───────────┬───────────────┘
            │                         │
┌───────────▼─────────────────────────▼───────────────┐
│              POSTGRESQL v16 (shared DB)             │
│         Treasure Trove_db — two separate schemas            │
│   medusa_* tables   │   payload_* tables            │
└─────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│               AWS S3 + CLOUDFRONT                   │
│         Treasure Trove-media bucket (images/files)          │
└─────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

- **Shared PostgreSQL** — Both Medusa and Payload use the same PostgreSQL instance but separate table prefixes (`medusa_*` and `payload_*`), reducing infrastructure cost and complexity
- **Single EC2 instance** — Both Medusa (port 9000) and Payload (port 3001) run on the same server using PM2 process manager
- **S3 for all media** — All images uploaded via Payload Admin are stored directly in S3 and served via CloudFront CDN — no disk storage on EC2
- **No Sanity, no third-party CMS SaaS** — 100% self-owned content infrastructure

---

## 5. Feature Requirements

### 5.1 Storefront — Customer Pages

#### 5.1.1 Homepage
- Full-bleed hero section with headline and subtext (from Payload CMS homepage singleton)
- Animated marquee bar with configurable announcement messages
- Collections grid — 3 featured collections (Living Room, Dining, Bedroom)
- Featured products section — 4 handpicked products from Medusa
- Brand philosophy section with stats (pieces crafted, artisans, warranty)
- Blog preview — latest 2 posts from Payload CMS
- Footer with navigation, newsletter signup, brand logo

#### 5.1.2 Products Listing Page
- Responsive grid — 4 columns desktop, 2 tablet, 1 mobile
- Filter sidebar — by collection, material, price range
- Sort options — newest, price low-high, price high-low
- Pagination or infinite scroll
- Product card — image (from S3/CloudFront), name, material, price

#### 5.1.3 Product Detail Page (PDP)
- Multi-image gallery with zoom-on-hover (images served from CloudFront)
- Variant selector — material, size, finish options
- Real-time price update based on selected variant
- Stock availability indicator
- Add to cart with quantity selector
- Delivery estimate section
- Related products carousel
- Material story link — connects to Payload CMS material page
- Structured data markup (JSON-LD) for SEO

#### 5.1.4 Cart & Checkout
- Slide-in cart drawer with item list, quantities, subtotal
- Multi-step checkout — Address → Shipping → Payment → Confirmation
- Order confirmation page with order ID and summary

#### 5.1.5 Customer Account
- Register and login (email and password)
- Order history with order detail view
- Address book management
- Wishlist — save and manage favourite products
- Profile settings — name, email, password update

### 5.2 Editorial Pages — Payload CMS Powered

#### 5.2.1 Journal (Blog)
- Blog listing page — all posts, title, excerpt, author, date, cover image
- Blog detail page — full rich text rendered from Payload lexical editor
- Cover image served from AWS S3 via CloudFront
- Content managed entirely in Payload Admin UI

#### 5.2.2 Materials Showcase
- Page per wood type — Teak, Walnut, Oak, Mango, Rosewood
- Origin, description, sustainability rating per material
- Featured image from S3/CloudFront
- All content managed in Payload Admin

#### 5.2.3 About / Craftsmanship Page
- Brand story — history, founders, atelier location
- Artisan team profiles
- Craftsmanship process steps
- Static Next.js page, editable via code

### 5.3 Medusa Admin Dashboard

#### 5.3.1 Product Management
- Create, edit, delete products with images, descriptions, variants
- Manage collections and categories
- Set pricing per region and currency
- Bulk CSV import

#### 5.3.2 Order Management
- View and manage all orders with status tracking
- Fulfillment workflow — packed, shipped, delivered
- Handle returns and refunds
- Manual draft order creation

#### 5.3.3 Inventory & Customers
- Stock level management per variant
- Multi-location inventory support
- Customer profiles with order history
- Customer groups for trade pricing

#### 5.3.4 Settings & Configuration
- Regions — India, UAE, Southeast Asia
- Multi-currency — INR, USD, AED
- Shipping zones and rates
- Tax configuration per region
- Discount codes and gift cards
- API key management
- Team member roles and access

### 5.4 Payload CMS Admin Dashboard

#### 5.4.1 Collections (Content Types)
- **Blog Posts** — full CRUD, draft/publish workflow, rich text editor
- **Material Stories** — wood type, origin, sustainability rating, images
- **Homepage Content** — singleton document for hero, marquee, featured section

#### 5.4.2 Media Management
- Image upload directly from Payload Admin
- Images stored automatically to AWS S3 via plugin
- CloudFront URL returned for use in Next.js
- Alt text management
- File size and format validation

#### 5.4.3 Access Control
- Admin role — full access
- Editor role — can create and edit content, cannot delete
- Viewer role — read-only preview access

---

## 6. Page Inventory

| # | Page | Route | Data Source | Render Type |
|---|---|---|---|---|
| 1 | Homepage | / | Medusa + Payload | SSR + ISR |
| 2 | Products listing | /products | Medusa | ISR |
| 3 | Product detail | /products/[handle] | Medusa | ISR |
| 4 | Collections | /collections/[handle] | Medusa | ISR |
| 5 | Cart | /cart | Medusa (client) | CSR |
| 6 | Checkout | /checkout | Medusa | CSR |
| 7 | Order confirmation | /order/confirmed | Medusa | CSR |
| 8 | Account login | /account/login | Medusa | CSR |
| 9 | Account dashboard | /account | Medusa | CSR |
| 10 | Journal listing | /journal | Payload CMS | ISR |
| 11 | Journal post | /journal/[slug] | Payload CMS | ISR |
| 12 | Materials | /materials | Payload CMS | ISR |
| 13 | Material detail | /materials/[slug] | Payload CMS | ISR |
| 14 | About | /about | Static | Static |
| 15 | Contact | /contact | Static | Static |
| 16 | Search results | /search | Medusa | CSR |

---

## 7. Data Models

### 7.1 Medusa — Core Entities

#### Product
```
id                  string      unique identifier
title               string      product name
handle              string      URL slug
description         text        full description
thumbnail           string      primary image URL (S3/CloudFront)
variants[]
  id                string
  title             string      e.g. "Teak / Large"
  sku               string
  price             number      in smallest currency unit
  inventory_qty     number
options[]
  material          string      teak | walnut | oak | mango
  size              string      small | medium | large
  finish            string      natural | dark | light
collection_id       string
metadata
  wood_type         string
  care_instructions text
  origin            string
  warranty_years    number
```

#### Order
```
id                  string
status              string      pending | processing | shipped | delivered
customer_id         string
region_id           string
items[]
  variant_id        string
  quantity          number
  unit_price        number
shipping_address    object
billing_address     object
payment_status      string      awaiting | captured | refunded
fulfillment_status  string      not_fulfilled | shipped | delivered
total               number
subtotal            number
tax_total           number
shipping_total      number
```

### 7.2 Payload CMS — Collection Schemas

#### blogPost
```
id                  string      auto-generated
title               string      required
slug                string      auto-generated from title
publishedAt         datetime
status              string      draft | published
coverImage          object
  url               string      CloudFront URL
  alt               string
excerpt             text        max 200 characters
body                richText    Lexical editor blocks
author              string
```

#### materialStory
```
id                  string
title               string      required
slug                string      auto-generated
woodType            string      enum: teak | walnut | oak | mango | rosewood
origin              string      e.g. "Kerala, India"
description         richText    Lexical editor blocks
sustainabilityRating number     1 to 5
featuredImage       object
  url               string      CloudFront URL
  alt               string
```

#### homepageContent (singleton)
```
heroHeadline        string
heroSubtext         text
marqueeItems[]      string      array of announcement strings
featuredCollectionTitle string
featuredCollectionHandle string
```

#### media (Payload built-in collection)
```
id                  string
filename            string
mimeType            string
filesize            number
url                 string      CloudFront CDN URL
alt                 string
s3Key               string      S3 object key
width               number
height              number
```

---

## 8. Content Management — Payload CMS

### 8.1 Why Payload CMS

- **Open source** — MIT licensed, no SaaS fees
- **Self-hosted** — runs on the same EC2 instance as Medusa
- **Shared PostgreSQL** — uses existing database, no extra DB needed
- **TypeScript-native** — schemas defined in code, type-safe throughout
- **Beautiful admin UI** — comparable to Sanity Studio, no extra hosting needed
- **Next.js integration** — official `payload` package works natively with App Router

### 8.2 Running Payload

Payload runs on **port 3001** on the same EC2 instance as Medusa.

```
Medusa server    → http://your-ec2-ip:9000
Medusa Admin     → http://your-ec2-ip:9000/app
Payload server   → http://your-ec2-ip:3001
Payload Admin    → http://your-ec2-ip:3001/admin
```

Both are managed by PM2 and proxied through Nginx.

### 8.3 Shared Database Strategy

Payload and Medusa share one PostgreSQL instance (`Treasure Trove_db`) with separate table prefixes to avoid collisions:

```sql
-- Medusa tables (managed by Medusa migrations)
medusa_product
medusa_order
medusa_customer
...

-- Payload tables (managed by Payload migrations)
payload_blog_posts
payload_material_stories
payload_homepage_content
payload_media
payload_users
...
```

### 8.4 Draft and Publish Workflow

Payload supports draft/publish per document. Blog posts and material stories can be saved as drafts and previewed before publishing. Homepage content changes are published immediately on save.

---

## 9. Media & Image Storage — AWS S3

### 9.1 Architecture

All images and media files are stored in AWS S3 and served via CloudFront CDN:

```
Client uploads image via Payload Admin
          ↓
Payload @payloadcms/plugin-cloud-storage
          ↓
AWS S3 bucket: Treasure Trove-media
          ↓
CloudFront distribution
          ↓
Next.js storefront fetches image via CloudFront URL
```

### 9.2 S3 Bucket Configuration

```
Bucket name:     Treasure Trove-media
Region:          ap-south-1 (Mumbai — closest to India)
Access:          Private (CloudFront OAC for read)
Versioning:      Disabled (media assets are immutable)
Folder structure:
  /products/         product images from Medusa
  /blog/             blog post cover images
  /materials/        material story images
  /misc/             other uploads
```

### 9.3 CloudFront Configuration

```
Origin:              S3 bucket (via OAC)
Distribution URL:    https://cdn.Treasure Trove.in
Caching:             7 days for images (immutable)
Price class:         PriceClass_200 (includes India, Asia, Europe)
HTTPS:               Enforced
```

### 9.4 Payload S3 Plugin Setup

```typescript
// payload.config.ts
import { cloudStorage } from '@payloadcms/plugin-cloud-storage'
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3'

export default buildConfig({
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
          }),
        },
      },
    }),
  ],
})
```

### 9.5 Image Usage in Next.js

```typescript
// next.config.ts
images: {
  domains: ['cdn.Treasure Trove.in'],
  formats: ['image/avif', 'image/webp'],
}

// Component usage
<Image
  src={product.thumbnail}  // CloudFront URL
  alt={product.title}
  width={800}
  height={600}
  priority
/>
```

### 9.6 Cost Estimate

| Resource | Free tier | Expected usage | Cost |
|---|---|---|---|
| S3 storage | 5 GB free (12 months) | ~2 GB for 500 products | ~$0.046/GB/month after free tier |
| S3 PUT requests | 2,000 free/month | Low (uploads only) | Minimal |
| CloudFront | 1 TB free/month (12 months) | ~50 GB/month | Free for first year |
| After free tier | — | ~50 GB bandwidth | ~$4–8/month |

For a new store, AWS media costs will be effectively **$0 for the first 12 months** on the free tier, then approximately **$5–10/month** after that.

---

## 10. Non-Functional Requirements

### 10.1 Performance

| Metric | Target | Method |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5 seconds | Next/Image + CloudFront CDN |
| INP (Interaction to Next Paint) | < 100 ms | Minimal JS on critical path |
| CLS (Cumulative Layout Shift) | < 0.1 | Explicit image dimensions |
| Core Web Vitals score | 90+ on all pages | Lighthouse CI in pipeline |
| TTFB (Time to First Byte) | < 200 ms | ISR + edge caching on Vercel |
| Medusa API response | < 300 ms p95 | Redis caching layer |
| Payload API response | < 200 ms p95 | PostgreSQL indexes + ISR |

### 10.2 SEO

- Dynamic meta title and description per page
- Open Graph images generated via Next.js OG API
- JSON-LD structured data on all product pages
- Sitemap.xml auto-generated and submitted to Google Search Console
- Robots.txt configured for proper crawl control
- Canonical URLs on all paginated pages
- Image alt text required on all media uploads (enforced in Payload schema)

### 10.3 Security

- HTTPS enforced on all routes via Cloudflare
- JWT-based authentication for Medusa Admin and Payload Admin
- Medusa publishable API key scoped to read-only for storefront
- Payload API tokens scoped per collection per role
- Environment variables stored in EC2 SSM Parameter Store and Vercel Secrets
- S3 bucket private — all access via CloudFront with Origin Access Control
- AWS IAM role for EC2 with minimal S3 permissions (PutObject, GetObject on Treasure Trove-media only)
- Rate limiting on Medusa and Payload API routes via Nginx

### 10.4 Accessibility

- WCAG 2.1 AA compliance target
- Keyboard navigation on all interactive elements
- ARIA labels on images, buttons, and form fields
- Sufficient colour contrast ratios (minimum 4.5:1 for body text)
- Focus indicators visible on all interactive elements
- Alt text enforced via Payload media collection schema validation

### 10.5 Browser & Device Support

| Browser | Support |
|---|---|
| Chrome (latest 2 versions) | Full |
| Safari (latest 2 versions) | Full |
| Firefox (latest) | Full |
| Edge (latest) | Full |
| Mobile Safari (iOS 15+) | Full |
| Chrome for Android | Full |
| Samsung Internet | Partial |

---

## 11. Development Phases

All development is AI-assisted using Claude Code. Hours reflect Claude Code estimates (approximately 40% of traditional manual estimates) with a 15% buffer applied.

| # | Phase | CC Hours | Duration | Key Deliverables |
|---|---|---|---|---|
| 1 | Setup & Design System | 28 hrs | ~5 days | Repos, env, Tailwind tokens, fonts, base components |
| 2 | Core Storefront Pages | 96 hrs | ~16 days | Homepage, PDP, Listings, Cart, Checkout |
| 3 | Customer Features | 44 hrs | ~7 days | Auth, Account, Wishlist, Search |
| 4 | Medusa Commerce Backend | 90 hrs | ~15 days | Products, Orders, Inventory, Regions, Discounts |
| 5 | Payload CMS Setup | 30 hrs | ~5 days | Collections, schemas, admin config, access roles |
| 6 | S3 + CloudFront Setup | 16 hrs | ~3 days | Bucket, CDN, IAM, Payload plugin integration |
| 7 | Storefront CMS Integration | 24 hrs | ~4 days | Blog pages, materials pages, homepage content |
| 8 | SEO, Performance & Infra | 51 hrs | ~9 days | Meta, Sitemap, OG, ISR, image optimization |
| 9 | Deployment | 28 hrs | ~5 days | Vercel + EC2 (Medusa + Payload), RDS, PM2, Nginx |
| 10 | QA, Polish & Launch | 36 hrs | ~6 days | Cross-browser QA, Core Web Vitals, bug fixes |

**Total Claude Code Hours:** ~443 hrs
**Total Working Days (6 hrs/day):** ~74 days
**Calendar Duration (5 days/week):** ~15 weeks

---

## 12. Local Development Setup

### 12.1 Prerequisites

- Node.js v20 or higher
- PostgreSQL v16
- Redis v7
- AWS account (S3 bucket + CloudFront for media — can use local disk in dev)
- Git

### 12.2 Folder Structure

```
Treasure Trove/
├── Treasure Trove-backend/        ← Medusa v2 server
├── Treasure Trove-cms/            ← Payload CMS server
├── Treasure Trove-storefront/     ← Next.js 15 storefront
└── README.md
```

### 12.3 Services & Ports

| Service | Local URL | Description |
|---|---|---|
| Medusa Backend | http://localhost:9000 | Commerce API |
| Medusa Admin | http://localhost:9000/app | Product, order, inventory management |
| Payload CMS | http://localhost:3001 | Content API |
| Payload Admin | http://localhost:3001/admin | Blog, materials, homepage editing |
| Next.js Storefront | http://localhost:3000 | Customer-facing store |
| PostgreSQL | localhost:5432 | Shared database (Treasure Trove_db) |
| Redis | localhost:6379 | Sessions and cache |

### 12.4 Environment Variables

#### Treasure Trove-backend/.env
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/Treasure Trove_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
```

#### Treasure Trove-cms/.env
```
DATABASE_URI=postgres://postgres:postgres@localhost:5432/Treasure Trove_db
PAYLOAD_SECRET=your-payload-secret
AWS_ACCESS_KEY_ID=your-key-id
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=ap-south-1
S3_BUCKET=Treasure Trove-media
CLOUDFRONT_URL=https://cdn.Treasure Trove.in
```

#### Treasure Trove-storefront/.env.local
```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx
NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3001
NEXT_PUBLIC_CLOUDFRONT_URL=https://cdn.Treasure Trove.in
```

### 12.5 Default Admin Credentials

| Service | Email | Password |
|---|---|---|
| Medusa Admin | admin@Treasure Trove.com | Admin@123 |
| Payload Admin | admin@Treasure Trove.com | Admin@123 |

---

## 13. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Medusa v2 breaking API changes | High | Medium | Pin exact package versions, monitor changelog |
| Payload CMS schema migration issues | Medium | Low | Version control all schema changes, test migrations locally first |
| S3 bucket misconfiguration exposing files | High | Low | IAM policy review, CloudFront OAC enforced, no public S3 access |
| EC2 downtime affecting both Medusa and Payload | High | Low | Health checks via PM2, Railway as failover option |
| CloudFront CDN propagation delays | Low | Medium | 15-minute cache invalidation on content publish |
| PostgreSQL shared DB table collision | High | Very Low | Strict table prefix convention, separate migration tracks |
| Claude Code generating incorrect business logic | Medium | Medium | Code review on all AI-generated PRs, integration tests |
| AWS free tier expiry after 12 months | Medium | High | Budget ~$8/month for S3 + CloudFront after free tier |
| Performance regression after feature additions | Medium | Medium | Lighthouse CI on every PR |

---

## 14. Success Metrics

### 14.1 Technical KPIs

| Metric | Target |
|---|---|
| Core Web Vitals (all pages) | Score 90+ |
| Homepage load time | < 2 seconds |
| Medusa API uptime | 99.9% |
| Payload CMS uptime | 99.9% |
| Image delivery time (CloudFront) | < 100 ms p95 |
| Mobile usability score | 100/100 on Google Search Console |

### 14.2 Business KPIs (6-Month Targets)

| Metric | Target |
|---|---|
| Conversion rate | 2.5%+ |
| Average order value | ₹75,000+ |
| Monthly organic visitors | 5,000+ |
| Repeat purchase rate | 15%+ |
| Customer satisfaction (CSAT) | 4.5 / 5 |
| Content publishing frequency | 2 blog posts/week (via Payload Admin) |

---

## 15. Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0.0 | April 2026 | Treasure Trove Product Team | Initial PRD with Sanity CMS |
| 2.0.0 | April 2026 | Treasure Trove Product Team | Replaced Sanity with Payload CMS + AWS S3. Removed payment details. Updated architecture, data models, and all phase estimates |

---

*Treasure Trove Atelier — Crafted with intention*
