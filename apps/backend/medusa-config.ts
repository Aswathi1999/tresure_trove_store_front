import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import path from 'node:path'

loadEnv(process.env['NODE_ENV'] || 'development', process.cwd())

const reactRouterDomDir = path.dirname(require.resolve('react-router-dom/package.json'))
const reactRouterDir = path.dirname(require.resolve('react-router/package.json'))

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env['DATABASE_URL'],
    ...(process.env['NODE_ENV'] === 'production' && { redisUrl: process.env['REDIS_URL'] }),
    http: {
      storeCors: process.env['STORE_CORS']!,
      adminCors: process.env['ADMIN_CORS']!,
      authCors: process.env['AUTH_CORS']!,
      jwtSecret: process.env['JWT_SECRET'] || 'supersecret',
      cookieSecret: process.env['COOKIE_SECRET'] || 'supersecret',
    },
  },
  admin: {
    disable: false,
    vite: () => ({
      server: {
        allowedHosts: ['api.35.244.29.45.nip.io'],
      },
      // Raise the admin media upload limit from the 1MB default to 3MB.
      // Medusa's dashboard reads this build-time global (falls back to 1024*1024).
      define: {
        __MAX_UPLOAD_FILE_SIZE__: JSON.stringify(3 * 1024 * 1024),
      },
      resolve: {
        dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom'],
        alias: {
          'react-router-dom': reactRouterDomDir,
          'react-router': reactRouterDir,
        },
      },
    }),
  },
  modules: [
    // ─── Commerce modules (auto-registered by Medusa v2) ──────────────
    // Customer, Product, Pricing, Cart, Order, Inventory, Stock Location,
    // Promotion, Gift Card, Region, Tax, and API Key modules are all
    // registered automatically by the Medusa framework — no explicit
    // entry is required here.
    //
    // @medusajs/region   → Modules.REGION
    //   Three regions seeded via src/scripts/seed-regions.ts:
    //   India (INR, IN) · UAE (AED, AE) · Southeast Asia (USD, SG/MY/TH/PH/ID/VN)
    //   Run: medusa exec ./src/scripts/seed-regions.ts
    //
    // @medusajs/tax      → Modules.TAX
    //   Tax rates set per country in seed-regions.ts:
    //   India 18% GST · UAE 5% VAT · SEA 0%
    //   automatic_taxes is disabled per region; rates are manually seeded.
    //
    // @medusajs/api-key  → Modules.API_KEY
    //   Publishable API keys scoped to sales channels.
    //   Create via: POST /admin/api-keys
    //   The storefront NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY env var holds the key.
    //
    // @medusajs/customer  → Modules.CUSTOMER
    // @medusajs/promotion → Modules.PROMOTION  (discount codes, campaigns)
    //
    // Promotion rule types configured for Treasure Trove:
    //   region_id             → restricts a code to India / UAE / SEA region
    //   product_collection_id → collection-specific discounts
    //   customer_group_id     → VIP / trade / wholesale group discounts
    //
    // Application methods are currency-aware (smallest unit):
    //   INR → paise  |  USD → cents  |  AED → fils
    //
    // Usage limits and expiry dates are enforced natively by the Promotion
    // module — no custom middleware is needed.
    //
    // Gift card denominations (created via seed-promos.ts or Admin API):
    //   INR: ₹500 (50000) · ₹1000 (100000) · ₹2000 (200000) · ₹5000 (500000)
    //   USD: $25 (2500)   · $50 (5000)      · $100 (10000)
    //   AED: AED 100 (10000) · AED 250 (25000) · AED 500 (50000)
    //
    // Admin API: POST /admin/gift-cards  |  POST /admin/promotions
    // Store API: POST /store/carts/:id/promotions (apply) · DELETE (remove)

    // ─── Product Reviews (custom module) ─────────────────────────────
    {
      resolve: './src/modules/product-review',
    },

    // ─── Search (only loaded when MeiliSearch env vars are present) ──
    ...(process.env['MEILISEARCH_HOST']
      ? [
          {
            resolve: './src/modules/meilisearch',
            options: {
              host: process.env['MEILISEARCH_HOST'],
              apiKey: process.env['MEILISEARCH_API_KEY']!,
              productIndexName: process.env['MEILISEARCH_PRODUCT_INDEX_NAME'] ?? 'products',
            },
          },
        ]
      : []),

    // ─── Infrastructure ────────────────────────────────────────────
    // In production use Redis; locally fall back to in-memory (Windows Redis is 3.x, BullMQ needs 5+)
    ...(process.env['NODE_ENV'] === 'production'
      ? [
          {
            resolve: '@medusajs/medusa/cache-redis',
            options: { redisUrl: process.env['REDIS_URL'] },
          },
          {
            resolve: '@medusajs/medusa/event-bus-redis',
            options: { redisUrl: process.env['REDIS_URL'] },
          },
          {
            resolve: '@medusajs/medusa/workflow-engine-redis',
            options: { redis: { url: process.env['REDIS_URL'] } },
          },
        ]
      : [
          { resolve: '@medusajs/medusa/cache-inmemory' },
          { resolve: '@medusajs/medusa/event-bus-local' },
          { resolve: '@medusajs/medusa/workflow-engine-inmemory' },
        ]),

    // ─── Auth ──────────────────────────────────────────────────────
    {
      resolve: '@medusajs/medusa/auth',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/auth-emailpass',
            id: 'emailpass',
            options: {},
          },
        ],
      },
    },

    // ─── Payments ──────────────────────────────────────────────────
    // Razorpay: INR region (India). Stripe: USD + AED regions (international).
    // Providers are only loaded when their keys are present in env.
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          ...(process.env['RAZORPAY_KEY_ID']
            ? [
                {
                  resolve: './src/modules/razorpay-payment',
                  id: 'razorpay',
                  options: {
                    keyId: process.env['RAZORPAY_KEY_ID'],
                    keySecret: process.env['RAZORPAY_KEY_SECRET'],
                    webhookSecret: process.env['RAZORPAY_WEBHOOK_SECRET'],
                  },
                },
              ]
            : []),
          ...(process.env['STRIPE_API_KEY']
            ? [
                {
                  resolve: '@medusajs/payment-stripe',
                  id: 'stripe',
                  options: {
                    apiKey: process.env['STRIPE_API_KEY'],
                    webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'],
                  },
                },
              ]
            : []),
        ],
      },
    },

    // ─── File Storage ──────────────────────────────────────────────
    // Production: S3 + CloudFront. Local dev: falls back to local disk when
    // AWS credentials are absent so the server starts without S3 configured.
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          process.env['AWS_ACCESS_KEY_ID'] &&
          process.env['AWS_SECRET_ACCESS_KEY'] &&
          process.env['S3_BUCKET']
            ? {
                resolve: '@medusajs/file-s3',
                id: 's3',
                options: {
                  file_url: process.env['CLOUDFRONT_URL'],
                  access_key_id: process.env['AWS_ACCESS_KEY_ID'],
                  secret_access_key: process.env['AWS_SECRET_ACCESS_KEY'],
                  region: process.env['AWS_REGION'] || 'auto',
                  bucket: process.env['S3_BUCKET'],
                  endpoint: process.env['S3_ENDPOINT'],
                  prefix: 'products',
                },
              }
            : {
                resolve: '@medusajs/file-local',
                id: 'local',
                options: {
                  upload_dir: 'uploads',
                  backend_url: `http://localhost:${process.env['PORT'] || 9000}`,
                },
              },
        ],
      },
    },

    // ─── Fulfillment ───────────────────────────────────────────────────────────
    // Manual fulfillment provider for local/admin-managed shipping.
    // Swap or extend with a courier integration (e.g. Shiprocket) in production.
    {
      resolve: '@medusajs/medusa/fulfillment',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/fulfillment-manual',
            id: 'manual',
            options: {},
          },
        ],
      },
    },

    // ─── Notifications ─────────────────────────────────────────────
    // Development: logs outbound notifications to stdout.
    // Replace with @medusajs/notification-sendgrid (or similar) in production.
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          {
            resolve: '@medusajs/notification-local',
            id: 'local',
            options: {},
          },
        ],
      },
    },
  ],
})
