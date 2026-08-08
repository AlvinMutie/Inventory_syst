from datetime import datetime
from app.extensions import db

class Sale(db.Model):
    __tablename__ = 'sales'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='RESTRICT'), unique=True, nullable=False)
    sale_date = db.Column(db.DateTime, default=datetime.utcnow)
    total_revenue = db.Column(db.Numeric(10, 2), nullable=False)
    total_cost = db.Column(db.Numeric(10, 2), nullable=False)
    net_profit = db.Column(db.Numeric(10, 2), nullable=False)
    payment_type = db.Column(db.String(50), default='External (Direct / Cash / M-Pesa)')
    notes = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'sale_date': self.sale_date.isoformat() if self.sale_date else None,
            'total_revenue': float(self.total_revenue),
            'total_cost': float(self.total_cost),
            'net_profit': float(self.net_profit),
            'payment_type': self.payment_type,
            'notes': self.notes
        }
