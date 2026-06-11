from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.dependencies import get_store
from app.routers import (
    auth,
    categories,
    chat,
    home,
    launch_notify,
    newsletter,
    products,
    search,
    wishlist,
)

@asynccontextmanager
async def lifespan(_app: FastAPI):
    get_store.cache_clear()
    yield


app = FastAPI(
    title="Swastik Makhana API",
    description="Premium e-commerce API for Swastik Makhana — BigBasket-style category URLs",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(home.router, prefix="/api/v1")
app.include_router(newsletter.router, prefix="/api/v1")
app.include_router(launch_notify.router, prefix="/api/v1")
app.include_router(wishlist.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")


@app.get("/health")
def health() -> dict[str, str | int]:
    store = get_store()
    return {
        "status": "ok",
        "service": "swastik-makhana-api",
        "products": len(store.products),
    }
