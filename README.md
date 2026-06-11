# Swastik Makhana

**Pure Fox Nuts from Bihar's Finest Farms**

Premium e-commerce platform with **BigBasket-style hierarchical category URLs**.

Inspired by: [bigbasket.com/pc/foodgrains-oil-masala/dry-fruits/makhana](https://www.bigbasket.com/pc/foodgrains-oil-masala/dry-fruits/makhana/)

## URL System

| Pattern | Example |
|---------|---------|
| Category PLP | `/pc/foodgrains-oil-masala/dry-fruits/makhana` |
| Product PDP | `/p/mr-makhana-himalayan-salt-pepper-55g` |

Path segments map 1:1 to category tree → breadcrumbs auto-generated.

## Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** FastAPI + Pydantic v2 (Python)
- **Data:** JSON seed (dev) → PostgreSQL (prod)

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://127.0.0.1:8000/docs

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

App: http://localhost:3000

### Demo URLs

- Home: http://localhost:3000
- Makhana PLP: http://localhost:3000/pc/foodgrains-oil-masala/dry-fruits/makhana
- Product: http://localhost:3000/p/mr-makhana-himalayan-salt-pepper-55g

## API Endpoints

```
GET /api/v1/categories/resolve?path=foodgrains-oil-masala/dry-fruits/makhana
GET /api/v1/categories/tree
GET /api/v1/products?category_path=...&brands[]=Farmley&sort=price_asc
GET /api/v1/products/{slug}
```

## System Design

See [docs/SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md) for full architecture:
- Database schema
- Filter/facet system
- Caching strategy
- SEO (JSON-LD, canonical URLs, sitemaps)

## Project Structure

```
makhana-app/
├── backend/          # FastAPI Python API
│   ├── app/
│   │   ├── routers/  # categories, products
│   │   ├── services/ # business logic
│   │   ├── schemas/  # Pydantic models
│   │   └── models/   # data store
│   └── data/seed.json
├── frontend/         # Next.js TypeScript
│   └── src/
│       ├── app/pc/[...slug]/  # catch-all category route
│       ├── app/p/[slug]/      # product detail
│       ├── components/        # UI components
│       └── lib/               # API client, filters
└── docs/SYSTEM_DESIGN.md
```
