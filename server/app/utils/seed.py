import os
from app.extensions import db
from app.models import User, Category, Size, Colour, Product, ProductImage, ProductVariant, InventoryTransaction

def seed_database():
    print("🌱 Seeding database with real inventory stock...")
    
    # 1. Admin User
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(username='admin', email='admin@kidsclothing.com')
        admin.set_password('admin123')
        db.session.add(admin)
        print("  ✓ Created Admin user (admin / admin123)")

    # 2. Categories
    categories_data = [
        ('Hoodies', 'hoodies', 'Warm fleece hoodies and zip-up hooded sweaters'),
        ('Tracksuits', 'tracksuits', '2-piece matching hoodie and sweatpant sets'),
        ('Sweatpants', 'sweatpants', 'Comfortable fleece joggers and play trousers'),
        ('Jackets', 'jackets', 'Puffer winter coats and windbreaker jackets'),
        ('Sweaters', 'sweaters', 'Knit crewneck jumpers and warm sweaters'),
        ('T-Shirts', 't-shirts', '100% organic cotton graphic tees'),
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
        ('Yellow', '#FFFF00'),
        ('Sky Blue', '#87CEEB'),
        ('Beige', '#F5F5DC')
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

    # 5. Smart-filtered real inventory items from mum's stock
    real_products = [
        # Hoodies
        {
            'name': 'Kids Fleece Kangaroo Hoodie',
            'slug': 'kids-fleece-kangaroo-hoodie',
            'description': 'Super soft fleece lined hoodie with kangaroo pocket. Warm and durable for daily wear.',
            'category': category_map['Hoodies'],
            'cost': 700.00,
            'selling': 1200.00,
            'images': ['/uploads/inventor_01.jpg', '/uploads/inventor_02.jpg', '/uploads/inventor_03.jpg'],
            'variants': [
                ('Black', '4-5', 4),
                ('Black', '6-7', 5),
                ('Pink', '4-5', 3),
                ('Pink', '6-7', 4),
                ('Navy Blue', '8-10', 2)
            ]
        },
        {
            'name': 'Kids Zip-Up Hooded Jacket Sweater',
            'slug': 'kids-zip-up-hooded-jacket-sweater',
            'description': 'Front zip fleece hoodie with ribbed cuffs and elastic waistband.',
            'category': category_map['Hoodies'],
            'cost': 800.00,
            'selling': 1350.00,
            'images': ['/uploads/inventor_04.jpg', '/uploads/inventor_05.jpg'],
            'variants': [
                ('Red', '4-5', 3),
                ('Red', '6-7', 4),
                ('Grey', '8-10', 3)
            ]
        },
        # Tracksuits
        {
            'name': 'Cozy 2-Piece Fleece Tracksuit Set',
            'slug': 'cozy-2piece-fleece-tracksuit-set',
            'description': 'Matching pullover hoodie and fleece joggers set. Elastic waist with drawstring.',
            'category': category_map['Tracksuits'],
            'cost': 1200.00,
            'selling': 2200.00,
            'images': ['/uploads/inventor_06.jpg', '/uploads/inventor_07.jpg', '/uploads/inventor_08.jpg'],
            'variants': [
                ('Navy Blue', '4-5', 4),
                ('Navy Blue', '6-7', 5),
                ('Pink', '6-7', 3),
                ('Grey', '8-10', 4)
            ]
        },
        {
            'name': 'Kids Sporty Athletic Tracksuit',
            'slug': 'kids-sporty-athletic-tracksuit',
            'description': 'Breathable activewear 2-piece set for school sports and outdoor play.',
            'category': category_map['Tracksuits'],
            'cost': 1300.00,
            'selling': 2400.00,
            'images': ['/uploads/inventor_09.jpg', '/uploads/inventor_10.jpg'],
            'variants': [
                ('Black', '6-7', 5),
                ('Black', '8-10', 3),
                ('Red', '4-5', 2)
            ]
        },
        # Sweatpants
        {
            'name': 'Kids Thick Fleece Jogger Sweatpants',
            'slug': 'kids-thick-fleece-jogger-sweatpants',
            'description': 'Warm fleece sweatpants with deep side pockets and ribbed ankle cuffs.',
            'category': category_map['Sweatpants'],
            'cost': 450.00,
            'selling': 850.00,
            'images': ['/uploads/inventor_11.jpg', '/uploads/inventor_12.jpg', '/uploads/inventor_13.jpg'],
            'variants': [
                ('Black', '4-5', 6),
                ('Black', '6-7', 8),
                ('Grey', '4-5', 4),
                ('Navy Blue', '8-10', 5)
            ]
        },
        {
            'name': 'Kids Casual Cotton Play Trousers',
            'slug': 'kids-casual-cotton-play-trousers',
            'description': 'Lightweight cotton play pants with comfortable elastic waistband.',
            'category': category_map['Sweatpants'],
            'cost': 400.00,
            'selling': 750.00,
            'images': ['/uploads/inventor_14.jpg', '/uploads/inventor_15.jpg'],
            'variants': [
                ('Beige', '2-3', 4),
                ('Beige', '4-5', 5),
                ('Black', '6-7', 3)
            ]
        },
        # Jackets
        {
            'name': 'Kids Insulated Puffer Coat',
            'slug': 'kids-insulated-puffer-coat',
            'description': 'Heavyweight water-resistant puffer coat with soft lining and hood.',
            'category': category_map['Jackets'],
            'cost': 1500.00,
            'selling': 2800.00,
            'images': ['/uploads/inventor_16.jpg', '/uploads/inventor_17.jpg', '/uploads/inventor_18.jpg'],
            'variants': [
                ('Red', '6-7', 3),
                ('Red', '8-10', 2),
                ('Black', '4-5', 4),
                ('Navy Blue', '8-10', 3)
            ]
        },
        {
            'name': 'Kids Windbreaker Outdoor Jacket',
            'slug': 'kids-windbreaker-outdoor-jacket',
            'description': 'Lightweight windproof zip jacket for rainy weather and breezes.',
            'category': category_map['Jackets'],
            'cost': 1100.00,
            'selling': 1950.00,
            'images': ['/uploads/inventor_19.jpg', '/uploads/inventor_20.jpg'],
            'variants': [
                ('Yellow', '4-5', 3),
                ('Sky Blue', '6-7', 4)
            ]
        },
        # Sweaters
        {
            'name': 'Kids Knit Crewneck Jumper',
            'slug': 'kids-knit-crewneck-jumper',
            'description': 'Classic cotton knit sweater. Soft on sensitive skin and super warm.',
            'category': category_map['Sweaters'],
            'cost': 600.00,
            'selling': 1100.00,
            'images': ['/uploads/inventor_21.jpg', '/uploads/inventor_22.jpg', '/uploads/inventor_23.jpg'],
            'variants': [
                ('Pink', '4-5', 4),
                ('Pink', '6-7', 3),
                ('Grey', '6-7', 5)
            ]
        },
        # T-Shirts
        {
            'name': 'Kids Graphic Cotton T-Shirt',
            'slug': 'kids-graphic-cotton-tshirt-real',
            'description': '100% breathable organic cotton tee with fun cartoon print.',
            'category': category_map['T-Shirts'],
            'cost': 350.00,
            'selling': 650.00,
            'images': ['/uploads/inventor_24.jpg', '/uploads/inventor_25.jpg'],
            'variants': [
                ('Yellow', '2-3', 6),
                ('Yellow', '4-5', 5),
                ('Red', '4-5', 4),
                ('Sky Blue', '6-7', 6)
            ]
        }
    ]

    for p_info in real_products:
        existing = Product.query.filter_by(slug=p_info['slug']).first()
        if not existing:
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
                
                # Verify size and color exist
                if sz_name in size_map and col_name in colour_map:
                    variant = ProductVariant(
                        product_id=product.id,
                        size_id=size_map[sz_name].id,
                        colour_id=colour_map[col_name].id,
                        quantity=qty,
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
    print("  ✓ Real inventory photos successfully classified, seeded, and mapped to variants!")
    print("🎉 Database seeding complete!")
