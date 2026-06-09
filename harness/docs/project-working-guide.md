# Treasure Trove — Complete Project Working & Workflow Guide

---

## OVERVIEW

Treasure Trove is a **luxury furniture e-commerce platform** built with three separate systems that work together:

| System | URL | Who Uses It |
|---|---|---|
| **Customer Website** (Storefront) | `treasuretrove.in` | Shoppers |
| **Store Admin** (Medusa) | `treasuretrove.in/app` | Store manager — products, orders, inventory |
| **Content Admin** (Payload CMS) | `cms.treasuretrove.in/admin` | Content editor — blogs, homepage, media |

All three share one PostgreSQL database. Changes made in either admin panel reflect live on the website automatically.

---

## PART 1 — THE CUSTOMER WEBSITE

### What the customer sees page by page

---

### 1.1 Homepage (`/`)

When a customer opens the website, the homepage loads **7 sections simultaneously** — all content is pre-rendered for speed:

```
┌─────────────────────────────────────────┐
│  NAVBAR                                 │
│  Logo | Collections | Journal | Account │
├─────────────────────────────────────────┤
│  HERO SECTION                           │
│  Left 65% → Product image carousel      │
│  Right 35% → Editor's Pick panel        │
│  Headline, subtext, CTA button          │
├─────────────────────────────────────────┤
│  TRUST STRIP                            │
│  Free Shipping | 7-Day Returns | COD    │
├─────────────────────────────────────────┤
│  MARQUEE BAR (scrolling text)           │
│  "HANDCRAFTED IN INDIA · FREE SHIPPING" │
├─────────────────────────────────────────┤
│  8 CATEGORY TILES                       │
│  Décor | Bed & Bath | Kitchen | Bar...  │
├─────────────────────────────────────────┤
│  COLLECTIONS GRID                       │
│  Cards for each product collection      │
├─────────────────────────────────────────┤
│  FEATURED PRODUCTS (Bestsellers)        │
│  Product cards with price, image, name  │
├─────────────────────────────────────────┤
│  NEW ARRIVALS                           │
│  Latest products                        │
├─────────────────────────────────────────┤
│  BLOG PREVIEW (3 latest posts)          │
│  Cover image, title, excerpt, Read More │
├─────────────────────────────────────────┤
│  BRAND PHILOSOPHY                       │
│  Eyebrow, headline, body text, CTA      │
├─────────────────────────────────────────┤
│  FOOTER                                 │
└─────────────────────────────────────────┘
```

**Where each section's content comes from:**

| Section | Source | Who Controls It |
|---|---|---|
| Hero, Marquee, Brand Philosophy | Payload CMS | Content editor |
| Featured Products, New Arrivals | Medusa (product tags) | Store manager |
| Collections Grid | Medusa | Store manager |
| Blog Preview (latest 3) | Payload CMS | Content editor |

---

### 1.2 Products Page (`/products`)

The customer can filter and browse all products:

```
URL: /products?material=teak&maxPrice=50000&sort=price_asc&page=1

┌──────────────┬────────────────────────────────────────┐
│ FILTER       │  SORT TOOLBAR                          │
│ SIDEBAR      │  Sort by: Price ↑↓ | Newest | Popular  │
│              ├────────────────────────────────────────┤
│ Material:    │  PRODUCT GRID (12 per page)            │
│ ☑ Teak       │  ┌──────┐ ┌──────┐ ┌──────┐          │
│ ☐ Walnut     │  │Image │ │Image │ │Image │          │
│ ☐ Oak        │  │Name  │ │Name  │ │Name  │          │
│              │  │Rs.X  │ │Rs.X  │ │Rs.X  │          │
│ Max Price:   │  └──────┘ └──────┘ └──────┘          │
│ Rs. 50,000   │                                        │
│              ├────────────────────────────────────────┤
│ In Stock: ☑  │  PAGINATION  1  2  3  4 ...           │
└──────────────┴────────────────────────────────────────┘
```

**Filtering logic:**

| Filter | How It Works |
|---|---|
| Material | Matches product tags in Medusa (e.g., tag = "teak") |
| Max Price | Compares against the highest variant price |
| In Stock | Checks variant inventory quantity > 0 |
| Sort | Price ascending/descending, newest first |

