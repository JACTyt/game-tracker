import pytest
from unittest.mock import MagicMock
from app.services.search import SearchService
from app.models.search import SearchRequest, UserFilters


@pytest.fixture
def igdb_mock():
    mock = MagicMock()
    mock.fetch_genres.return_value = [{"id": 19, "name": "Horror"}, {"id": 31, "name": "Adventure"}]
    mock.fetch_platforms.return_value = [{"id": 8, "name": "PlayStation 2"}, {"id": 6, "name": "PC"}]
    mock.fetch_themes.return_value = [{"id": 19, "name": "Horror"}, {"id": 17, "name": "Fantasy"}]
    mock.resolve_names_to_ids.return_value = [8]
    mock.search_games.return_value = [{
        "id": 1234,
        "name": "Silent Hill 2",
        "summary": "A horror game...",
        "first_release_date": 1000684800,
        "total_rating": 91.0,
        "genres": [{"name": "Adventure"}],
        "platforms": [{"name": "PlayStation 2"}],
        "cover": {"url": "//images.igdb.com/igdb/image/upload/t_thumb/abc.jpg"},
    }]
    return mock


def test_filter_search_returns_game_results(igdb_mock):
    service = SearchService(igdb_client=igdb_mock)
    request = SearchRequest(
        mode="filter",
        filters=UserFilters(platforms=["PlayStation 2"]),
        limit=10
    )
    response = service.search(request)
    assert len(response.results) == 1
    assert response.results[0].title == "Silent Hill 2"
    assert response.results[0].igdb_id == 1234
    assert response.mode == "filter"


def test_filter_search_maps_cover_url(igdb_mock):
    service = SearchService(igdb_client=igdb_mock)
    request = SearchRequest(mode="filter", limit=10)
    response = service.search(request)
    assert response.results[0].cover_url.startswith("https://")


def test_semantic_search_calls_openai_and_igdb(igdb_mock):
    from unittest.mock import MagicMock
    from app.models.search import ExtractedFilters
    from app.services.openai_service import OpenAIService

    openai_mock = MagicMock(spec=OpenAIService)
    openai_mock.extract_filters.return_value = ExtractedFilters(
        genres=["horror"],
        themes=["atmospheric"],
        platforms=["PS2"],
        keywords=["fog", "town"],
        confidence="high",
    )
    openai_mock.score_results.return_value = [
        {"igdb_id": 1234, "score": 91, "matched_signals": ["horror genre", "foggy town"]}
    ]
    igdb_mock.search_games.return_value = [{
        "id": 1234,
        "name": "Silent Hill 2",
        "summary": "A horror game in a foggy town.",
        "first_release_date": 1000684800,
        "total_rating": 91.0,
        "genres": [{"name": "Adventure"}],
        "platforms": [{"name": "PlayStation 2"}],
        "cover": {"url": "//images.igdb.com/igdb/image/upload/t_thumb/abc.jpg"},
    }]

    service = SearchService(igdb_client=igdb_mock, openai_service=openai_mock)
    request = SearchRequest(
        query="horror game with foggy town on PS2",
        mode="semantic",
        limit=10,
    )
    response = service.search(request)

    assert response.mode == "semantic"
    assert len(response.results) == 1
    assert response.results[0].score == 91
    assert response.results[0].matched_signals == ["horror genre", "foggy town"]
    assert response.results[0].match_reason is None
    assert response.extracted_filters.genres == ["horror"]


def test_semantic_search_maps_match_reason(igdb_mock):
    from app.models.search import ExtractedFilters
    from app.services.openai_service import OpenAIService

    openai_mock = MagicMock(spec=OpenAIService)
    openai_mock.extract_filters.return_value = ExtractedFilters(confidence="high")
    openai_mock.score_results.return_value = [
        {
            "igdb_id": 1234,
            "score": 88,
            "matched_signals": ["foggy town"],
            "reason": "A psychological horror set in a fog-shrouded town, matching the description.",
        }
    ]
    igdb_mock.search_games.return_value = [{
        "id": 1234,
        "name": "Silent Hill 2",
        "summary": "A horror game in a foggy town.",
        "first_release_date": 1000684800,
        "total_rating": 88.0,
        "genres": [{"name": "Adventure"}],
        "platforms": [{"name": "PlayStation 2"}],
        "cover": {"url": "//images.igdb.com/igdb/image/upload/t_thumb/abc.jpg"},
    }]

    service = SearchService(igdb_client=igdb_mock, openai_service=openai_mock)
    request = SearchRequest(query="foggy horror town", mode="semantic", limit=10)
    response = service.search(request)

    assert response.results[0].match_reason.startswith("A psychological horror")


def test_semantic_search_relevance_beats_critic_rating(igdb_mock):
    """A highly critic-rated but irrelevant game must not outrank a real match.

    Regression for the bug where unscored candidates fell back to their critic
    rating, letting 100%-rated noise bury the actual answer.
    """
    from app.models.search import ExtractedFilters
    from app.services.openai_service import OpenAIService

    openai_mock = MagicMock(spec=OpenAIService)
    openai_mock.extract_filters.return_value = ExtractedFilters(
        game_title="Overwatch", confidence="high"
    )
    # No filters resolved -> no rating-sorted noise pool is fetched.
    igdb_mock.resolve_names_to_ids.return_value = []
    igdb_mock.text_search.return_value = []
    igdb_mock.search_games.return_value = [
        {  # the real match, modestly rated
            "id": 1, "name": "Overwatch", "summary": "Hero shooter with Tracer.",
            "first_release_date": 1462838400, "total_rating": 82.0,
            "genres": [{"name": "Shooter"}], "platforms": [{"name": "PC"}],
            "cover": {"url": "//img/t_thumb/a.jpg"},
        },
        {  # irrelevant but perfectly rated -> GPT does NOT score it
            "id": 2, "name": "Some Masterpiece", "summary": "Unrelated.",
            "first_release_date": 1000684800, "total_rating": 100.0,
            "genres": [{"name": "Adventure"}], "platforms": [{"name": "PC"}],
            "cover": {"url": "//img/t_thumb/b.jpg"},
        },
    ]
    openai_mock.score_results.return_value = [
        {"igdb_id": 1, "score": 96, "matched_signals": ["Tracer"], "reason": "It's Overwatch."},
    ]

    service = SearchService(igdb_client=igdb_mock, openai_service=openai_mock)
    response = service.search(SearchRequest(query="tracer from overwatch", mode="semantic", limit=10))

    assert response.results[0].title == "Overwatch"
    assert response.results[0].score == 96
    # The unscored 100-critic game ranks last and does NOT borrow its rating.
    assert response.results[-1].title == "Some Masterpiece"
    assert response.results[-1].score is None
