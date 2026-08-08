from datetime import datetime
from app.extensions import db

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(30), unique=True, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id', ondelete='SET NULL'), nullable=True)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_contact = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='RESERVED')  # RESERVED, SOLD, CANCELLED
    total_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    total_cost = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = db.relationship('OrderItem', backref='order', cascade='all, delete-orphan', lazy=True)
    sale = db.relationship('Sale', backref='order', uselist=False, lazy=True)

    @property
    def estimated_profit(self):
        return float(self.total_amount) - float(self.total_cost)

    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'customer_id': self.customer_id,
            'customer_name': self.customer_name,
            'customer_contact': self.customer_contact,
            'status': self.status,
            'total_amount': float(self.total_amount),
            'total_cost': float(self.total_cost),
            'estimated_profit': self.estimated_profit,
            'notes': self.notes,
            'items': [item.to_dict() for item in self.items],
            'sale': self.sale.to_dict() if self.sale else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False)
    variant_id = db.Column(db.Integer, db.ForeignKey('product_variants.id', ondelete='RESTRICT'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_cost_price = db.Column(db.Numeric(10, 2), nullable=False)
    unit_selling_price = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)

    variant = db.relationship('ProductVariant', lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'variant_id': self.variant_id,
            'product_id': self.variant.product_id if self.variant else None,
            'product_name': self.variant.product.name if (self.variant and self.variant.product) else 'Deleted Product',
            'size_name': self.variant.size.name if (self.variant and self.variant.size) else 'N/A',
            'colour_name': self.variant.colour.name if (self.variant and self.variant.colour) else 'N/A',
            'quantity': self.quantity,
            'unit_cost_price': float(self.unit_cost_price),
            'unit_selling_price': float(self.unit_selling_price),
            'subtotal': float(self.subtotal)
        }
