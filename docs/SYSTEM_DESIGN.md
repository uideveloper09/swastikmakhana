# Makhana App — System Design

> Premium e-commerce architecture inspired by [BigBasket category URLs](https://www.bigbasket.com/pc/foodgrains-oil-masala/dry-fruits/makhana/)

## 1. URL Architecture (BigBasket Logic)

BigBasket uses **hierarchical slug-based category paths** with a fixed prefix:

```
/pc/{level-1}/{level-2}/{level-3}/...
```

| URL | Meaning |
|-----|---------|
| `/pc/foodgrains-oil-masala` | L1 category |
| `/pc/foodgrains-oil-masala/dry-fruits` | L2 subcategory |
| `/pc/foodgrains-oil-masala/dry-fruits/makhana` | L3 leaf category (PLP) |
| `/p/mr-makhana-himalayan-salt-pepper-55g` | Product detail (PDP) |

### Design Principles

1. **Slug = SEO + hierarchy** — Each segment is a URL-safe slug derived from display name
2. **Path validates tree** — `/pc/a/b/c` only resolves if `a → b → c` exists in category tree
3. **Canonical URL** — Leaf category is the canonical PLP; parent paths show subcategory nav
4. **301 redirects** — Slug changes redirect via `category_redirects` table
5. **Breadcrumbs from path** — No extra API call; path segments map 1:1 to breadcrumb trail

```
Home / Foodgrains, Oil & Masala / Dry Fruits / Makhana
  ↑         ↑                        ↑            ↑
  -    foodgrains-oil-masala    dry-fruits     makhana
```

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CDN (CloudFront)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Next.js 15 (App Router + RSC)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ /pc/[...slug]│  │ /p/[slug]    │  │ ISR + Edge Cache    │ │
│  │ Category PLP │  │ Product PDP  │  │ revalidate: 300s    │ │
│  └──────┬───────┘  └──────┬───────┘  └─────────────────────┘ │
└─────────┼─────────────────┼─────────────────────────────────┘
          │    REST/JSON    │
┌─────────▼─────────────────▼─────────────────────────────────┐
│                   FastAPI (Python 3.12)                      │
│  ┌────────────┐ ┌─────────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Categories │ │  Products   │ │ Filters  │ │   Search   │ │
│  │  Service   │ │   Service   │ │ Service  │ │  Service   │ │
│  └─────┬──────┘ └──────┬──────┘ └────┬─────┘ └─────┬──────┘ │
└────────┼───────────────┼─────────────┼─────────────┼────────┘
         │               │             │             │
┌────────▼───────────────▼─────────────▼─────────────▼────────┐
│                    PostgreSQL 16                             │
│  categories │ products │ product_categories │ filter_facets  │
└─────────────────────────────────────────────────────────────┘
         │
┌────────▼────────┐     ┌──────────────┐
│  Redis Cache    │     │ Elasticsearch │  (Phase 2: full-text)
│  facet counts   │     │  product idx  │
└─────────────────┘     └──────────────┘
```

## 3. Database Schema

### categories (adjacency list + materialized path)

```sql
CREATE TABLE categories (
    id          UUID PRIMARY KEY,
    slug        VARCHAR(120) NOT NULL,
    name        VARCHAR(200) NOT NULL,
    parent_id   UUID REFERENCES categories(id),
    level       SMALLINT NOT NULL,          -- 1, 2, 3...
    path        VARCHAR(500) NOT NULL,      -- "foodgrains-oil-masala/dry-fruits/makhana"
    is_leaf     BOOLEAN DEFAULT false,
    sort_order  INT DEFAULT 0,
    meta_title  VARCHAR(200),
    meta_desc   TEXT,
    UNIQUE(parent_id, slug)
);
CREATE INDEX idx_categories_path ON categories(path);
```

### products

```sql
CREATE TABLE products (
    id            UUID PRIMARY KEY,
    slug          VARCHAR(200) UNIQUE NOT NULL,
    name          VARCHAR(300) NOT NULL,
    brand         VARCHAR(100),
    description   TEXT,
    mrp           DECIMAL(10,2),
    sale_price    DECIMAL(10,2),
    discount_pct  SMALLINT,
    rating        DECIMAL(2,1),
    rating_count  INT DEFAULT 0,
    pack_size     VARCHAR(50),       -- "100 g - Pouch"
    flavour       VARCHAR(50),
    image_url     VARCHAR(500),
    in_stock      BOOLEAN DEFAULT true,
    is_featured   BOOLEAN DEFAULT false
);
```

### product_categories (many-to-many for cross-listing)

```sql
CREATE TABLE product_categories (
    product_id   UUID REFERENCES products(id),
    category_id  UUID REFERENCES categories(id),
    is_primary   BOOLEAN DEFAULT true,
    PRIMARY KEY (product_id, category_id)
);
```

## 4. API Contract

### `GET /api/v1/categories/resolve?path=foodgrains-oil-masala/dry-fruits/makhana`

Resolves path → category tree node + children + breadcrumbs.

```json
{
  "category": { "id": "...", "name": "Makhana", "slug": "makhana", "level": 3, "is_leaf": true },
  "breadcrumbs": [
    { "name": "Foodgrains, Oil & Masala", "slug": "foodgrains-oil-masala", "path": "foodgrains-oil-masala" },
    { "name": "Dry Fruits", "slug": "dry-fruits", "path": "foodgrains-oil-masala/dry-fruits" },
    { "name": "Makhana", "slug": "makhana", "path": "foodgrains-oil-masala/dry-fruits/makhana" }
  ],
  "children": []
}
```

### `GET /api/v1/products?category_path=...&page=1&sort=relevance&brands[]=Farmley&price_min=50`

Returns paginated PLP with facet counts (BigBasket-style filters).

```json
{
  "products": [...],
  "pagination": { "page": 1, "per_page": 48, "total": 234, "total_pages": 5 },
  "facets": {
    "brands": [{ "value": "Farmley", "count": 12 }, ...],
    "flavours": [...],
    "price_ranges": [...],
    "pack_sizes": [...]
  },
  "sort_options": ["relevance", "price_asc", "price_desc", "rating", "discount"]
}
```

## 5. Frontend Routing (Next.js App Router)

```
app/
├── pc/
│   └── [...slug]/
│       └── page.tsx          # Catch-all → PLP
├── p/
│   └── [slug]/
│       └── page.tsx          # PDP
├── layout.tsx
└── page.tsx                  # Home
```

### Path Resolution Flow

```
Request: /pc/foodgrains-oil-masala/dry-fruits/makhana
    │
    ▼
[...slug] = ["foodgrains-oil-masala", "dry-fruits", "makhana"]
    │
    ▼
join("/") → "foodgrains-oil-masala/dry-fruits/makhana"
    │
    ▼
GET /api/v1/categories/resolve?path=...
    │
    ├── 404 → notFound()
    └── 200 → render CategoryPage with filters + products
```

## 6. Filter System (BigBasket Parity)

| Facet | Type | Backend |
|-------|------|---------|
| Brands | multi-select | `brands[]=X` |
| Price | range buckets | `price_range=51-100` |
| Discount | range buckets | `discount=15-25` |
| Flavours | multi-select | `flavours[]=Peri Peri` |
| Pack Size | multi-select | `pack_size[]=100 g` |
| Rating | min threshold | `rating_min=4` |
| Sort | single | `sort=price_asc` |

Facets are computed via aggregated SQL with `FILTER` clauses; counts update when filters applied (conjunctive / AND logic).

## 7. Caching Strategy

| Layer | TTL | Key |
|-------|-----|-----|
| Next.js ISR | 300s | `category:{path}` |
| Redis | 60s | `facets:{path}:{filter_hash}` |
| CDN | 300s | Full page HTML |

## 8. SEO

- `generateMetadata()` from category `meta_title` / `meta_desc`
- JSON-LD `BreadcrumbList` + `ItemList` on PLP
- Canonical: `https://makhana.app/pc/{full-path}`
- Sitemap: `/sitemap-categories.xml` generated from `categories.path`

## 9. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | Next.js 15 + TypeScript | RSC, ISR, App Router catch-all |
| Styling | Tailwind CSS 4 | Premium utility-first UI |
| Backend | FastAPI + Pydantic v2 | Type-safe, async, OpenAPI |
| DB | PostgreSQL (SQLite dev) | Relational hierarchy + facets |
| Cache | Redis (optional dev) | Facet aggregation |

## 10. Folder Structure

```
makhana-app/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── routers/
│   ├── data/seed.json
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   └── package.json
└── docs/SYSTEM_DESIGN.md
```
