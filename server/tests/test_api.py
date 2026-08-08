import pytest
from app import create_app
from app.extensions import db
from app.models import User, Category, Size, Colour, Product, ProductVariant, Order, Sale, InventoryTransaction

class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SECRET_KEY = 'test-secret-key'
    JWT_SECRET_KEY = 'test-jwt-secret-key'
    CURRENCY = 'KSh'
    WHATSAPP_PHONE = '254700000000'

@pytest.fixture
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        # Create test admin
        user = User(username='testadmin', email='testadmin@example.com')
        user.set_password('password123')
        db.session.add(user)
        
        # Create test attributes
        cat = Category(name='Hoodies', slug='hoodies')
        size = Size(name='6-7', display_order=1)
        colour = Colour(name='Black', hex_code='#000000')
        db.session.add_all([cat, size, colour])
        db.session.commit()

        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(client):
    res = client.post('/api/v1/auth/login', json={
        'username': 'testadmin',
        'password': 'password123'
    })
    token = res.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}

def test_login_success(client):
    res = client.post('/api/v1/auth/login', json={
        'username': 'testadmin',
        'password': 'password123'
    })
    assert res.status_code == 200
    assert 'access_token' in res.get_json()

def test_public_products_endpoint(client):
    res = client.get('/api/v1/public/products')
    assert res.status_code == 200
    assert 'products' in res.get_json()

def test_admin_create_product_and_variant(client, auth_headers):
    # Get size and colour IDs
    cat = Category.query.filter_by(slug='hoodies').first()
    size = Size.query.filter_by(name='6-7').first()
    colour = Colour.query.filter_by(name='Black').first()

    payload = {
        'name': 'Kids Fleece Hoodie',
        'category_id': cat.id,
        'cost_price': 600,
        'selling_price': 1200,
        'variants': [
            {
                'size_id': size.id,
                'colour_id': colour.id,
                'quantity': 5
            }
        ]
    }
    res = client.post('/api/v1/admin/products', json=payload, headers=auth_headers)
    assert res.status_code == 201
    data = res.get_json()['product']
    assert data['name'] == 'Kids Fleece Hoodie'
    assert data['total_quantity'] == 5

def test_sales_record_decrements_stock(client, auth_headers):
    cat = Category.query.filter_by(slug='hoodies').first()
    size = Size.query.filter_by(name='6-7').first()
    colour = Colour.query.filter_by(name='Black').first()

    p = Product(name='Test Jacket', slug='test-jacket', cost_price=500, selling_price=1000, category_id=cat.id)
    db.session.add(p)
    db.session.flush()

    v = ProductVariant(product_id=p.id, size_id=size.id, colour_id=colour.id, quantity=10, sku='TEST-BLK-67')
    db.session.add(v)
    db.session.commit()

    # Record sale of 2 units
    sale_payload = {
        'customer_name': 'Mary W.',
        'status': 'SOLD',
        'items': [
            {
                'variant_id': v.id,
                'quantity': 2,
                'unit_selling_price': 1000,
                'unit_cost_price': 500
            }
        ]
    }
    res = client.post('/api/v1/admin/orders', json=sale_payload, headers=auth_headers)
    assert res.status_code == 201

    # Verify stock decremented from 10 to 8
    updated_variant = ProductVariant.query.get(v.id)
    assert updated_variant.quantity == 8

def test_reservation_and_conversion(client, auth_headers):
    cat = Category.query.filter_by(slug='hoodies').first()
    size = Size.query.filter_by(name='6-7').first()
    colour = Colour.query.filter_by(name='Black').first()

    p = Product(name='Test Sweater', slug='test-sweater', cost_price=400, selling_price=900, category_id=cat.id)
    db.session.add(p)
    db.session.flush()

    v = ProductVariant(product_id=p.id, size_id=size.id, colour_id=colour.id, quantity=4, sku='TEST-SWT-67')
    db.session.add(v)
    db.session.commit()

    # 1. Create reservation
    res_payload = {
        'customer_name': 'Alice',
        'status': 'RESERVED',
        'items': [{'variant_id': v.id, 'quantity': 1}]
    }
    res = client.post('/api/v1/admin/orders', json=res_payload, headers=auth_headers)
    assert res.status_code == 201
    order_id = res.get_json()['order']['id']

    # Verify reserved quantity
    v1 = ProductVariant.query.get(v.id)
    assert v1.quantity == 4
    assert v1.reserved_quantity == 1
    assert v1.available_quantity == 3

    # 2. Convert reservation to SOLD
    res_convert = client.post(f'/api/v1/admin/orders/{order_id}/convert-to-sold', headers=auth_headers)
    assert res_convert.status_code == 200

    # Verify stock reduced
    v2 = ProductVariant.query.get(v.id)
    assert v2.quantity == 3
    assert v2.reserved_quantity == 0
    assert v2.available_quantity == 3