---

### 1.3 Product Detail Page (`/products/[handle]`)

```
┌─────────────────────────────────────────────────┐
│  Breadcrumb: Home > Products > Ōkura Lounge Chair│
├───────────────────────────┬─────────────────────┤
│  IMAGE GALLERY            │  PRODUCT INFO       │
│  ┌────────────────────┐   │  Name               │
│  │   Main Image       │   │  Rs. 48,999         │
│  └────────────────────┘   │                     │
│  [thumb] [thumb] [thumb]  │  Material: Teak ▼   │
│                           │  Size: Large ▼      │
│                           │  Finish: Natural ▼  │
│                           │                     │
│                           │  [ADD TO CART]      │
│                           │  [ADD TO WISHLIST]  │
├───────────────────────────┴─────────────────────┤
│  SPECIFICATIONS                                 │
│  Dimensions: 82cm × 78cm × 85cm                │
│  Wood Type: FSC-certified Teak                  │
│  Warranty: 5 years                              │
├─────────────────────────────────────────────────┤
│  MATERIAL STORY LINK → "Discover Teak"          │
├─────────────────────────────────────────────────┤
│  RELATED PRODUCTS (same collection)             │
└─────────────────────────────────────────────────┘
```

**Key points:**

- **Variants** (material, size, finish) are created in Medusa admin
- **Specifications, dimensions, wood_type, care instructions** are stored in product **metadata** fields in Medusa
- **Finish colors** (swatches) stored in `metadata.finishColors`
- Each product has a **unique handle** (URL slug), e.g., `okura-lounge-chair`

---

### 1.4 Cart & Checkout Flow

**Step 1 — Adding to Cart:**

```
Customer clicks "Add to Cart"
        ↓
Cart drawer slides in from right
        ↓
Shows: product image, name, variant, quantity controls, price
        ↓
Cart persists via browser cookie (7 days)
```

**Step 2 — Checkout (4 steps):**

```
STEP 1: DELIVERY ADDRESS
  Name, Email, Phone, Address, City, State, Pincode
  → Validated (required fields, email format)
  → Saved to Medusa cart

STEP 2: SHIPPING METHOD
  → Fetches available shipping options from Medusa
  → Customer selects (e.g., Standard Delivery - Rs. 99)

STEP 3: PAYMENT
  INR orders → Razorpay payment widget opens
              → Customer pays
              → Razorpay sends webhook to backend
              → Backend verifies payment signature
              → Order confirmed

  USD/AED    → Stripe Elements form appears
              → Card details entered → Stripe confirms

STEP 4: CONFIRMATION
  → Order ID displayed
  → Email notification sent
  → Order created in Medusa
```

---

### 1.5 Journal (Blog) — `/journal`

```
┌──────────────────────────────────────────────────┐
│  "Stories & Inspiration" (dark hero section)     │
├──────────┬──────────┬───────────────────────────  │
│  POST    │  POST    │  POST                       │
│  Image   │  Image   │  Image                      │
│  Title   │  Title   │  Title                      │
│  Author  │  Author  │  Author                     │
│  Date    │  Date    │  Date                       │
│  Excerpt │  Excerpt │  Excerpt                    │
│  Read →  │  Read →  │  Read →                    │
└──────────┴──────────┴────────────────────────────┘
```

- All posts come from **Payload CMS**
- Only **published** posts appear on the website
- Images served via **CloudFront CDN** (`cdn.treasuretrove.in`)
- Clicking a post goes to `/journal/[slug]` with full article

---

### 1.6 Materials Section — `/materials`

Educational pages about each wood type:

```
/materials           → Grid of 5 material cards
                       (Teak, Walnut, Oak, Mango, Rosewood)

/materials/teak      → Full story:
                       - Origin: "Kerala, India"
                       - Sustainability rating: ★★★★★
                       - Description paragraphs
                       - Featured image
                       - Related products with "teak" tag
```

Controlled entirely from **Payload CMS** under Material Stories.

---

### 1.7 Customer Account — `/account`

