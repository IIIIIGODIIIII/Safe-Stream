"""Service for image processing and handling."""
import requests
from PIL import Image
import io
import base64
import re

class ImageService:
    """Handles image processing and conversion."""
    
    def __init__(self):
        """Initialize the image service."""
        self.session = requests.Session()
        
    def get_image(self, image_data: str) -> Image.Image:
        """
        Get PIL Image from URL or base64 data.
        
        Args:
            image_data: URL or base64 string of image
            
        Returns:
            PIL.Image: Processed image
        """
        try:
            if self._is_base64(image_data):
                return self._from_base64(image_data)
            elif self._is_url(image_data):
                return self._from_url(image_data)
            else:
                raise ValueError("Invalid image data format")
        except Exception as e:
            print(f"Error processing image: {e}")
            return None
            
    def _is_base64(self, data: str) -> bool:
        """Check if string is base64 encoded."""
        return bool(re.match(r'^data:image/.+;base64,', data))
        
    def _is_url(self, data: str) -> bool:
        """Check if string is a URL."""
        return bool(re.match(r'^https?://', data))
        
    def _from_base64(self, base64_string: str) -> Image.Image:
        """Convert base64 string to PIL Image."""
        try:
            # Remove header if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
                
            image_data = base64.b64decode(base64_string)
            return Image.open(io.BytesIO(image_data))
        except Exception as e:
            print(f"Error decoding base64 image: {e}")
            return None
            
    def _from_url(self, url: str) -> Image.Image:
        """Download image from URL and convert to PIL Image."""
        try:
            response = self.session.get(url, timeout=5)
            response.raise_for_status()
            return Image.open(io.BytesIO(response.content))
        except Exception as e:
            print(f"Error downloading image from URL: {e}")
            return None