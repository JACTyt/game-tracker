import respx
import httpx
from app.services.igdb import IGDBClient


@respx.mock
def test_get_token_returns_access_token():
    client = IGDBClient(client_id="test_id", client_secret="test_secret")
    respx.post("https://id.twitch.tv/oauth2/token").mock(
        return_value=httpx.Response(200, json={"access_token": "abc123", "expires_in": 5000000})
    )
    token = client._get_token()
    assert token == "abc123"


@respx.mock
def test_fetch_genres_returns_list():
    client = IGDBClient(client_id="test_id", client_secret="test_secret")
    respx.post("https://id.twitch.tv/oauth2/token").mock(
        return_value=httpx.Response(200, json={"access_token": "abc123", "expires_in": 5000000})
    )
    respx.post("https://api.igdb.com/v4/genres").mock(
        return_value=httpx.Response(200, json=[{"id": 19, "name": "Horror"}, {"id": 12, "name": "RPG"}])
    )
    genres = client.fetch_genres()
    assert len(genres) == 2
    assert genres[0]["id"] == 19
    assert genres[0]["name"] == "Horror"


@respx.mock
def test_search_games_by_filters_returns_games():
    client = IGDBClient(client_id="test_id", client_secret="test_secret")
    respx.post("https://id.twitch.tv/oauth2/token").mock(
        return_value=httpx.Response(200, json={"access_token": "abc123", "expires_in": 5000000})
    )
    respx.post("https://api.igdb.com/v4/games").mock(
        return_value=httpx.Response(200, json=[{
            "id": 1234,
            "name": "Silent Hill 2",
            "summary": "A horror game...",
            "first_release_date": 1000684800,
            "total_rating": 91.0,
            "genres": [{"id": 31, "name": "Adventure"}],
            "platforms": [{"id": 8, "name": "PlayStation 2"}],
            "cover": {"url": "//images.igdb.com/igdb/image/upload/t_thumb/abc.jpg"},
        }])
    )
    games = client.search_games(genre_ids=[31], platform_ids=[8], limit=10)
    assert len(games) == 1
    assert games[0]["name"] == "Silent Hill 2"