```
┌──────────────────────────────────────────┐
│  Hello, Priya                            │
├────────────────┬─────────────────────────┤
│  NAV SIDEBAR   │  DASHBOARD              │
│  Dashboard     │  3 Orders | 2 Addresses │
│  Orders        │                         │
│  Addresses     │  RECENT ORDERS          │
│  Settings      │  Order #1234  ₹48,999   │
│  Wishlist      │  Status: Delivered      │
└────────────────┴─────────────────────────┘
```

- Customer logs in via email/password (Medusa auth)
- Orders, addresses, wishlist all stored in Medusa

---

### 1.8 Collections Page — `/collections/[handle]`

```
/collections/living-room

┌─────────────────────────────────────────────────┐
│  COLLECTION HERO                                │
│  Background image + "Living Room" title         │
│  Subtitle: "Timeless pieces for your space"     │
├─────────────────────────────────────────────────┤
│  FILTER BAR                                     │
├───────────────────────────────────────┬─────────┤
│  PRODUCT GRID                         │ FILTERS │
└───────────────────────────────────────┴─────────┘
```

Each collection has:
- A `handle` that becomes the URL
- Products assigned in Medusa Admin
- Hero image and subtitle from collection metadata

---

## PART 2 — THE STORE ADMIN (Medusa)

**Local URL:** `http://localhost:9000/app`
**Production URL:** `treasuretrove.in/app`
**Login:** admin@treasuretrove.com / Admin@123

This is where the **store manager** works daily — products, orders, inventory, customers, regions.

---

### 2.1 Products — Full Workflow

**Creating a new product:**

```
Medusa Admin → Products → New Product

BASIC INFO:
  Title:       "Ōkura Lounge Chair"
  Handle:      okura-lounge-chair     ← becomes the URL /products/okura-lounge-chair
  Description: Full product description
  Collection:  Living Room            ← links to a collection
  Tags:        teak, bestseller       ← controls filters + featured sections

VARIANTS (each combination of options):
  Option 1 "Material":  Teak, Walnut
  Option 2 "Size":      Small, Large
  Option 3 "Finish":    Natural, Dark
  → System creates all combinations automatically (2×2×2 = 8 variants)

FOR EACH VARIANT:
  SKU:      TT-OLC-TEAK-LG-NAT
  Price:    4899900  ← Rs. 48,999 in PAISE (multiply INR × 100)
  Stock:    25

METADATA (extra details the storefront reads):
  wood_type:           "teak"
  dimensions:          "82cm × 78cm × 85cm"
  warranty:            "5 years"
  careInstructions:    "Wipe with a dry cloth"
  detailText:          "Additional marketing description"
  rating:              "4.8"
  reviewCount:         "124"
  finishColors:        { "Natural": "#C4A882", "Dark": "#5C3D2E" }

IMAGES:
  Upload multiple product images (front, side, detail shots)
  → Stored in Medusa's own file storage
  → NOT through Payload CMS (product images are separate)

→ Save → Product live on website within 60 seconds (ISR cache)
```

---

### 2.2 Product Tags — Critical for Homepage

Tags control what appears in each homepage section:

| Tag | Where it appears on website |
|---|---|
| `bestseller` | Homepage "Bestsellers" section |
| `new-arrival` | Homepage "New Arrivals" section |
| `teak` | Teak filter on /products page |
| `walnut` | Walnut filter on /products page |
| `oak` | Oak filter on /products page |

To feature a product on the homepage → Add the relevant tag in Medusa Admin.

---

### 2.3 Collections

Collections group products and appear in the Collections Grid on the homepage.

```
Medusa Admin → Collections → New Collection

  Title:    Living Room
  Handle:   living-room     ← becomes /collections/living-room URL
  Metadata:
    subtitle:   "Timeless pieces for your living space"
    featured:   true         ← shows on homepage grid
    imageUrl:   "..."        ← collection card background image

Add products to collection:
  Collections → [Collection] → Products → Add Products
  → Selected products appear on /collections/living-room
```

---

### 2.4 Orders Management

```
Order placed by customer
        ↓
Medusa Admin → Orders → Order #1234

Manager sees:
  - Customer details (name, email, phone, address)
  - Line items (product name, variant, quantity, price)
  - Payment status: Paid / Pending
  - Fulfillment status: Unfulfilled / Shipped / Delivered

Manager actions (in order):
  1. Create Fulfillment   → marks items as being packed
  2. Mark as Shipped      → enter courier tracking number
  3. Mark as Delivered    → order complete
  4. Process Return       → items returned, stock restored
  5. Process Exchange     → swap variant or product
  6. Issue Refund         → Razorpay/Stripe refund triggered automatically
```

