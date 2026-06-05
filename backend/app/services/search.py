import datetime
from app.models.search import SearchRequest, SearchResponse, GameResult, ExtractedFilters
from app.services.igdb import IGDBClient


def _normalize_cover_url(url: str | None) -> str | None:
    if not url:
        return None
    if url.startswith("//"):
        url = "https:" + url
    return url.replace("t_thumb", "t_cover_big")


def _extract_year(timestamp: int | None) -> int | None:
    if not timestamp:
        return None
    return datetime.datetime.fromtimestamp(timestamp, datetime.timezone.utc).year


def _igdb_game_to_result(game: dict, score_map: dict[int, dict] | None = None) -> GameResult:
    if score_map is None:
        score_map = {}
    scored = score_map.get(game["id"], {})
    return GameResult(
        igdb_id=game["id"],
        title=game.get("name", ""),
        cover_url=_normalize_cover_url(game.get("cover", {}).get("url")),
        year=_extract_year(game.get("first_release_date")),
        genres=[g["name"] for g in game.get("genres", [])],
        platforms=[p["name"] for p in game.get("platforms", [])],
        summary=game.get("summary"),
        score=scored.get("score", int(game.get("total_rating", 0)) if game.get("total_rating") else None),
        matched_signals=scored.get("matched_signals", []),
    )


class SearchService:
    def __init__(self, igdb_client: IGDBClient, openai_service=None):
        self._igdb = igdb_client
        self._openai = openai_service

    def search(self, request: SearchRequest) -> SearchResponse:
        if request.mode == "semantic":
            return self._semantic_search(request)
        return self._filter_search(request)

    def _filter_search(self, request: SearchRequest) -> SearchResponse:
        genres = self._igdb.fetch_genres()
        platforms = self._igdb.fetch_platforms()
        themes = self._igdb.fetch_themes()

        genre_ids = self._igdb.resolve_names_to_ids(request.filters.genres, genres)
        platform_ids = self._igdb.resolve_names_to_ids(request.filters.platforms, platforms)
        theme_ids = self._igdb.resolve_names_to_ids(request.filters.themes, themes)

        games = self._igdb.search_games(
            genre_ids=genre_ids,
            theme_ids=theme_ids,
            platform_ids=platform_ids,
            year_min=request.filters.year_min,
            year_max=request.filters.year_max,
            limit=request.limit,
        )
        results = [_igdb_game_to_result(g) for g in games]
        return SearchResponse(results=results, mode="filter")

    def _semantic_search(self, request: SearchRequest) -> SearchResponse:
        extracted = self._openai.extract_filters(request.query)

        # User-applied filters take precedence; GPT-4o fills unset fields
        genres = request.filters.genres or extracted.genres
        themes = request.filters.themes or extracted.themes
        platforms = request.filters.platforms or extracted.platforms
        year_min = request.filters.year_min or (extracted.year_range.min if extracted.year_range else None)
        year_max = request.filters.year_max or (extracted.year_range.max if extracted.year_range else None)

        all_genres = self._igdb.fetch_genres()
        all_platforms = self._igdb.fetch_platforms()
        all_themes = self._igdb.fetch_themes()

        genre_ids = self._igdb.resolve_names_to_ids(genres, all_genres)
        platform_ids = self._igdb.resolve_names_to_ids(platforms, all_platforms)
        theme_ids = self._igdb.resolve_names_to_ids(themes, all_themes)

        games = self._igdb.search_games(
            genre_ids=genre_ids,
            theme_ids=theme_ids,
            platform_ids=platform_ids,
            year_min=year_min,
            year_max=year_max,
            limit=request.limit * 3,
        )

        scored_list = self._openai.score_results(request.query, [
            {
                "igdb_id": g["id"],
                "title": g.get("name", ""),
                "genres": [x["name"] for x in g.get("genres", [])],
                "summary": g.get("summary", ""),
            }
            for g in games
        ])
        score_map = {s["igdb_id"]: s for s in scored_list}

        results = sorted(
            [_igdb_game_to_result(g, score_map) for g in games],
            key=lambda r: r.score or 0,
            reverse=True,
        )[: request.limit]

        return SearchResponse(results=results, extracted_filters=extracted, mode="semantic")
