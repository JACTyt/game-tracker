from pydantic import BaseModel


class YearRange(BaseModel):
    min: int | None = None
    max: int | None = None


class UserFilters(BaseModel):
    genres: list[str] = []
    themes: list[str] = []
    platforms: list[str] = []
    year_min: int | None = None
    year_max: int | None = None


class SearchRequest(BaseModel):
    query: str = ""
    mode: str = "filter"
    filters: UserFilters = UserFilters()
    limit: int = 10


class ExtractedFilters(BaseModel):
    game_title: str | None = None
    genres: list[str] = []
    themes: list[str] = []
    platforms: list[str] = []
    keywords: list[str] = []
    year_range: YearRange | None = None
    player_perspective: list[str] = []
    game_modes: list[str] = []
    confidence: str = "medium"


class GameWebsite(BaseModel):
    url: str
    category: int


class GameAgeRating(BaseModel):
    category: int
    rating: int


class GameResult(BaseModel):
    igdb_id: int
    title: str
    cover_url: str | None = None
    year: int | None = None
    release_date: str | None = None
    genres: list[str] = []
    themes: list[str] = []
    platforms: list[str] = []
    summary: str | None = None
    storyline: str | None = None
    score: int | None = None
    matched_signals: list[str] = []
    match_reason: str | None = None
    developers: list[str] = []
    publishers: list[str] = []
    supporting_developers: list[str] = []
    game_modes: list[str] = []
    player_perspectives: list[str] = []
    series: list[str] = []
    franchises: list[str] = []
    game_engines: list[str] = []
    alternative_titles: list[str] = []
    keywords: list[str] = []
    user_rating: float | None = None
    user_rating_count: int | None = None
    critic_rating: float | None = None
    critic_rating_count: int | None = None
    websites: list[GameWebsite] = []
    supported_languages: list[str] = []
    updated_date: str | None = None
    age_ratings: list[GameAgeRating] = []
    trailer_id: str | None = None


class SearchResponse(BaseModel):
    results: list[GameResult]
    extracted_filters: ExtractedFilters | None = None
    mode: str


class FilterOption(BaseModel):
    id: int
    name: str


class FiltersResponse(BaseModel):
    genres: list[FilterOption]
    platforms: list[FilterOption]
    themes: list[FilterOption]
