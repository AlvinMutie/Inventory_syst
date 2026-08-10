import os
from app.extensions import db
from app.models import User, Category, Size, Colour, Product, ProductImage, ProductVariant, InventoryTransaction, Order, Sale

def seed_database():
    print("🌱 Seeding database with real Hoodies & Sweatpants inventory...")

    # Clear existing orders/sales/products for a fresh, clean real-data seed
    db.session.query(Sale).delete()
    db.session.query(Order).delete()
    db.session.query(InventoryTransaction).delete()
    db.session.query(ProductVariant).delete()
    db.session.query(ProductImage).delete()
    db.session.query(Product).delete()
    db.session.query(Category).delete()
    db.session.commit()
    
    # 1. Admin User
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(username='admin', email='admin@kidsclothing.com')
        admin.set_password('admin123')
        db.session.add(admin)
        print("  ✓ Created Admin user (admin / admin123)")

    # 2. Core Categories (Hoodies & Sweatpants/Joggers)
    categories_data = [
        ('Hoodies', 'hoodies', 'Warm fleece pullover hoodies and zip-up sweaters'),
        ('Sweatpants & Joggers', 'sweatpants', 'Comfortable fleece joggers and elastic waist trousers'),
        ('Hoodie & Jogger Sets', 'tracksuits', '2-piece matching hoodie and sweatpant sets'),
    ]
    category_map = {}
    for name, slug, desc in categories_data:
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
        ('Grey', '#808080'),
        ('Navy Blue', '#000080'),
        ('Pink', '#FFC0CB'),
        ('Red', '#FF0000'),
        ('Beige', '#F5F5DC'),
        ('Yellow', '#FFFF00'),
        ('Sky Blue', '#87CEEB')
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

    # 5. Smart-filtered real inventory items (Priced KSh 250 - KSh 500, all IN STOCK)
    real_products = [
        # SWEATPANTS & JOGGERS (KSh 250 - 350)
        {
            'name': 'Kids Fleece Jogger Sweatpants',
            'slug': 'kids-fleece-jogger-sweatpants',
            'description': 'Soft fleece lined sweatpants with elastic drawstring waist and deep side pockets. Perfect for play and casual wear.',
            'category': category_map['Sweatpants & Joggers'],
            'cost': 150.00,
            'selling': 250.00,
            'images': ['/uploads/inventor_01.jpg', '/uploads/inventor_02.jpg', '/uploads/inventor_03.jpg', '/uploads/inventor_04.jpg'],
            'variants': [
                ('Black', '2-3', 8),
                ('Black', '4-5', 10),
                ('Black', '6-7', 8),
                ('Grey', '4-5', 6),
                ('Grey', '6-7', 7),
                ('Navy Blue', '8-10', 5)
            ]
        },
        {
            'name': 'Kids Ribbed Cuff Sweatpants',
            'slug': 'kids-ribbed-cuff-sweatpants',
            'description': 'Durable cotton-blend joggers with elastic ankle cuffs for a snug, cozy fit.',
            'category': category_map['Sweatpants & Joggers'],
            'cost': 180.00,
            'selling': 300.00,
            'images': ['/uploads/inventor_05.jpg', '/uploads/inventor_06.jpg', '/uploads/inventor_07.jpg'],
            'variants': [
                ('Navy Blue', '4-5', 7),
                ('Navy Blue', '6-7', 9),
                ('Grey', '8-10', 6),
                ('Beige', '2-3', 5)
            ]
        },
        {
            'name': 'Kids Heavyweight Fleece Trousers',
            'slug': 'kids-heavyweight-fleece-trousers',
            'description': 'Extra warm fleece joggers designed for cold mornings and outdoor play.',
            'category': category_map['Sweatpants & Joggers'],
            'cost': 200.00,
            'selling': 350.00,
            'images': ['/uploads/inventor_08.jpg', '/uploads/inventor_09.jpg', '/uploads/inventor_10.jpg'],
            'variants': [
                ('Black', '6-7', 8),
                ('Black', '8-10', 6),
                ('Red', '4-5', 5),
                ('Red', '6-7', 7)
            ]
        },

        # HOODIES (KSh 350 - 450)
        {
            'name': 'Kids Soft Fleece Pullover Hoodie',
            'slug': 'kids-soft-fleece-pullover-hoodie',
            'description': 'Cozy fleece hoodie featuring a front kangaroo pocket and ribbed cuffs. Soft against skin.',
            'category': category_map['Hoodies'],
            'cost': 220.00,
            'selling': 380.00,
            'images': ['/uploads/inventor_11.jpg', '/uploads/inventor_12.jpg', '/uploads/inventor_13.jpg', '/uploads/inventor_14.jpg'],
            'variants': [
                ('Black', '4-5', 7),
                ('Black', '6-7', 8),
                ('Pink', '2-3', 6),
                ('Pink', '4-5', 7),
                ('Pink', '6-7', 5)
            ]
        },
        {
            'name': 'Kids Zip-Up Fleece Hooded Sweater',
            'slug': 'kids-zip-up-fleece-hooded-sweater',
            'description': 'Easy front zip fleece hoodie with hood and elastic hem. Lightweight and easy to put on.',
            'category': category_map['Hoodies'],
            'cost': 250.00,
            'selling': 400.00,
            'images': ['/uploads/inventor_15.jpg', '/uploads/inventor_16.jpg', '/uploads/inventor_17.jpg'],
            'variants': [
                ('Red', '4-5', 6),
                ('Red', '6-7', 7),
                ('Grey', '6-7', 8),
                ('Grey', '8-10', 5)
            ]
        },
        {
            'name': 'Kids Warm Hooded Sweatshirt',
            'slug': 'kids-warm-hooded-sweatshirt',
            'description': 'Premium cotton fleece pullover hoodie suitable for school and weekend outings.',
            'category': category_map['Hoodies'],
            'cost': 260.00,
            'selling': 450.00,
            'images': ['/uploads/inventor_18.jpg', '/uploads/inventor_19.jpg', '/uploads/inventor_20.jpg'],
            'variants': [
                ('Navy Blue', '4-5', 8),
                ('Navy Blue', '6-7', 9),
                ('Sky Blue', '2-3', 5),
                ('Sky Blue', '4-5', 6),
                ('Yellow', '6-7', 5)
            ]
        },

        # HOODIE & JOGGER SETS (KSh 450 - 500)
        {
            'name': 'Kids 2-Piece Fleece Hoodie & Jogger Set',
            'slug': 'kids-2piece-fleece-hoodie-jogger-set',
            'description': 'Complete matching outfit set: cozy fleece hoodie and matching jogger sweatpants.',
            'category': category_map['Hoodie & Jogger Sets'],
            'cost': 280.00,
            'selling': 480.00,
            'images': ['/uploads/inventor_21.jpg', '/uploads/inventor_22.jpg', '/uploads/inventor_23.jpg', '/uploads/inventor_24.jpg'],
            'variants': [
                ('Navy Blue', '4-5', 8),
                ('Navy Blue', '6-7', 10),
                ('Pink', '4-5', 6),
                ('Pink', '6-7', 7),
                ('Grey', '8-10', 5)
            ]
        },
        {
            'name': 'Kids Sporty Hoodie & Sweatpant Tracksuit Set',
            'slug': 'kids-sporty-hoodie-sweatpant-tracksuit-set',
            'description': 'Stylish matching 2-piece set featuring pullover hoodie and elastic waist joggers.',
            'category': category_map['Hoodie & Jogger Sets'],
            'cost': 300.00,
            'selling': 500.00,
            'images': ['/uploads/inventor_25.jpg', '/uploads/inventor_26.jpg', '/uploads/inventor_27.jpg'],
            'variants': [
                ('Black', '4-5', 9),
                ('Black', '6-7', 8),
                ('Red', '6-7', 6),
                ('Red', '8-10', 5)
            ]
        }
    ]

    for p_info in real_products:
        product = Product(
            name=p_info['name'],
            slug=p_info['slug'],
            description=p_info['description'],
            category_id=p_info['category'].id,
            cost_price=p_info['cost'],
            selling_price=p_info['selling'],
            low_stock_threshold=2,
            is_published=True,
            is_featured=True
        )
        db.session.add(product)
        db.session.flush()

        for idx, img_url in enumerate(p_info['images']):
            img = ProductImage(
                product_id=product.id,
                image_url=img_url,
                is_primary=(idx == 0),
                display_order=idx + 1
            )
            db.session.add(img)

        for col_name, sz_name, qty in p_info['variants']:
            clean_slug = product.slug.replace('-', '').upper()[:8]
            sku = f"{clean_slug}-{col_name[:3].upper()}-{sz_name}"
            
            if sz_name in size_map and col_name in colour_map:
                variant = ProductVariant(
                    product_id=product.id,
                    size_id=size_map[sz_name].id,
                    colour_id=colour_map[col_name].id,
                    quantity=qty,
                    reserved_quantity=0,
                    sku=sku
                )
                db.session.add(variant)
                db.session.flush()

                tx = InventoryTransaction(
                    variant_id=variant.id,
                    transaction_type='STOCK_IN',
                    quantity_change=qty,
                    previous_quantity=0,
                    new_quantity=qty,
                    notes='Initial physical stock arrival'
                )
                db.session.add(tx)

    db.session.commit()
    print("  ✓ Real Hoodies & Sweatpants stock successfully seeded (Prices: KSh 250 - KSh 500, all IN STOCK)!")
    print("🎉 Database seeding complete!")
