import os
import cloudinary
import cloudinary.uploader
from flask import current_app

def init_cloudinary():
    cloud_name = current_app.config.get('CLOUDINARY_CLOUD_NAME')
    api_key = current_app.config.get('CLOUDINARY_API_KEY')
    api_secret = current_app.config.get('CLOUDINARY_API_SECRET')

    if cloud_name and api_key and api_secret:
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )

def upload_product_image(file_obj, folder="children_clothing_products"):
    """Uploads an image file to Cloudinary or returns fallback URL if credentials are not set."""
    cloud_name = current_app.config.get('CLOUDINARY_CLOUD_NAME')
    
    if not cloud_name:
        # Fallback placeholder when Cloudinary keys aren't configured yet
        return {
            'url': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80',
            'public_id': None
        }

    try:
        init_cloudinary()
        response = cloudinary.uploader.upload(
            file_obj,
            folder=folder,
            transformation=[
                {'width': 1000, 'height': 1000, 'crop': 'limit'},
                {'quality': 'auto', 'fetch_format': 'auto'}
            ]
        )
        return {
            'url': response.get('secure_url'),
            'public_id': response.get('public_id')
        }
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return {
            'url': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80',
            'public_id': None
        }
