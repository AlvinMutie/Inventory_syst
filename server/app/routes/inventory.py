import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import ProductVariant, InventoryTransaction, Category, Size, Colour

inventory_bp = Blueprint('admin_inventory', __name__, url_prefix='/api/v1/admin')

@inventory_bp.route('/inventory', methods=['GET'])
@jwt_required()
def get_inventory_summary():
    variants = ProductVariant.query.all()
    variant_list = [v.to_dict() for v in variants]

    total_units = sum(v.quantity for v in variants)
    reserved_units = sum(v.reserved_quantity for v in variants)
    available_units = sum(v.available_quantity for v in variants)
    low_stock = [v.to_dict() for v in variants if v.quantity <= (v.product.low_stock_threshold if v.product else 2)]
    out_of_stock = [v.to_dict() for v in variants if v.available_quantity <= 0]

    return jsonify({
        'variants': variant_list,
        'total_units': total_units,
        'reserved_units': reserved_units,
        'available_units': available_units,
        'low_stock_count': len(low_stock),
        'out_of_stock_count': len(out_of_stock),
        'low_stock_items': low_stock
    }), 200

@inventory_bp.route('/inventory/adjust', methods=['POST'])
@jwt_required()
def adjust_inventory():
    data = request.get_json() or {}

    variant_id = data.get('variant_id')
    quantity_change = data.get('quantity_change')  # Can be positive or negative
    reason = data.get('notes', 'Manual Stock Adjustment')

    if not variant_id or quantity_change is None:
        return jsonify({'error': 'variant_id and quantity_change are required'}), 400

    variant = ProductVariant.query.get(variant_id)
    if not variant:
        return jsonify({'error': 'Variant not found'}), 404

    old_qty = variant.quantity
    new_qty = old_qty + int(quantity_change)

    if new_qty < 0:
        return jsonify({'error': f'Stock cannot drop below zero. Current quantity is {old_qty}.'}), 400

    variant.quantity = new_qty

    tx = InventoryTransaction(
        variant_id=variant.id,
        transaction_type='MANUAL_ADJUSTMENT',
        quantity_change=int(quantity_change),
        previous_quantity=old_qty,
        new_quantity=new_qty,
        notes=reason
    )
    db.session.add(tx)
    db.session.commit()

    return jsonify({
        'message': 'Stock adjusted successfully',
        'variant': variant.to_dict(),
        'transaction': tx.to_dict()
    }), 200

@inventory_bp.route('/inventory/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    txs = InventoryTransaction.query.order_by(InventoryTransaction.created_at.desc()).limit(100).all()
    return jsonify({'transactions': [t.to_dict() for t in txs]}), 200

# Category Management
@inventory_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Category name required'}), 400

    slug = re.sub(r'[\s_-]+', '-', re.sub(r'[^\w\s-]', '', name.lower().strip()))
    cat = Category(name=name, slug=slug, description=data.get('description', ''))
    db.session.add(cat)
    db.session.commit()

    return jsonify({'category': cat.to_dict()}), 201

# Size & Colour Attributes Management
@inventory_bp.route('/attributes', methods=['GET'])
@jwt_required()
def get_attributes():
    sizes = Size.query.order_by(Size.display_order.asc()).all()
    colours = Colour.query.order_by(Colour.name.asc()).all()
    categories = Category.query.order_by(Category.name.asc()).all()
    return jsonify({
        'sizes': [s.to_dict() for s in sizes],
        'colours': [c.to_dict() for c in colours],
        'categories': [cat.to_dict() for cat in categories]
    }), 200

@inventory_bp.route('/attributes/size', methods=['POST'])
@jwt_required()
def create_size():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Size name required'}), 400

    if Size.query.filter_by(name=name).first():
        return jsonify({'error': 'Size already exists'}), 400

    max_order = db.session.query(db.func.max(Size.display_order)).scalar() or 0
    size = Size(name=name, display_order=max_order + 1)
    db.session.add(size)
    db.session.commit()

    return jsonify({'size': size.to_dict()}), 201

@inventory_bp.route('/attributes/colour', methods=['POST'])
@jwt_required()
def create_colour():
    data = request.get_json() or {}
    name = data.get('name')
    hex_code = data.get('hex_code', '#000000')
    if not name:
        return jsonify({'error': 'Colour name required'}), 400

    if Colour.query.filter_by(name=name).first():
        return jsonify({'error': 'Colour already exists'}), 400

    colour = Colour(name=name, hex_code=hex_code)
    db.session.add(colour)
    db.session.commit()

    return jsonify({'colour': colour.to_dict()}), 201
