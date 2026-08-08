import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Order, OrderItem, ProductVariant, Customer, Sale, InventoryTransaction

sales_bp = Blueprint('admin_sales', __name__, url_prefix='/api/v1/admin/orders')

@sales_bp.route('', methods=['GET'])
@jwt_required()
def list_orders():
    status = request.args.get('status')
    query = Order.query

    if status:
        query = query.filter_by(status=status)

    orders = query.order_by(Order.created_at.desc()).all()
    return jsonify({
        'orders': [o.to_dict() for o in orders]
    }), 200

@sales_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    return jsonify({'order': order.to_dict()}), 200

@sales_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json() or {}

    customer_name = data.get('customer_name', 'Direct Customer')
    customer_contact = data.get('customer_contact', '')
    status = data.get('status', 'SOLD')  # SOLD or RESERVED
    items_data = data.get('items', [])
    notes = data.get('notes', '')

    if not items_data:
        return jsonify({'error': 'Order must contain at least one item'}), 400

    if status not in ['SOLD', 'RESERVED']:
        return jsonify({'error': 'Invalid status. Must be SOLD or RESERVED'}), 400

    # 1. Customer linkage
    customer = None
    if customer_name:
        customer = Customer.query.filter_by(name=customer_name).first()
        if not customer:
            customer = Customer(name=customer_name, phone=customer_contact, whatsapp_number=customer_contact)
            db.session.add(customer)
            db.session.flush()

    order_number = f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    total_amount = 0.0
    total_cost = 0.0

    order = Order(
        order_number=order_number,
        customer_id=customer.id if customer else None,
        customer_name=customer_name,
        customer_contact=customer_contact,
        status=status,
        notes=notes
    )
    db.session.add(order)
    db.session.flush()

    # 2. Process order items & stock logic
    for item_in in items_data:
        variant_id = item_in.get('variant_id')
        qty = int(item_in.get('quantity', 1))

        if not variant_id or qty <= 0:
            continue

        variant = ProductVariant.query.get(variant_id)
        if not variant:
            db.session.rollback()
            return jsonify({'error': f'Variant ID {variant_id} not found'}), 404

        unit_cost = float(item_in.get('unit_cost_price', variant.effective_cost_price))
        unit_selling = float(item_in.get('unit_selling_price', variant.effective_selling_price))
        subtotal = unit_selling * qty

        # Validate stock availability
        if status == 'SOLD':
            if variant.available_quantity < qty:
                db.session.rollback()
                return jsonify({
                    'error': f"Insufficient stock for {variant.product.name} ({variant.size.name} / {variant.colour.name}). Available: {variant.available_quantity}, requested: {qty}"
                }), 400
            
            old_qty = variant.quantity
            variant.quantity -= qty
            
            tx = InventoryTransaction(
                variant_id=variant.id,
                transaction_type='SALE',
                quantity_change=-qty,
                previous_quantity=old_qty,
                new_quantity=variant.quantity,
                reference_order_id=order.id,
                notes=f"Direct Sale #{order_number}"
            )
            db.session.add(tx)

        elif status == 'RESERVED':
            if variant.available_quantity < qty:
                db.session.rollback()
                return jsonify({
                    'error': f"Insufficient available stock to reserve {variant.product.name} ({variant.size.name} / {variant.colour.name}). Available: {variant.available_quantity}, requested: {qty}"
                }), 400
            
            old_qty = variant.quantity
            variant.reserved_quantity += qty

            tx = InventoryTransaction(
                variant_id=variant.id,
                transaction_type='RESERVATION_CREATED',
                quantity_change=0,
                previous_quantity=old_qty,
                new_quantity=old_qty,
                reference_order_id=order.id,
                notes=f"Reservation Created #{order_number} ({qty} units reserved)"
            )
            db.session.add(tx)

        order_item = OrderItem(
            order_id=order.id,
            variant_id=variant.id,
            quantity=qty,
            unit_cost_price=unit_cost,
            unit_selling_price=unit_selling,
            subtotal=subtotal
        )
        db.session.add(order_item)

        total_amount += subtotal
        total_cost += (unit_cost * qty)

    order.total_amount = total_amount
    order.total_cost = total_cost

    # 3. Create Sale record if status == SOLD
    if status == 'SOLD':
        net_profit = total_amount - total_cost
        sale = Sale(
            order_id=order.id,
            total_revenue=total_amount,
            total_cost=total_cost,
            net_profit=net_profit,
            notes=notes
        )
        db.session.add(sale)

    db.session.commit()
    return jsonify({
        'message': f"Order recorded successfully as {status}",
        'order': order.to_dict()
    }), 201

@sales_bp.route('/<int:order_id>/convert-to-sold', methods=['POST'])
@jwt_required()
def convert_reservation_to_sold(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    if order.status != 'RESERVED':
        return jsonify({'error': f"Only RESERVED orders can be converted. Current status is {order.status}"}), 400

    # Execute stock transfer from reserved -> sold
    for item in order.items:
        variant = item.variant
        if not variant:
            continue

        old_qty = variant.quantity
        variant.quantity -= item.quantity
        variant.reserved_quantity = max(0, variant.reserved_quantity - item.quantity)

        tx = InventoryTransaction(
            variant_id=variant.id,
            transaction_type='RESERVATION_CONVERTED',
            quantity_change=-item.quantity,
            previous_quantity=old_qty,
            new_quantity=variant.quantity,
            reference_order_id=order.id,
            notes=f"Converted Reservation #{order.order_number} to SOLD"
        )
        db.session.add(tx)

    order.status = 'SOLD'

    sale = Sale.query.filter_by(order_id=order.id).first()
    if not sale:
        sale = Sale(
            order_id=order.id,
            total_revenue=order.total_amount,
            total_cost=order.total_cost,
            net_profit=order.estimated_profit,
            notes=f"Converted from Reservation #{order.order_number}"
        )
        db.session.add(sale)

    db.session.commit()

    return jsonify({
        'message': f"Reservation #{order.order_number} converted to SOLD!",
        'order': order.to_dict()
    }), 200

@sales_bp.route('/<int:order_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    if order.status == 'CANCELLED':
        return jsonify({'error': 'Order is already cancelled'}), 400

    old_status = order.status

    for item in order.items:
        variant = item.variant
        if not variant:
            continue

        if old_status == 'RESERVED':
            variant.reserved_quantity = max(0, variant.reserved_quantity - item.quantity)
            tx = InventoryTransaction(
                variant_id=variant.id,
                transaction_type='RESERVATION_CANCELLED',
                quantity_change=0,
                previous_quantity=variant.quantity,
                new_quantity=variant.quantity,
                reference_order_id=order.id,
                notes=f"Cancelled Reservation #{order.order_number}"
            )
            db.session.add(tx)

        elif old_status == 'SOLD':
            # Restore sold stock back into quantity
            old_qty = variant.quantity
            variant.quantity += item.quantity
            tx = InventoryTransaction(
                variant_id=variant.id,
                transaction_type='MANUAL_ADJUSTMENT',
                quantity_change=item.quantity,
                previous_quantity=old_qty,
                new_quantity=variant.quantity,
                reference_order_id=order.id,
                notes=f"Restored stock from cancelled sale #{order.order_number}"
            )
            db.session.add(tx)

            # Delete attached financial Sale record
            if order.sale:
                db.session.delete(order.sale)

    order.status = 'CANCELLED'
    db.session.commit()

    return jsonify({
        'message': f"Order #{order.order_number} cancelled successfully",
        'order': order.to_dict()
    }), 200