---

### 2.5 Inventory Management

```
Medusa Admin → Products → [Product] → Variants

Each variant shows:
  SKU | Current Stock | Reserved (in pending orders) | Available

To update stock:
  Click variant → Inventory → Adjust quantity → Save

Automatic alerts:
  When stock drops below threshold → low-stock-alert event fires
  → Internal notification sent to store manager
```

---

### 2.6 Customers

```
Medusa Admin → Customers

Lists all registered customers with:
  - Name, email, registration date
  - Order count and total spend
  - Saved addresses
  - Wishlist items

Actions:
  View order history
  View/edit saved addresses
  Deactivate account → customer cannot log in
    (sets metadata.deactivated = true)
```

---

### 2.7 Regions & Pricing

Three regions are configured:

| Region | Currency | Tax | Payment |
|---|---|---|---|
| India | INR (₹) | 18% GST | Razorpay |
| UAE | AED | 5% VAT | Stripe |
| Southeast Asia | USD ($) | 0% | Stripe |

**⚠️ Important — All prices must be entered in the SMALLEST currency unit:**

| Display Price | Enter in Medusa |
|---|---|
| ₹999 | 99,900 |
| ₹4,999 | 4,99,900 |
| ₹48,999 | 48,99,900 |
| $99 | 9,900 |

The storefront automatically divides by 100 and formats as "Rs. 48,999".

---

### 2.8 Bulk Product Import (CSV)

For importing many products at once:

```
Prepare CSV with columns:
  title, handle, description, variant_sku, price_inr, price_usd,
  stock, material, size, finish, wood_type, dimensions, warranty

Upload via Admin API:
  POST /admin/products/import  (multipart form-data)

Response shows:
  { created: 45, updated: 12, skipped: 3, failed: 0 }

All imported products automatically synced to MeiliSearch search index.
```

---

### 2.9 Search Index (MeiliSearch)

If the search index gets out of sync with the database:

```
POST /admin/meilisearch/sync

→ Fetches ALL products in batches of 50
→ Indexes each product with:
   title, handle, description, collection name, min/max price
→ Returns: { synced: 250, deleted: 3 }

Products are also auto-synced when:
  - A product is created → product-upsert event → sync triggered
  - A product is deleted → product-delete event → removed from index
```

---

## PART 3 — THE CONTENT ADMIN (Payload CMS)

**Local URL:** `http://localhost:3001/admin`
**Production URL:** `cms.treasuretrove.in/admin`
**Login:** admin@treasuretrove.com / Admin@123

This is where the **content editor** works — blog posts, homepage banners, material stories, media uploads.

---

### 3.1 Media Library — Upload Images First

Before writing any content, upload images here first.

```
Payload Admin → Media → Create New

  1. Drag and drop image file
     Accepted formats: JPEG, PNG, WebP only
     Maximum size: 10MB

  2. Fill in Alt Text (REQUIRED — cannot save without it)
     Good: "Ōkura Lounge Chair in teak with black woven seat, front view"
     Bad:  "image1" or leaving it empty

  3. Save

     ↓  PRODUCTION (AWS credentials configured):
     Image uploads to private S3 bucket: s3://treasure-trove-media/
     URL stored in DB: https://cdn.treasuretrove.in/filename.jpg
     Customer browser NEVER touches S3 — only CloudFront CDN

     ↓  LOCAL DEV (no AWS keys):
     Image saved to CMS disk
     URL stored: http://localhost:3001/api/media/file/filename.jpg
```

---

### 3.2 Blog Posts — Full Workflow

