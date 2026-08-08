from datetime import datetime
from app.extensions import db

class ProductVariant(db.Model):
    __tablename__ = 'product_variants'
    __table_args__ = (
        db.UniqueConstraint('product_id', 'size_id', 'colour_id', name='unique_product_size_colour'),
        db.CheckConstraint('quantity >= 0', name='check_quantity_non_negative'),
        db.CheckConstraint('reserved_quantity >= 0', name='check_reserved_non_negative'),
    )

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    size_id = db.Column(db.Integer, db.ForeignKey('sizes.id', ondelete='RESTRICT'), nullable=False)
    colour_id = db.Column(db.Integer, db.ForeignKey('colours.id', ondelete='RESTRICT'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    reserved_quantity = db.Column(db.Integer, nullable=False, default=0)
    sku = db.Column(db.String(50), unique=True, nullable=True)
    cost_price = db.Column(db.Numeric(10, 2), nullable=True)
    selling_price = db.Column(db.Numeric(10, 2), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    size = db.relationship('Size', lazy='joined')
    colour = db.relationship('Colour', lazy='joined')

    @property
    def available_quantity(self):
        return max(0, self.quantity - self.reserved_quantity)

    @property
    def effective_cost_price(self):
        return float(self.cost_price) if self.cost_price is not None else float(self.product.cost_price)

    @property
    def effective_selling_price(self):
        return float(self.selling_price) if self.selling_price is not None else float(self.product.selling_price)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'size_id': self.size_id,
            'size_name': self.size.name if self.size else None,
            'colour_id': self.colour_id,
            'colour_name': self.colour.name if self.colour else None,
            'colour_hex': self.colour.hex_code if self.colour else None,
            'quantity': self.quantity,
            'reserved_quantity': self.reserved_quantity,
            'available_quantity': self.available_quantity,
            'sku': self.sku,
            'cost_price': self.effective_cost_price,
            'selling_price': self.effective_selling_price,
            'is_out_of_stock': self.available_quantity <= 0,
            'is_low_stock': self.quantity <= self.product.low_stock_threshold if self.product else False
        }
