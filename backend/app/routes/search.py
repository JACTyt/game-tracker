from fastapi import APIRouter
from app.models.search import SearchRequest, SearchResponse
from app.services.search import SearchService
from app.services.igdb import IGDBClient
from app.services.openai_service import OpenAIService
import os

router = APIRouter()

_igdb = IGDBClient(
    client_id=os.getenv("IGDB_CLIENT_ID", ""),
    client_secret=os.getenv("IGDB_CLIENT_SECRET", ""),
)
_openai = OpenAIService(api_key=os.getenv("OPENAI_API_KEY", ""))
search_service = SearchService(igdb_client=_igdb, openai_service=_openai)


@router.post("/search", response_model=SearchResponse)
def post_search(request: SearchRequest):
    return search_service.search(request)