```
Payload Admin → Blog Posts → Create New

━━━ SIDEBAR FIELDS ━━━━━━━━━━━━━━━━━━━━━━━━━
  Slug:         AUTO-GENERATED from title (read-only after first save)
                "10 Must-Have Accessories" → "10-must-have-accessories"
                URL becomes: /journal/10-must-have-accessories

  Author:       "Priya Nair"

  Published At: 2026-05-07  (date picker — cosmetic display date)

  Related Posts: Link up to 3 other blog posts
                 (shown at the bottom of the article page)

  Status:       Draft  /  Published

━━━ MAIN FIELDS ━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Title:        "10 Must-Have Accessories for a Modern Lifestyle"

  Excerpt:      Short summary paragraph
                (shown on /journal listing cards, max ~200 chars)

  Cover Image:  Pick from Media Library
                (upload in Media first, then select here)

  Tags:         Array of text tags
                e.g., "accessories", "styling", "guide"

  Content:      Lexical rich-text editor
                Supports:
                  → Headings (H1, H2, H3, H4)
                  → Paragraphs
                  → Bold, Italic, Underline, Strikethrough
                  → Bullet lists, Numbered lists
                  → Blockquotes
                  → Hyperlinks
                  → Inline image uploads
```

**Draft vs Publish:**

```
SAVE AS DRAFT
  → Post saved in database
  → NOT visible on website
  → URL /journal/slug returns 404 for customers
  → Editor can preview before publishing

PUBLISH (set Status → Published, then Save)
  → _status field set to "published"
  → afterChange hook fires automatically:
       POST http://storefront/api/revalidate
       { type: "blog", slug: "10-must-have-..." }
  → Storefront clears cache for /journal and /journal/10-must-have-...
  → Post appears on website within seconds

EDITING A LIVE POST
  → Make changes → Save
  → Hook fires again → Cache revalidated again
  → Website shows updated content within seconds
```

---

### 3.3 Homepage Content — What the Editor Controls

The homepage is fully controlled from a **single document** in Payload Admin:

```
Payload Admin → Globals → Homepage Content

━━━ HERO SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Headline:          "Modern Heirlooms, Handcrafted in India"
  Subtext:           "Discover our curated collection..."
  CTA Label:         "SHOP NEW ARRIVALS"
  CTA Link:          /products
  Background Image:  [Pick from Media Library]
  Editor Pick Title: "The Lighting Edit"
  Editor Pick Link:  /collections/lighting

━━━ MARQUEE BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Items (array — drag to reorder):
    1. "HANDCRAFTED IN INDIA"
    2. "FREE SHIPPING OVER RS. 999"
    3. "7-DAY RETURNS"
    4. "SECURE PAYMENTS"
    5. "NEW ARRIVALS EVERY WEEK"
    6. "COD AVAILABLE"
  (Add new items, remove old ones, drag to change order)

━━━ BRAND PHILOSOPHY SECTION ━━━━━━━━━━━━━━━━━━━━━━
  Eyebrow:   "MONSOON READY"
  Headline:  "Outdoor Planters from Rs. 1,499"
  Body Text: [Rich text editor — write paragraphs, bold key phrases]
  Image:     [Pick from Media Library]
  CTA Text:  "SHOP OUTDOOR"
  CTA Link:  /collections/outdoor

→ Click Save
→ Homepage cache clears automatically
→ Changes visible on website within seconds
```

---

### 3.4 Material Stories — Full Workflow

```
Payload Admin → Material Stories → Create New

  Wood Type:             Teak
                         (options: teak / walnut / oak / mango / rosewood)
                         Slug auto-generated: "teak"
                         URL becomes: /materials/teak

  Origin:                "Kerala, India"

  Sustainability Rating: 5   (scale 1–5, shown as stars on website)

  Featured Image:        [Pick from Media Library]

  Description:           [Lexical rich-text editor]
                         Write 2–4 paragraphs about the material —
                         sourcing story, craftsmanship, sustainability,
                         care tips etc.

  Published At:          [date]

  Status:                Draft / Published

→ Publish
→ Page appears at /materials/teak
→ Products tagged "teak" in Medusa automatically appear below the story
→ Cache revalidated automatically
```

---

### 3.5 Users — CMS Admin Accounts

```
Payload Admin → Users → Create New

  Name:     "Content Editor"
  Email:    editor@treasuretrove.com
  Password: (set securely)

  This user CAN:
    ✓ Upload images to Media Library
    ✓ Create and publish blog posts
    ✓ Edit homepage content
    ✓ Create and publish material stories
    ✓ Manage other CMS users

  This user CANNOT:
    ✗ View or manage orders
    ✗ Manage products or inventory
    ✗ Access Medusa Admin
    (those require separate Medusa admin login)
```

