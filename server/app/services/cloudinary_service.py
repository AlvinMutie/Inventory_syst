import os
import uuid
from datetime import datetime
import cloudinary
import cloudinary.uploader
from flask import current_app
from PIL import Image

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
    """
    Uploads an image file to Cloudinary if configured.
    Otherwise, resizes and saves the file locally in static uploads for instant local & zero-cost delivery.
    """
    cloud_name = current_app.config.get('CLOUDINARY_CLOUD_NAME')
    
    if cloud_name:
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
            print(f"Cloudinary upload error, falling back to local static storage: {e}")

    # Local file upload handler fallback
    try:
        filename = f"upload_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}.jpg"
        
        target_dir1 = os.path.join(current_app.root_path, '..', '..', 'client', 'public', 'uploads')
        target_dir2 = os.path.join(current_app.root_path, 'static', 'uploads')
        os.makedirs(target_dir1, exist_ok=True)
        os.makedirs(target_dir2, exist_ok=True)

        path1 = os.path.join(target_dir1, filename)
        path2 = os.path.join(target_dir2, filename)

        with Image.open(file_obj) as img:
            img.thumbnail((1000, 1000), Image.Resampling.LANCZOS)
            img.convert('RGB').save(path1, 'JPEG', quality=85)
            img.convert('RGB').save(path2, 'JPEG', quality=85)

        return {
            'url': f'/uploads/{filename}',
            'public_id': None
        }
    except Exception as err:
        print(f"Local upload save error: {err}")
        return {
            'url': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80',
            'public_id': None
        }
