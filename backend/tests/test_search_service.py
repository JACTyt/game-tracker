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
    assert response.extracted_filters.genres == ["horror"]