---

## PART 4 — HOW EVERYTHING CONNECTS

### 4.1 Content Editor Publishes a Blog Post → Customer Sees It

```
STEP 1: Editor opens Payload Admin → Blog Posts → New
        Writes title, content, uploads cover image

STEP 2: Sets Status to Published → Saves

STEP 3: Payload fires afterChange hook automatically:
        POST http://storefront:3000/api/revalidate
        headers: { x-revalidate-secret: "secret-key" }
        body:    { type: "blog", slug: "my-new-post" }

STEP 4: Storefront's /api/revalidate route:
        - Validates secret header
        - Calls revalidatePath("/journal")
        - Calls revalidatePath("/journal/my-new-post")

STEP 5: Next customer who visits /journal:
        - Next.js fetches fresh data from Payload
        - GET /api/blog-posts?_status=published
        - New post appears in the grid instantly

STEP 6: Customer clicks post → /journal/my-new-post → full article

⚠️  REVALIDATE_SECRET must be IDENTICAL in both:
     apps/cms/.env → REVALIDATE_SECRET=xxxxx
     apps/storefront/.env.local → REVALIDATE_SECRET=xxxxx
    If they differ, published content won't update on website.
```

---

### 4.2 Store Manager Adds a Product → Appears on Website

```
STEP 1: Manager opens Medusa Admin → Products → New Product
        Fills title, handle, variants with prices (in paise), tags, metadata

STEP 2: Saves product

STEP 3: product.updated event fires
        → product-upsert subscriber runs
        → syncProductsToMeilisearchWorkflow runs
        → Product indexed in MeiliSearch for search

STEP 4: Product appears on website:
        /products page has ISR revalidate = 3600s (1 hour)
        → Within 1 hour, product appears automatically
        → Or force immediate update:
           POST /api/revalidate { type: "product", slug: "handle" }

STEP 5: Customer visits /products → sees product in grid
        Customer visits /products/okura-lounge-chair → full detail page
```

---

### 4.3 Customer Places an Order → Manager Fulfills It

```
STEP 1: Customer adds product to cart
        → Cart ID saved in browser cookie (7 days)

STEP 2: Customer fills address
        → Saved to Medusa cart via server action

STEP 3: Customer selects shipping option
        → Shipping method applied to cart

STEP 4: Customer pays:

        INR (India):
          Storefront creates Razorpay order
          Customer pays on Razorpay widget
          Razorpay sends webhook to backend
          Backend verifies HMAC signature
          Payment authorized → order completed

        USD/AED (International):
          Stripe Elements card form appears
          Customer enters card details
          Stripe confirms payment
          Order completed

STEP 5: order.placed event fires
        → Customer gets order confirmation notification
        → Inventory automatically reserved/deducted

STEP 6: Manager opens Medusa Admin → Orders → sees Order #1234

STEP 7: Manager fulfills order:
        Create Fulfillment → Mark Shipped (add tracking) → Mark Delivered

STEP 8: Customer checks /account/orders → sees live status updates
```

---

### 4.4 Image Upload → Appears on Website

**Production flow (with AWS S3):**

```
STEP 1: Editor opens Payload Admin → Media → New
        Drags image file (JPEG/PNG/WebP, max 10MB)
        Types alt text

STEP 2: Saves
        → Payload S3 plugin uploads to private S3 bucket:
          s3://treasure-trove-media/filename.jpg

STEP 3: generateFileURL() constructs the URL:
        https://cdn.treasuretrove.in/filename.jpg
        ← This CloudFront URL is what gets stored in the database
        ← The S3 URL is NEVER stored or exposed

STEP 4: Editor uses this media in a blog post or homepage section

STEP 5: Customer visits page
        <CloudFrontImage> component renders:
        src = "https://cdn.treasuretrove.in/filename.jpg"
        → Browser downloads image from CloudFront edge server
          (Fast global CDN — closest server to customer)
        → S3 bucket stays private, never directly accessed
```

**Local development flow (without AWS):**

