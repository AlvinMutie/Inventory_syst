from datetime import datetime
from app.extensions import db

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    slug = db.Column(db.String(170), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True)
    cost_price = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    selling_price = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    low_stock_threshold = db.Column(db.Integer, nullable=False, default=2)
    is_published = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    images = db.relationship('ProductImage', backref='product', cascade='all, delete-orphan', lazy=True)
    variants = db.relationship('ProductVariant', backref='product', cascade='all, delete-orphan', lazy=True)

    @property
    def total_quantity(self):
        return sum(v.quantity for v in self.variants)

    @property
    def total_reserved(self):
        return sum(v.reserved_quantity for v in self.variants)

    @property
    def available_quantity(self):
        return sum(v.available_quantity for v in self.variants)

    @property
    def potential_revenue(self):
        return sum(v.quantity * float(v.selling_price or self.selling_price) for v in self.variants)

    @property
    def potential_cost(self):
        return sum(v.quantity * float(v.cost_price or self.cost_price) for v in self.variants)

    @property
    def potential_profit(self):
        return self.potential_revenue - self.potential_cost

    def to_dict(self, include_variants=True):
        primary_img = next((img.to_dict() for img in self.images if img.is_primary), None)
        if not primary_img and self.images:
            primary_img = self.images[0].to_dict()

        data = {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else 'Uncategorized',
            'cost_price': float(self.cost_price),
            'selling_price': float(self.selling_price),
            'low_stock_threshold': self.low_stock_threshold,
            'is_published': self.is_published,
            'is_featured': self.is_featured,
            'primary_image': primary_img['image_url'] if primary_img else None,
            'images': [img.to_dict() for img in self.images],
            'total_quantity': self.total_quantity,
            'total_reserved': self.total_reserved,
            'available_quantity': self.available_quantity,
            'potential_revenue': self.potential_revenue,
            'potential_cost': self.potential_cost,
            'potential_profit': self.potential_profit,
            'is_low_stock': any(v.quantity <= self.low_stock_threshold for v in self.variants),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

        if include_variants:
            data['variants'] = [v.to_dict() for v in self.variants]

        return data

class ProductImage(db.Model):
    __tablename__ = 'product_images'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    public_id = db.Column(db.String(100), nullable=True)
    is_primary = db.Column(db.Boolean, default=False)
    display_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'image_url': self.image_url,
            'public_id': self.public_id,
            'is_primary': self.is_primary,
            'display_order': self.display_order
        }
