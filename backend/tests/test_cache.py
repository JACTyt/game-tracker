import time
from app.cache import TTLCache


def test_cache_stores_and_retrieves_value():
    cache = TTLCache(ttl_seconds=60)
    cache.set("key", {"data": 123})
    assert cache.get("key") == {"data": 123}


def test_cache_returns_none_for_missing_key():
    cache = TTLCache(ttl_seconds=60)
    assert cache.get("missing") is None


def test_cache_expires_after_ttl():
    cache = TTLCache(ttl_seconds=1)
    cache.set("key", "value")
    time.sleep(1.1)
    assert cache.get("key") is None