```
Image saved to CMS disk at /public/media/filename.jpg
URL stored: http://localhost:3001/api/media/file/filename.jpg
Storefront configured to allow localhost:3001 as image host
```

---

### 4.5 Homepage Editor Updates Banner → Live on Website

```
STEP 1: Editor opens Payload Admin → Globals → Homepage Content
        Changes Hero headline to "Summer Sale — Up to 40% Off"
        Changes CTA link to /collections/sale
        Uploads new hero background image

STEP 2: Saves

STEP 3: afterChange hook fires:
        POST http://storefront/api/revalidate
        { type: "homepage" }

STEP 4: Storefront clears cache for "/"

STEP 5: Next customer who opens the website sees new banner
        (usually within seconds)
```

---

## PART 5 — QUICK DAILY WORKFLOWS

### For the Content Editor (Payload CMS Admin)

| Task | Steps |
|---|---|
| Publish a new blog post | Blog Posts → New → Fill all fields → Set Status: Published → Save |
| Edit an existing post | Blog Posts → Find post → Edit → Save (auto-revalidates live) |
| Change homepage banner | Globals → Homepage Content → Edit Hero → Save |
| Update marquee text | Globals → Homepage Content → Marquee → Add/Remove/Reorder → Save |
| Upload a new image | Media → New → Drag image → Type alt text → Save |
| Add a material story | Material Stories → New → Select wood type → Fill content → Publish |
| Change brand philosophy text | Globals → Homepage Content → Brand Philosophy → Edit → Save |
| See all uploaded images | Media → lists all uploads with alt text, dimensions, file size |

---

### For the Store Manager (Medusa Admin)

| Task | Steps |
|---|---|
| Add a new product | Products → New → Fill details + variants + prices (paise) + metadata → Save |
| Feature product on homepage | Products → [Product] → Tags → Add `bestseller` or `new-arrival` |
| Update product price | Products → [Product] → Variants → [Variant] → Edit price (in paise) |
| Adjust stock quantity | Products → [Product] → Variants → [Variant] → Inventory → Adjust |
| Fulfill an order | Orders → [Order] → Create Fulfillment → Mark Shipped → Mark Delivered |
| Process a refund | Orders → [Order] → Refund → Enter amount → Confirm |
| Create a collection | Collections → New → Title + Handle + Metadata → Add products |
| Deactivate a customer | Customers → [Customer] → Deactivate |
| Bulk import products | Prepare CSV → POST /admin/products/import |
| Re-sync search index | POST /admin/meilisearch/sync |

---

## PART 6 — SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                         CUSTOMER BROWSER                        │
│                    https://treasuretrove.in                     │
└─────────────────────┬──────────────────┬────────────────────────┘
                      │                  │
          ┌───────────▼──────┐  ┌────────▼───────────┐
          │   STOREFRONT     │  │   CLOUDFRONT CDN   │
          │   Next.js 15     │  │ cdn.treasuretrove  │
          │   Vercel         │  │     .in            │
          └──────┬────┬──────┘  └────────┬───────────┘
                 │    │                  │
      ┌──────────▼─┐ ┌▼──────────┐  ┌───▼──────────────┐
      │  MEDUSA    │ │  PAYLOAD  │  │   AWS S3 BUCKET  │
      │  BACKEND   │ │  CMS      │  │  (Private)       │
      │  v2        │ │  v3       │  │  Media Files     │
      │  EC2+PM2   │ │  EC2+PM2  │  └──────────────────┘
      │  :9000     │ │  :3001    │
      └──────┬─────┘ └─────┬─────┘
             │             │
             └──────┬──────┘
                    │
          ┌─────────▼─────────────┐
          │  PostgreSQL Database  │
          │  TreasureTrove_db     │
          │                       │
          │  Medusa tables:       │
          │  product, order,      │
          │  cart, customer...    │
          │                       │
          │  Payload tables:      │
          │  payload_blog_posts,  │
          │  payload_media,       │
          │  payload_users...     │
          └───────────────────────┘
