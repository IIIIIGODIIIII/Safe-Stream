"""Rate limiting implementation for API endpoints."""
from functools import wraps
from collections import defaultdict
import time
from threading import Lock

class RateLimiter:
    """Thread-safe rate limiter using sliding window."""
    
    def __init__(self, limit: int, window: int = 60):
        """
        Initialize rate limiter.
        
        Args:
            limit: Maximum requests per window
            window: Time window in seconds
        """
        self.limit = limit
        self.window = window
        self.requests = defaultdict(list)
        self.lock = Lock()
        
    def is_allowed(self, client_id: str) -> bool:
        """
        Check if request is allowed for client.
        
        Args:
            client_id: Unique identifier for client
            
        Returns:
            bool: True if request is allowed
        """
        with self.lock:
            now = time.time()
            
            # Remove old requests
            self.requests[client_id] = [
                req_time for req_time in self.requests[client_id]
                if now - req_time < self.window
            ]
            
            # Check if limit is reached
            if len(self.requests[client_id]) >= self.limit:
                return False
                
            # Add new request
            self.requests[client_id].append(now)
            return True
            
    def limit(self, f):
        """Decorator to apply rate limiting to endpoint."""
        @wraps(f)
        def decorated(*args, **kwargs):
            client_id = request.headers.get('X-Client-ID', request.remote_addr)
            
            if not self.is_allowed(client_id):
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'retry_after': self.window
                }), 429
                
            return f(*args, **kwargs)
        return decorated