from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from httpx import HTTPStatusError, TransportError
from app.routes import filters, health, search
import os

app = FastAPI(title="GameTrace API")


@app.exception_handler(HTTPStatusError)
def igdb_status_error_handler(request: Request, exc: HTTPStatusError):
    """Upstream (IGDB/Twitch) returned an error status — surface it clearly."""
    url = str(exc.request.url)
    code = exc.response.status_code
    # Any failure at the Twitch OAuth token step is a credentials problem
    # (400 = bad client id, 403 = bad secret), as is a 401 anywhere.
    if "oauth2/token" in url or code in (401, 403):
        return JSONResponse(
            status_code=401,
            content={"detail": "IGDB rejected your credentials. Check your Twitch Client ID and Secret."},
        )
    return JSONResponse(status_code=502, content={"detail": f"IGDB request failed ({code})."})


@app.exception_handler(TransportError)
def igdb_transport_error_handler(request: Request, exc: TransportError):
    """Could not reach IGDB (DNS/connection/timeout)."""
    return JSONResponse(
        status_code=503,
        content={"detail": "Could not reach IGDB. Check your connection and try again."},
    )

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