```

---

## PART 7 — DATA OWNERSHIP RULES

**Critical rule: Never mix these two systems.**

| Data Type | Stored In | Admin Panel |
|---|---|---|
| Products, variants, prices | Medusa | Medusa Admin |
| Inventory, stock levels | Medusa | Medusa Admin |
| Cart, orders, customers | Medusa | Medusa Admin |
| Regions, taxes, shipping | Medusa | Medusa Admin |
| Payments (Razorpay/Stripe) | Medusa | Medusa Admin |
| Blog posts, articles | Payload CMS | Payload Admin |
| Material stories | Payload CMS | Payload Admin |
| Homepage content | Payload CMS | Payload Admin |
| Media/images (editorial) | Payload CMS → S3 → CloudFront | Payload Admin |
| Product images | Medusa file storage | Medusa Admin |

---

## PART 8 — ENVIRONMENT VARIABLES REFERENCE

### CMS (`apps/cms/.env`)

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URI` | PostgreSQL connection string | `postgres://user@localhost:5432/TreasureTrove_db` |
| `PAYLOAD_SECRET` | JWT signing secret | Long random string |
| `PAYLOAD_PUBLIC_SERVER_URL` | CMS public URL | `http://localhost:3001` |
| `REVALIDATE_SECRET` | **Must match storefront** | Same value as storefront |
| `AWS_ACCESS_KEY_ID` | S3 upload credential | From AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | S3 upload credential | From AWS IAM |
| `AWS_REGION` | S3 bucket region | `ap-south-1` |
| `S3_BUCKET` | S3 bucket name | `treasure-trove-media` |
| `CLOUDFRONT_URL` | CDN base URL | `https://cdn.treasuretrove.in` |
| `STOREFRONT_URL` | Where to send revalidation webhooks | `http://localhost:3000` |

### Storefront (`apps/storefront/.env.local`)

| Variable | Purpose | Example |
|---|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Medusa API URL | `http://localhost:9000` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Required for Medusa store routes | From Medusa Admin → API Keys |
| `NEXT_PUBLIC_PAYLOAD_URL` | Payload CMS API URL | `http://localhost:3001` |
| `NEXT_PUBLIC_CLOUDFRONT_URL` | CDN base URL for images | `https://cdn.treasuretrove.in` |
| `REVALIDATE_SECRET` | **Must match CMS** | Same value as CMS |

### Backend (`apps/backend/.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis for sessions and events |
| `JWT_SECRET` | Auth token signing |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay payments |
| `STRIPE_API_KEY` | Stripe payments |
| `MEILISEARCH_HOST` / `MEILISEARCH_KEY` | Search index (optional) |

---

## PART 9 — CACHE & UPDATE TIMES

How long before a change appears on the website:

| Change Type | How Updated | Time |
|---|---|---|
| Blog post published | Webhook revalidation | Seconds |
| Blog post edited | Webhook revalidation | Seconds |
| Homepage content changed | Webhook revalidation | Seconds |
| Material story published | Webhook revalidation | Seconds |
| New product added | ISR timer | Up to 60 seconds |
| Product price changed | ISR timer | Up to 60 seconds |
| Cart / Checkout | Always real-time | Instant |
| Order status | Always real-time | Instant |

**If content is not updating:**
1. Check that `REVALIDATE_SECRET` matches in both CMS `.env` and storefront `.env.local`
2. Manually trigger revalidation:
   ```
   POST http://localhost:3000/api/revalidate
   header: x-revalidate-secret: [your-secret]
   body: { "type": "blog", "slug": "post-slug" }
   ```

---

## PART 10 — LOCAL DEVELOPMENT SETUP

**Starting all apps:**
```bash
# From repo root — starts all three apps in parallel
pnpm dev

# Or start individually:
pnpm dev --filter=storefront   # localhost:3000
pnpm dev --filter=backend      # localhost:9000
pnpm dev --filter=cms          # localhost:3001
```

**Local admin URLs:**
| Panel | URL | Credentials |
|---|---|---|
| Customer website | http://localhost:3000 | (public) |
| Store Admin | http://localhost:9000/app | admin@treasuretrove.com / Admin@123 |
| CMS Admin | http://localhost:3001/admin | admin@treasuretrove.com / Admin@123 |

**Local database:**
- PostgreSQL running locally
- Database: `TreasureTrove_db`
- S3 disabled (no AWS credentials needed) — images stored on CMS disk
- Redis optional for local dev (in-memory fallback used)
