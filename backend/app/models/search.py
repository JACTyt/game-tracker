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
    genres: list[str] = []
    themes: list[str] = []
    platforms: list[str] = []
    keywords: list[str] = []
    year_range: YearRange | None = None
    player_perspective: list[str] = []
    game_modes: list[str] = []
    confidence: str = "medium"


class GameResult(BaseModel):
    igdb_id: int
    title: str
    cover_url: str | None = None
    year: int | None = None
    genres: list[str] = []
    platforms: list[str] = []
    summary: str | None = None
    score: int | None = None
    matched_signals: list[str] = []


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
