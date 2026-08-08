from datetime import datetime, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from app.extensions import db
from app.models import Product, ProductVariant, Order, OrderItem, Sale, Category, InventoryTransaction

dashboard_bp = Blueprint('admin_dashboard', __name__, url_prefix='/api/v1/admin')

@dashboard_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    total_products = Product.query.count()
    variants = ProductVariant.query.all()

    total_units = sum(v.quantity for v in variants)
    reserved_units = sum(v.reserved_quantity for v in variants)
    available_units = sum(v.available_quantity for v in variants)

    # Low stock items (quantity <= threshold)
    low_stock_variants = [v.to_dict() for v in variants if v.quantity <= (v.product.low_stock_threshold if v.product else 2)]

    # Sales metrics
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    month_start = datetime(now.year, now.month, 1)

    today_sales_query = Sale.query.filter(Sale.sale_date >= today_start).all()
    today_sales_count = len(today_sales_query)
    today_revenue = sum(float(s.total_revenue) for s in today_sales_query)
    today_profit = sum(float(s.net_profit) for s in today_sales_query)

    month_sales_query = Sale.query.filter(Sale.sale_date >= month_start).all()
    month_revenue = sum(float(s.total_revenue) for s in month_sales_query)
    month_profit = sum(float(s.net_profit) for s in month_sales_query)

    all_sales = Sale.query.all()
    total_revenue = sum(float(s.total_revenue) for s in all_sales)
    total_profit = sum(float(s.net_profit) for s in all_sales)
    total_sold_units = db.session.query(func.sum(OrderItem.quantity)).join(Order).filter(Order.status == 'SOLD').scalar() or 0

    # Recent sales (last 10 confirmed orders)
    recent_sales = Order.query.filter_by(status='SOLD').order_by(Order.created_at.desc()).limit(10).all()

    # Best sellers (Grouped by product)
    best_sellers_raw = db.session.query(
        Product.id,
        Product.name,
        func.sum(OrderItem.quantity).label('units_sold'),
        func.sum(OrderItem.subtotal).label('revenue_generated')
    ).join(ProductVariant, Product.id == ProductVariant.product_id)\
     .join(OrderItem, ProductVariant.id == OrderItem.variant_id)\
     .join(Order, OrderItem.order_id == Order.id)\
     .filter(Order.status == 'SOLD')\
     .group_by(Product.id, Product.name)\
     .order_by(func.sum(OrderItem.quantity).desc())\
     .limit(5).all()

    best_sellers = [{
        'product_id': b[0],
        'product_name': b[1],
        'units_sold': int(b[2]),
        'revenue': float(b[3])
    } for b in best_sellers_raw]

    return jsonify({
        'summary': {
            'total_products': total_products,
            'total_units': total_units,
            'available_units': available_units,
            'reserved_units': reserved_units,
            'sold_units': int(total_sold_units),
            'low_stock_count': len(low_stock_variants),
            'today_sales_count': today_sales_count,
            'today_revenue': today_revenue,
            'today_profit': today_profit,
            'month_revenue': month_revenue,
            'month_profit': month_profit,
            'total_revenue': total_revenue,
            'total_profit': total_profit
        },
        'low_stock_items': low_stock_variants,
        'recent_sales': [s.to_dict() for s in recent_sales],
        'best_sellers': best_sellers
    }), 200

@dashboard_bp.route('/reports/financial', methods=['GET'])
@jwt_required()
def get_financial_report():
    variants = ProductVariant.query.all()
    inventory_cost_value = sum(v.quantity * v.effective_cost_price for v in variants)
    inventory_selling_value = sum(v.quantity * v.effective_selling_price for v in variants)
    potential_profit = inventory_selling_value - inventory_cost_value

    all_sales = Sale.query.all()
    total_realized_revenue = sum(float(s.total_revenue) for s in all_sales)
    total_realized_cost = sum(float(s.total_cost) for s in all_sales)
    total_realized_profit = sum(float(s.net_profit) for s in all_sales)

    # Category performance breakdown
    cat_perf = db.session.query(
        Category.name,
        func.sum(OrderItem.quantity).label('units_sold'),
        func.sum(OrderItem.subtotal).label('revenue')
    ).join(Product, Category.id == Product.category_id)\
     .join(ProductVariant, Product.id == ProductVariant.product_id)\
     .join(OrderItem, ProductVariant.id == OrderItem.variant_id)\
     .join(Order, OrderItem.order_id == Order.id)\
     .filter(Order.status == 'SOLD')\
     .group_by(Category.id, Category.name)\
     .all()

    category_reports = [{
        'category_name': c[0],
        'units_sold': int(c[1]),
        'revenue': float(c[2])
    } for c in cat_perf]

    return jsonify({
        'inventory_valuation': {
            'total_units_in_stock': sum(v.quantity for v in variants),
            'total_cost_value': inventory_cost_value,
            'total_selling_value': inventory_selling_value,
            'potential_profit': potential_profit
        },
        'realized_financials': {
            'total_revenue': total_realized_revenue,
            'total_cost': total_realized_cost,
            'total_net_profit': total_realized_profit
        },
        'category_performance': category_reports
    }), 200
