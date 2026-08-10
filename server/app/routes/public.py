from flask import Blueprint, request, jsonify, current_app
from app.models import Product, Category, Size, Colour, StoreSetting

public_bp = Blueprint('public', __name__, url_prefix='/api/v1/public')

@public_bp.route('/store-info', methods=['GET'])
def get_store_info():
    name_setting = StoreSetting.query.filter_by(key='business_name').first()
    phone_setting = StoreSetting.query.filter_by(key='whatsapp_phone').first()
    currency_setting = StoreSetting.query.filter_by(key='currency').first()

    business_name = name_setting.value if name_setting and name_setting.value else "TinyTrends Kids Wear"
    whatsapp_phone = phone_setting.value if phone_setting and phone_setting.value else current_app.config.get('WHATSAPP_PHONE', '254700000000')
    currency = currency_setting.value if currency_setting and currency_setting.value else current_app.config.get('CURRENCY', 'KSh')

    return jsonify({
        'business_name': business_name,
        'currency': currency,
        'whatsapp_phone': whatsapp_phone
    }), 200

@public_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.order_by(Category.name.asc()).all()
    return jsonify({'categories': [c.to_dict() for c in categories]}), 200

@public_bp.route('/products', methods=['GET'])
def get_public_products():
    category_slug = request.args.get('category')
    search_query = request.args.get('search')
    size_name = request.args.get('size')
    featured_only = request.args.get('featured') == 'true'

    query = Product.query.filter_by(is_published=True)

    if category_slug:
        query = query.join(Category).filter(Category.slug == category_slug)

    if search_query:
        query = query.filter(Product.name.ilike(f"%{search_query}%"))

    if featured_only:
        query = query.filter_by(is_featured=True)

    products = query.order_by(Product.created_at.desc()).all()

    result = []
    for p in products:
        p_dict = p.to_dict(include_variants=True)
        if size_name:
            matching = [v for v in p_dict['variants'] if v['size_name'] == size_name and v['available_quantity'] > 0]
            if not matching:
                continue
        result.append(p_dict)

    return jsonify({
        'products': result,
        'count': len(result)
    }), 200

@public_bp.route('/products/<slug>', methods=['GET'])
def get_product_by_slug(slug):
    product = Product.query.filter_by(slug=slug, is_published=True).first()
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    return jsonify({'product': product.to_dict(include_variants=True)}), 200

@public_bp.route('/attributes', methods=['GET'])
def get_public_attributes():
    sizes = Size.query.order_by(Size.display_order.asc()).all()
    colours = Colour.query.order_by(Colour.name.asc()).all()
    return jsonify({
        'sizes': [s.to_dict() for s in sizes],
        'colours': [c.to_dict() for c in colours]
    }), 200
