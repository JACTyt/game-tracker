import datetime
from app.models.search import (
    SearchRequest, SearchResponse, GameResult, ExtractedFilters,
    GameWebsite, GameAgeRating,
)
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


def _fmt_ts(timestamp: int | None, fmt: str = "%b %d, %Y") -> str | None:
    if not timestamp:
        return None
    return datetime.datetime.fromtimestamp(timestamp, datetime.timezone.utc).strftime(fmt)


def _igdb_game_to_result(
    game: dict,
    score_map: dict[int, dict] | None = None,
    semantic: bool = False,
) -> GameResult:
    if score_map is None:
        score_map = {}
    scored = score_map.get(game["id"], {})

    # In semantic mode `score` is the AI relevance score only. Candidates the
    # model didn't score are treated as non-matches (None) rather than borrowing
    # their critic rating, which would let highly-rated but irrelevant games
    # outrank real matches. In filter mode we fall back to the critic rating so
    # the card still shows a quality signal.
    if game["id"] in score_map:
        score = scored.get("score")
    elif semantic:
        score = None
    else:
        score = int(game["total_rating"]) if game.get("total_rating") else None

    involved = game.get("involved_companies", [])
    developers = [
        c["company"]["name"] for c in involved
        if c.get("developer") and c.get("company") and c["company"].get("name")
    ]
    publishers = [
        c["company"]["name"] for c in involved
        if c.get("publisher") and c.get("company") and c["company"].get("name")
    ]
    supporting = [
        c["company"]["name"] for c in involved
        if c.get("supporting") and not c.get("developer") and not c.get("publisher")
        and c.get("company") and c["company"].get("name")
    ]

    videos = game.get("videos", [])
    trailer_id = videos[0]["video_id"] if videos else None

    websites = [
        GameWebsite(url=w["url"], category=w["category"])
        for w in game.get("websites", [])
        if w.get("url") and w.get("category") is not None
    ]

    age_ratings = [
        GameAgeRating(category=r["category"], rating=r["rating"])
        for r in game.get("age_ratings", [])
        if r.get("category") is not None and r.get("rating") is not None
    ]

    languages = sorted({
        lc["language"]["name"]
        for lc in game.get("language_supports", [])
        if lc.get("language") and lc["language"].get("name")
    })

    release_ts = game.get("first_release_date")

    return GameResult(
        igdb_id=game["id"],
        title=game.get("name", ""),
        cover_url=_normalize_cover_url((game.get("cover") or {}).get("url")),
        year=_extract_year(release_ts),
        release_date=_fmt_ts(release_ts),
        genres=[g["name"] for g in game.get("genres", [])],
        themes=[t["name"] for t in game.get("themes", [])],
        platforms=[p["name"] for p in game.get("platforms", [])],
        summary=game.get("summary"),
        storyline=game.get("storyline"),
        score=score,
        matched_signals=scored.get("matched_signals", []),
        match_reason=scored.get("reason"),
        developers=developers,
        publishers=publishers,
        supporting_developers=supporting,
        game_modes=[m["name"] for m in game.get("game_modes", [])],
        player_perspectives=[p["name"] for p in game.get("player_perspectives", [])],
        series=[c["name"] for c in game.get("collections", [])],
        franchises=[f["name"] for f in game.get("franchises", [])],
        game_engines=[e["name"] for e in game.get("game_engines", [])],
        alternative_titles=[a["name"] for a in game.get("alternative_names", [])],
        keywords=[k["name"] for k in game.get("keywords", [])[:20]],
        user_rating=game.get("rating"),
        user_rating_count=game.get("rating_count"),
        critic_rating=game.get("aggregated_rating"),
        critic_rating_count=game.get("aggregated_rating_count"),
        websites=websites,
        supported_languages=languages[:30],
        updated_date=_fmt_ts(game.get("updated_at")),
        age_ratings=age_ratings,
        trailer_id=trailer_id,
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
            query=request.query,
            genre_ids=genre_ids,
            theme_ids=theme_ids,
            platform_ids=platform_ids,
            year_min=request.filters.year_min,
            year_max=request.filters.year_max,
            limit=request.limit,
        )
        results = [_igdb_game_to_result(g) for g in games]
        return SearchResponse(results=results, mode="filter")

    def _text_search(self, request: SearchRequest) -> SearchResponse:
        games = self._igdb.text_search(request.query, limit=request.limit)
        results = [_igdb_game_to_result(g) for g in games]
        return SearchResponse(results=results, mode="text_search")

    def _semantic_search(self, request: SearchRequest) -> SearchResponse:
        if self._openai is None:
            return self._text_search(request)
        extracted = self._openai.extract_filters(request.query)

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

        # Build the candidate pool from most-to-least targeted sources. We only
        # pull filter/rating-sorted candidates when there are real filters —
        # otherwise an empty filter set returns the top critic-rated games in the
        # whole database, which are almost never what the user described.
        seen: set[int] = set()
        games: list[dict] = []

        def add(candidates: list[dict]) -> None:
            for g in candidates:
                if g["id"] not in seen:
                    seen.add(g["id"])
                    games.append(g)

        # 1. Exact title the AI identified (e.g. "Overwatch" from Tracer).
        if extracted.game_title:
            add(self._igdb.search_games(query=extracted.game_title, limit=5))

        # 2. Text search on the raw query — catches names/keywords the user typed.
        if request.query.strip():
            add(self._igdb.text_search(request.query, limit=request.limit))

        # 3. Filter-based candidates, only when we actually have filters.
        has_filters = bool(genre_ids or theme_ids or platform_ids or year_min or year_max)
        if has_filters:
            add(self._igdb.search_games(
                genre_ids=genre_ids,
                theme_ids=theme_ids,
                platform_ids=platform_ids,
                year_min=year_min,
                year_max=year_max,
                limit=request.limit * 3,
            ))

        if not games:
            return SearchResponse(results=[], extracted_filters=extracted, mode="semantic")

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
            [_igdb_game_to_result(g, score_map, semantic=True) for g in games],
            key=lambda r: r.score if r.score is not None else -1,
            reverse=True,
        )[: request.limit]

        return SearchResponse(results=results, extracted_filters=extracted, mode="semantic")
