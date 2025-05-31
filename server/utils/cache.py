"""Cache implementation for storing analysis results."""
from collections import OrderedDict
import time
from threading import Lock

class Cache:
    """Thread-safe LRU cache with timeout."""
    
    def __init__(self, max_size: int, timeout: int):
        """
        Initialize cache.
        
        Args:
            max_size: Maximum number of items to store
            timeout: Time in seconds before items expire
        """
        self.max_size = max_size
        self.timeout = timeout
        self.cache = OrderedDict()
        self.lock = Lock()
        
    def get(self, key: str) -> dict:
        """
        Get item from cache if it exists and hasn't expired.
        
        Args:
            key: Cache key
            
        Returns:
            dict: Cached item or None if not found/expired
        """
        with self.lock:
            if key not in self.cache:
                return None
                
            item, timestamp = self.cache[key]
            if time.time() - timestamp > self.timeout:
                del self.cache[key]
                return None
                
            # Move to end (most recently used)
            self.cache.move_to_end(key)
            return item
            
    def set(self, key: str, value: dict):
        """
        Add item to cache.
        
        Args:
            key: Cache key
            value: Item to cache
        """
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                
            self.cache[key] = (value, time.time())
            
            # Remove oldest if cache is full
            if len(self.cache) > self.max_size:
                self.cache.popitem(last=False)