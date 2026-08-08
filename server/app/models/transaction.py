from datetime import datetime
from app.extensions import db

class InventoryTransaction(db.Model):
    __tablename__ = 'inventory_transactions'

    id = db.Column(db.Integer, primary_key=True)
    variant_id = db.Column(db.Integer, db.ForeignKey('product_variants.id', ondelete='CASCADE'), nullable=False)
    transaction_type = db.Column(db.String(30), nullable=False) # STOCK_IN, SALE, RESERVATION_CREATED, RESERVATION_CANCELLED, RESERVATION_CONVERTED, MANUAL_ADJUSTMENT
    quantity_change = db.Column(db.Integer, nullable=False)
    previous_quantity = db.Column(db.Integer, nullable=False)
    new_quantity = db.Column(db.Integer, nullable=False)
    reference_order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='SET NULL'), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    variant = db.relationship('ProductVariant', lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'variant_id': self.variant_id,
            'product_name': self.variant.product.name if (self.variant and self.variant.product) else 'N/A',
            'size_name': self.variant.size.name if (self.variant and self.variant.size) else 'N/A',
            'colour_name': self.variant.colour.name if (self.variant and self.variant.colour) else 'N/A',
            'transaction_type': self.transaction_type,
            'quantity_change': self.quantity_change,
            'previous_quantity': self.previous_quantity,
            'new_quantity': self.new_quantity,
            'reference_order_id': self.reference_order_id,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
