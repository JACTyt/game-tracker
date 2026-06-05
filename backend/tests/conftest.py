import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def mock_igdb():
    with patch("app.routes.filters.igdb_client") as mock:
        mock.fetch_genres.return_value = [{"id": 19, "name": "Horror"}, {"id": 12, "name": "RPG"}]
        mock.fetch_platforms.return_value = [{"id": 8, "name": "PlayStation 2"}, {"id": 6, "name": "PC"}]
        mock.fetch_themes.return_value = [{"id": 19, "name": "Horror"}, {"id": 17, "name": "Fantasy"}]
        yield mock
