import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Product, ProductImage, ProductVariant, Category, Size, Colour, InventoryTransaction
from app.services.cloudinary_service import upload_product_image

products_bp = Blueprint('admin_products', __name__, url_prefix='/api/v1/admin/products')

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[\s_-]+', '-', text)

@products_bp.route('', methods=['GET'])
@jwt_required()
def list_products():
    products = Product.query.order_by(Product.created_at.desc()).all()
    return jsonify({
        'products': [p.to_dict(include_variants=True) for p in products]
    }), 200

@products_bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'product': product.to_dict(include_variants=True)}), 200

@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    data = request.get_json() or {}

    name = data.get('name')
    category_id = data.get('category_id')
    cost_price = data.get('cost_price', 0.0)
    selling_price = data.get('selling_price', 0.0)

    if not name:
        return jsonify({'error': 'Product name is required'}), 400

    # Generate unique slug
    base_slug = slugify(name)
    slug = base_slug
    counter = 1
    while Product.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    product = Product(
        name=name,
        slug=slug,
        description=data.get('description', ''),
        category_id=category_id,
        cost_price=cost_price,
        selling_price=selling_price,
        low_stock_threshold=data.get('low_stock_threshold', 2),
        is_published=data.get('is_published', True),
        is_featured=data.get('is_featured', False)
    )
    db.session.add(product)
    db.session.flush()

    # Images
    images = data.get('images', [])
    for idx, img in enumerate(images):
        p_img = ProductImage(
            product_id=product.id,
            image_url=img.get('url'),
            public_id=img.get('public_id'),
            is_primary=(idx == 0 or img.get('is_primary', False)),
            display_order=idx + 1
        )
        db.session.add(p_img)

    # Matrix Variants
    variants_data = data.get('variants', [])
    for v in variants_data:
        size_id = v.get('size_id')
        colour_id = v.get('colour_id')
        qty = max(0, int(v.get('quantity', 0)))

        if not size_id or not colour_id:
            continue

        size = Size.query.get(size_id)
        colour = Colour.query.get(colour_id)
        if not size or not colour:
            continue

        clean_slug = product.slug.replace('-', '').upper()[:8]
        sku = f"{clean_slug}-{colour.name[:3].upper()}-{size.name}"
        
        variant = ProductVariant(
            product_id=product.id,
            size_id=size_id,
            colour_id=colour_id,
            quantity=qty,
            cost_price=v.get('cost_price'),
            selling_price=v.get('selling_price'),
            sku=sku
        )
        db.session.add(variant)
        db.session.flush()

        if qty > 0:
            tx = InventoryTransaction(
                variant_id=variant.id,
                transaction_type='STOCK_IN',
                quantity_change=qty,
                previous_quantity=0,
                new_quantity=qty,
                notes='Initial stock on product creation'
            )
            db.session.add(tx)

    db.session.commit()
    return jsonify({
        'message': 'Product created successfully',
        'product': product.to_dict(include_variants=True)
    }), 201

@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    data = request.get_json() or {}

    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'category_id' in data:
        product.category_id = data['category_id']
    if 'cost_price' in data:
        product.cost_price = data['cost_price']
    if 'selling_price' in data:
        product.selling_price = data['selling_price']
    if 'low_stock_threshold' in data:
        product.low_stock_threshold = data['low_stock_threshold']
    if 'is_published' in data:
        product.is_published = data['is_published']
    if 'is_featured' in data:
        product.is_featured = data['is_featured']

    # Update images if provided
    if 'images' in data:
        ProductImage.query.filter_by(product_id=product.id).delete()
        for idx, img in enumerate(data['images']):
            p_img = ProductImage(
                product_id=product.id,
                image_url=img.get('url'),
                public_id=img.get('public_id'),
                is_primary=(idx == 0 or img.get('is_primary', False)),
                display_order=idx + 1
            )
            db.session.add(p_img)

    # Update variants if provided
    if 'variants' in data:
        existing_variants = { (v.size_id, v.colour_id): v for v in product.variants }
        for v in data['variants']:
            size_id = v.get('size_id')
            colour_id = v.get('colour_id')
            new_qty = max(0, int(v.get('quantity', 0)))

            if (size_id, colour_id) in existing_variants:
                variant = existing_variants[(size_id, colour_id)]
                old_qty = variant.quantity
                if new_qty != old_qty:
                    diff = new_qty - old_qty
                    variant.quantity = new_qty
                    tx = InventoryTransaction(
                        variant_id=variant.id,
                        transaction_type='MANUAL_ADJUSTMENT',
                        quantity_change=diff,
                        previous_quantity=old_qty,
                        new_quantity=new_qty,
                        notes='Stock updated during product edit'
                    )
                    db.session.add(tx)
                if 'cost_price' in v:
                    variant.cost_price = v['cost_price']
                if 'selling_price' in v:
                    variant.selling_price = v['selling_price']
            else:
                # Add new variant
                size = Size.query.get(size_id)
                colour = Colour.query.get(colour_id)
                if size and colour:
                    sku = f"{product.slug[:6].upper()}-{colour.name[:3].upper()}-{size.name}"
                    variant = ProductVariant(
                        product_id=product.id,
                        size_id=size_id,
                        colour_id=colour_id,
                        quantity=new_qty,
                        cost_price=v.get('cost_price'),
                        selling_price=v.get('selling_price'),
                        sku=sku
                    )
                    db.session.add(variant)
                    db.session.flush()
                    if new_qty > 0:
                        tx = InventoryTransaction(
                            variant_id=variant.id,
                            transaction_type='STOCK_IN',
                            quantity_change=new_qty,
                            previous_quantity=0,
                            new_quantity=new_qty,
                            notes='Added variant during product edit'
                        )
                        db.session.add(tx)

    db.session.commit()
    return jsonify({
        'message': 'Product updated successfully',
        'product': product.to_dict(include_variants=True)
    }), 200

@products_bp.route('/<int:product_id>/visibility', methods=['PATCH'])
@jwt_required()
def toggle_visibility(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    data = request.get_json() or {}
    product.is_published = data.get('is_published', not product.is_published)
    db.session.commit()

    return jsonify({
        'message': f"Product {'published' if product.is_published else 'hidden'}",
        'is_published': product.is_published
    }), 200

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted successfully'}), 200

@products_bp.route('/upload-image', methods=['POST'])
@jwt_required()
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    res = upload_product_image(file)
    return jsonify(res), 200
