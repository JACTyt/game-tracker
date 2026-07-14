import datetime
import httpx
from app.cache import TTLCache

IGDB_TOKEN_URL = "https://id.twitch.tv/oauth2/token"
IGDB_API_URL = "https://api.igdb.com/v4"

_token_cache = TTLCache(ttl_seconds=3600 * 24 * 30)
_genre_cache = TTLCache(ttl_seconds=3600 * 24)
_platform_cache = TTLCache(ttl_seconds=3600 * 24)
_theme_cache = TTLCache(ttl_seconds=3600 * 24)

_GAME_FIELDS = (
    "fields id, name, summary, storyline, cover.url, first_release_date, updated_at, "
    "total_rating, rating, rating_count, aggregated_rating, aggregated_rating_count, "
    "genres.name, themes.name, platforms.name, "
    "involved_companies.company.name, involved_companies.developer, "
    "involved_companies.publisher, involved_companies.supporting, "
    "game_modes.name, player_perspectives.name, "
    "collections.name, franchises.name, game_engines.name, "
    "alternative_names.name, keywords.name, "
    "websites.url, websites.category, "
    "language_supports.language.name, "
    "age_ratings.category, age_ratings.rating, "
    "videos.video_id, videos.name"
)


class IGDBClient:
    def __init__(self, client_id: str, client_secret: str):
        self._client_id = client_id
        self._client_secret = client_secret

    def _get_token(self) -> str:
        cache_key = f"token:{self._client_id}"
        cached = _token_cache.get(cache_key)
        if cached:
            return cached
        resp = httpx.post(
            IGDB_TOKEN_URL,
            params={
                "client_id": self._client_id,
                "client_secret": self._client_secret,
                "grant_type": "client_credentials",
            },
            timeout=15.0,
        )
        resp.raise_for_status()
        token = resp.json()["access_token"]
        _token_cache.set(cache_key, token)
        return token

    def _headers(self) -> dict:
        return {
            "Client-ID": self._client_id,
            "Authorization": f"Bearer {self._get_token()}",
        }

    def _post(self, endpoint: str, body: str) -> list:
        resp = httpx.post(
            f"{IGDB_API_URL}/{endpoint}",
            headers=self._headers(),
            content=body,
            timeout=15.0,
        )
        resp.raise_for_status()
        return resp.json()

    def fetch_genres(self) -> list[dict]:
        cached = _genre_cache.get("genres")
        if cached:
            return cached
        data = self._post("genres", "fields id, name; limit 50;")
        _genre_cache.set("genres", data)
        return data

    def fetch_platforms(self) -> list[dict]:
        cached = _platform_cache.get("platforms")
        if cached:
            return cached
        data = self._post("platforms", "fields id, name; limit 200; sort name asc;")
        _platform_cache.set("platforms", data)
        return data

    def fetch_themes(self) -> list[dict]:
        cached = _theme_cache.get("themes")
        if cached:
            return cached
        data = self._post("themes", "fields id, name; limit 50;")
        _theme_cache.set("themes", data)
        return data

    def resolve_names_to_ids(self, names: list[str], options: list[dict]) -> list[int]:
        ids = []
        for name in names:
            name_lower = name.lower()
            for option in options:
                if name_lower in option["name"].lower() or option["name"].lower() in name_lower:
                    ids.append(option["id"])
                    break
        return ids

    def search_games(
        self,
        query: str = "",
        genre_ids: list[int] = [],
        theme_ids: list[int] = [],
        platform_ids: list[int] = [],
        year_min: int | None = None,
        year_max: int | None = None,
        limit: int = 10,
    ) -> list[dict]:
        conditions = ["version_parent = null"]

        if genre_ids:
            conditions.append(f"genres = ({' & '.join(str(i) for i in genre_ids)})")
        if theme_ids:
            conditions.append(f"themes = ({' & '.join(str(i) for i in theme_ids)})")
        if platform_ids:
            conditions.append(f"platforms = ({' | '.join(str(i) for i in platform_ids)})")
        if year_min:
            conditions.append(f"first_release_date >= {int(datetime.datetime(year_min, 1, 1).timestamp())}")
        if year_max:
            conditions.append(f"first_release_date <= {int(datetime.datetime(year_max, 12, 31, 23, 59, 59).timestamp())}")

        where_clause = " & ".join(conditions)

        if query:
            escaped = query.replace('"', '\\"')
            body = f'search "{escaped}"; {_GAME_FIELDS}; where {where_clause}; limit {limit};'
        else:
            body = f'{_GAME_FIELDS}; where {where_clause}; sort total_rating desc; limit {limit};'

        return self._post("games", body)

    def text_search(self, query: str, limit: int = 10) -> list[dict]:
        escaped = query.replace('"', '\\"')
        body = f'search "{escaped}"; {_GAME_FIELDS}; limit {limit};'
        return self._post("games", body)
