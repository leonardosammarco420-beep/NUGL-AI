from functools import lru_cache
from datetime import datetime, timedelta, timezone
import json
import logging

logger = logging.getLogger(__name__)

class CacheService:
    """In-memory caching service (in production, use Redis)"""
    
    def __init__(self):
        self._cache = {}
        self._ttl = {}
    
    def set(self, key: str, value: any, ttl_seconds: int = 300):
        """Set cache value with TTL"""
        try:
            self._cache[key] = json.dumps(value) if not isinstance(value, str) else value
            self._ttl[key] = datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds)
            logger.debug(f"Cached {key} for {ttl_seconds} seconds")
        except Exception as e:
            logger.error(f"Cache set error: {str(e)}")
    
    def get(self, key: str):
        """Get cache value if not expired"""
        try:
            if key not in self._cache:
                return None
            
            # Check if expired
            if datetime.now(timezone.utc) > self._ttl.get(key, datetime.now(timezone.utc)):
                del self._cache[key]
                del self._ttl[key]
                return None
            
            value = self._cache[key]
            try:
                return json.loads(value)
            except:
                return value
        except Exception as e:
            logger.error(f"Cache get error: {str(e)}")
            return None
    
    def delete(self, key: str):
        """Delete cache entry"""
        if key in self._cache:
            del self._cache[key]
            del self._ttl[key]
    
    def clear(self):
        """Clear all cache"""
        self._cache.clear()
        self._ttl.clear()
    
    def cleanup_expired(self):
        """Remove expired entries"""
        now = datetime.now(timezone.utc)
        expired_keys = [k for k, exp_time in self._ttl.items() if now > exp_time]
        for key in expired_keys:
            self.delete(key)
        if expired_keys:
            logger.info(f"Cleaned up {len(expired_keys)} expired cache entries")

# Global cache instance
cache_service = CacheService()