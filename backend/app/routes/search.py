from fastapi import APIRouter, Header, HTTPException
from app.models.search import SearchRequest, SearchResponse
from app.services.search import SearchService
from app.services.igdb import IGDBClient
from app.services.openai_service import OpenAIService

router = APIRouter()


@router.post("/search", response_model=SearchResponse)
def post_search(
    request: SearchRequest,
    x_igdb_client_id: str | None = Header(default=None),
    x_igdb_client_secret: str | None = Header(default=None),
    x_openai_key: str | None = Header(default=None),
):
    if not x_igdb_client_id or not x_igdb_client_secret:
        raise HTTPException(status_code=401, detail="IGDB credentials required")
    igdb = IGDBClient(client_id=x_igdb_client_id, client_secret=x_igdb_client_secret)
    openai_svc = OpenAIService(api_key=x_openai_key) if x_openai_key else None
    return SearchService(igdb_client=igdb, openai_service=openai_svc).search(request)
