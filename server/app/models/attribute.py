from app.extensions import db

class Size(db.Model):
    __tablename__ = 'sizes'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), unique=True, nullable=False)
    display_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'display_order': self.display_order
        }

class Colour(db.Model):
    __tablename__ = 'colours'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), unique=True, nullable=False)
    hex_code = db.Column(db.String(7), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'hex_code': self.hex_code
        }
