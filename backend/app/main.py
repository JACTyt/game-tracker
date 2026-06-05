from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import filters, health, search
import os

app = FastAPI(title="GameTrace API")

_raw_origins = os.getenv("FRONTEND_URL", "http://localhost:4200")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(filters.router)
app.include_router(search.router)
