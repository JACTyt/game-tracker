from fastapi import APIRouter
from app.models.search import FiltersResponse, FilterOption
from app.services.igdb import IGDBClient
import os

router = APIRouter()

igdb_client = IGDBClient(
    client_id=os.getenv("IGDB_CLIENT_ID", ""),
    client_secret=os.getenv("IGDB_CLIENT_SECRET", ""),
)


@router.get("/filters", response_model=FiltersResponse)
def get_filters():
    genres = [FilterOption(**g) for g in igdb_client.fetch_genres()]
    platforms = [FilterOption(**p) for p in igdb_client.fetch_platforms()]
    themes = [FilterOption(**t) for t in igdb_client.fetch_themes()]
    return FiltersResponse(genres=genres, platforms=platforms, themes=themes)
