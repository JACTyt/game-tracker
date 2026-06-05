from unittest.mock import patch


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_get_filters_returns_genres_platforms_themes(client, mock_igdb):
    resp = client.get("/filters")
    assert resp.status_code == 200
    data = resp.json()
    assert "genres" in data
    assert "platforms" in data
    assert "themes" in data
    assert data["genres"][0]["name"] == "Horror"
    assert data["platforms"][0]["name"] == "PlayStation 2"


def test_post_search_filter_mode(client):
    with patch("app.routes.search.search_service") as mock_svc:
        from app.models.search import SearchResponse, GameResult
        mock_svc.search.return_value = SearchResponse(
            results=[GameResult(igdb_id=1, title="Silent Hill 2", genres=[], platforms=[])],
            mode="filter"
        )
        resp = client.post("/search", json={"mode": "filter", "filters": {"platforms": ["PS2"]}})
        assert resp.status_code == 200
        data = resp.json()
        assert data["mode"] == "filter"
        assert data["results"][0]["title"] == "Silent Hill 2"
