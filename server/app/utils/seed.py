from app.extensions import db
from app.models import User, Category, Size, Colour, Product, ProductImage, ProductVariant, InventoryTransaction

def seed_database():
    print("🌱 Seeding database...")
    
    # 1. Admin User
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(username='admin', email='admin@kidsclothing.com')
        admin.set_password('admin123')
        db.session.add(admin)
        print("  ✓ Created Admin user (admin / admin123)")

    # 2. Categories
    categories_data = [
        ('Hoodies', 'hoodies', 'Warm and stylish hoodies for boys and girls'),
        ('Sweatpants', 'sweatpants', 'Comfortable fleece sweatpants for daily play'),
        ('Tracksuits', 'tracksuits', '2-piece hoodie and sweatpants sets'),
        ('Jackets', 'jackets', 'Puffer jackets and windbreakers'),
        ('T-Shirts', 't-shirts', '100% cotton casual tees'),
        ('Sweaters', 'sweaters', 'Knit jumpers and crewneck sweaters'),
    ]
    category_map = {}
    for name, slug, desc in categories_data:
        cat = Category.query.filter_by(slug=slug).first()
        if not cat:
            cat = Category(name=name, slug=slug, description=desc)
            db.session.add(cat)
            db.session.flush()
        category_map[name] = cat
    print("  ✓ Categories seeded")

    # 3. Sizes
    sizes_data = [
        ('2-3', 1),
        ('4-5', 2),
        ('6-7', 3),
        ('8-10', 4),
        ('11-12', 5)
    ]
    size_map = {}
    for name, order in sizes_data:
        s = Size.query.filter_by(name=name).first()
        if not s:
            s = Size(name=name, display_order=order)
            db.session.add(s)
            db.session.flush()
        size_map[name] = s
    print("  ✓ Sizes seeded")

    # 4. Colours
    colours_data = [
        ('Black', '#000000'),
        ('Pink', '#FFC0CB'),
        ('Navy Blue', '#000080'),
        ('Grey', '#808080'),
        ('Red', '#FF0000'),
        ('Yellow', '#FFFF00')
    ]
    colour_map = {}
    for name, hex_c in colours_data:
        c = Colour.query.filter_by(name=name).first()
        if not c:
            c = Colour(name=name, hex_code=hex_c)
            db.session.add(c)
            db.session.flush()
        colour_map[name] = c
    print("  ✓ Colours seeded")

    db.session.commit()

    # 5. Products & Variants
    if Product.query.count() == 0:
        products_info = [
            {
                'name': 'Kids Fleece Hoodie',
                'slug': 'kids-fleece-hoodie',
                'description': 'Super soft fleece lined hoodie with kangaroo pocket. Great for cold mornings.',
                'category': category_map['Hoodies'],
                'cost': 700.00,
                'selling': 1200.00,
                'image': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
                'variants': [
                    ('Black', '4-5', 3),
                    ('Black', '6-7', 4),
                    ('Black', '8-10', 2),
                    ('Pink', '4-5', 2),
                    ('Pink', '6-7', 3),
                    ('Pink', '8-10', 1),
                ]
            },
            {
                'name': 'Cozy 2-Piece Tracksuit',
                'slug': 'cozy-2-piece-tracksuit',
                'description': 'Matching hoodie and sweatpants tracksuit set. Elastic waistband with drawstring.',
                'category': category_map['Tracksuits'],
                'cost': 1200.00,
                'selling': 2200.00,
                'image': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80',
                'variants': [
                    ('Navy Blue', '4-5', 4),
                    ('Navy Blue', '6-7', 5),
                    ('Grey', '6-7', 2),
                    ('Grey', '8-10', 3),
                ]
            },
            {
                'name': 'Kids Insulated Puffer Jacket',
                'slug': 'kids-insulated-puffer-jacket',
                'description': 'Warm water-resistant puffer jacket with detachable hood.',
                'category': category_map['Jackets'],
                'cost': 1500.00,
                'selling': 2800.00,
                'image': 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
                'variants': [
                    ('Red', '6-7', 2),
                    ('Red', '8-10', 1),
                    ('Black', '4-5', 3),
                    ('Black', '8-10', 4),
                ]
            },
            {
                'name': 'Kids Graphic Cotton T-Shirt',
                'slug': 'kids-graphic-cotton-tshirt',
                'description': 'Breathable 100% organic cotton t-shirt with cheerful front print.',
                'category': category_map['T-Shirts'],
                'cost': 350.00,
                'selling': 750.00,
                'image': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',
                'variants': [
                    ('Yellow', '2-3', 5),
                    ('Yellow', '4-5', 5),
                    ('Pink', '4-5', 3),
                    ('Pink', '6-7', 4),
                ]
            }
        ]

        for p_info in products_info:
            product = Product(
                name=p_info['name'],
                slug=p_info['slug'],
                description=p_info['description'],
                category_id=p_info['category'].id,
                cost_price=p_info['cost'],
                selling_price=p_info['selling'],
                is_published=True,
                is_featured=True
            )
            db.session.add(product)
            db.session.flush()

            img = ProductImage(
                product_id=product.id,
                image_url=p_info['image'],
                is_primary=True,
                display_order=1
            )
            db.session.add(img)

            for col_name, sz_name, qty in p_info['variants']:
                clean_slug = product.slug.replace('-', '').upper()[:8]
                sku = f"{clean_slug}-{col_name[:3].upper()}-{sz_name}"
                variant = ProductVariant(
                    product_id=product.id,
                    size_id=size_map[sz_name].id,
                    colour_id=colour_map[col_name].id,
                    quantity=qty,
                    sku=sku
                )
                db.session.add(variant)
                db.session.flush()

                # Audit log initial stock
                tx = InventoryTransaction(
                    variant_id=variant.id,
                    transaction_type='STOCK_IN',
                    quantity_change=qty,
                    previous_quantity=0,
                    new_quantity=qty,
                    notes='Initial Stock Arrival'
                )
                db.session.add(tx)

        db.session.commit()
        print("  ✓ Sample Products, Images, Variants & Stock Transactions seeded successfully")

    print("🎉 Database seeding complete!")
