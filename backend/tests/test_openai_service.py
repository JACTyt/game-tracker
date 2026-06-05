from unittest.mock import MagicMock, patch
from app.services.openai_service import OpenAIService
from app.models.search import ExtractedFilters


def test_extract_filters_returns_extracted_filters():
    service = OpenAIService(api_key="test-key")
    mock_parsed = ExtractedFilters(
        genres=["horror"],
        platforms=["PS2"],
        keywords=["fog", "town"],
        confidence="high"
    )
    with patch.object(service._client.beta.chat.completions, "parse") as mock_parse:
        mock_response = MagicMock()
        mock_response.choices[0].message.parsed = mock_parsed
        mock_parse.return_value = mock_response

        result = service.extract_filters("horror game with foggy town on PS2")

    assert result.genres == ["horror"]
    assert result.platforms == ["PS2"]
    assert result.keywords == ["fog", "town"]


def test_score_results_returns_scored_list():
    service = OpenAIService(api_key="test-key")
    games = [
        {"igdb_id": 1, "title": "Silent Hill 2", "summary": "Horror in foggy town", "genres": ["Horror"]},
        {"igdb_id": 2, "title": "Resident Evil 4", "summary": "Action horror", "genres": ["Horror"]},
    ]
    with patch.object(service._client.chat.completions, "create") as mock_create:
        mock_response = MagicMock()
        mock_response.choices[0].message.content = '{"results": [{"igdb_id": 1, "score": 91, "matched_signals": ["foggy town", "horror"]}, {"igdb_id": 2, "score": 55, "matched_signals": ["horror"]}]}'
        mock_create.return_value = mock_response

        result = service.score_results("horror game foggy town PS2", games)

    assert len(result) == 2
    assert result[0]["igdb_id"] == 1
    assert result[0]["score"] == 91
    assert "foggy town" in result[0]["matched_signals"]
