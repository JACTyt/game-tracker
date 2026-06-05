from fastapi import APIRouter, Header, HTTPException
from app.models.search import FiltersResponse, FilterOption
from app.services.igdb import IGDBClient

router = APIRouter()


@router.get("/filters", response_model=FiltersResponse)
def get_filters(
    x_igdb_client_id: str | None = Header(default=None),
    x_igdb_client_secret: str | None = Header(default=None),
):
    if not x_igdb_client_id or not x_igdb_client_secret:
        raise HTTPException(status_code=401, detail="IGDB credentials required")
    igdb = IGDBClient(client_id=x_igdb_client_id, client_secret=x_igdb_client_secret)
    genres = [FilterOption(**g) for g in igdb.fetch_genres()]
    platforms = [FilterOption(**p) for p in igdb.fetch_platforms()]
    themes = [FilterOption(**t) for t in igdb.fetch_themes()]
    return FiltersResponse(genres=genres, platforms=platforms, themes=themes)
