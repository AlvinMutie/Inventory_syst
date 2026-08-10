import os
from app.extensions import db
from app.models import User, Category, Size, Colour, Product, ProductImage, ProductVariant, InventoryTransaction, Order, Sale

def seed_database():
    print("🌱 Seeding database with 2 core categories: Hoodies and Sweatpants & Joggers...")

    # Clear existing data for fresh seed
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

    # 2. Exactly Two Core Categories
    categories_data = [
        ('Hoodies', 'hoodies', 'Cozy fleece pullover hoodies and zip-up hooded sweaters'),
        ('Sweatpants & Joggers', 'sweatpants', 'Comfortable fleece joggers and elastic drawstring trousers'),
    ]
    category_map = {}
    for name, slug, desc in categories_data:
        cat = Category(name=name, slug=slug, description=desc)
        db.session.add(cat)
        db.session.flush()
        category_map[name] = cat
    print("  ✓ 2 Categories seeded: Hoodies & Sweatpants/Joggers")

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

    # 5. Generate 58 physical clothing items across the 2 categories
    # Items 1 - 30: Hoodies
    # Items 31 - 58: Sweatpants & Joggers
    colour_list = list(colour_map.keys())
    size_list = list(size_map.keys())

    DEFAULT_HOODIE_DESC = "Cozy fleece hoodie featuring a front kangaroo pocket, ribbed cuffs, and warm soft inner lining. Gentle on sensitive skin."
    DEFAULT_JOGGER_DESC = "Comfortable fleece joggers with ribbed ankle cuffs, deep side pockets, and elastic drawstring waistband for all-day play."

    for idx in range(1, 59):
        img_filename = f"/uploads/inventor_{idx:02d}.jpg"

        if idx <= 30:
            cat = category_map['Hoodies']
            base_name = f"Kids Fleece Hoodie Item #{idx}"
            slug = f"kids-fleece-hoodie-item-{idx}"
            desc = DEFAULT_HOODIE_DESC
            cost = 200.0 + (idx % 5) * 10
            selling = 350.0 + (idx % 6) * 15 # KSh 350 - 425
        else:
            cat = category_map['Sweatpants & Joggers']
            base_name = f"Kids Jogger Sweatpants Item #{idx}"
            slug = f"kids-jogger-sweatpants-item-{idx}"
            desc = DEFAULT_JOGGER_DESC
            cost = 150.0 + (idx % 5) * 10
            selling = 250.0 + (idx % 6) * 15 # KSh 250 - 325

        selling = min(500.0, selling)

        product = Product(
            name=base_name,
            slug=slug,
            description=desc,
            category_id=cat.id,
            cost_price=cost,
            selling_price=selling,
            low_stock_threshold=2,
            is_published=True,
            is_featured=(idx % 4 == 0)
        )
        db.session.add(product)
        db.session.flush()

        # Add primary image
        img = ProductImage(
            product_id=product.id,
            image_url=img_filename,
            is_primary=True,
            display_order=1
        )
        db.session.add(img)

        # Generate variant stock per item
        c1 = colour_list[idx % len(colour_list)]
        c2 = colour_list[(idx + 2) % len(colour_list)]
        s1 = size_list[idx % len(size_list)]
        s2 = size_list[(idx + 1) % len(size_list)]

        var_combos = [(c1, s1, 5 + (idx % 4)), (c2, s2, 4 + (idx % 3))]

        for col_name, sz_name, qty in var_combos:
            sku = f"ITEM{idx:02d}-{col_name[:3].upper()}-{sz_name}"

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
    print("  ✓ 58 physical clothing items seeded across Hoodies & Sweatpants (Prices: KSh 250 - KSh 500, 100% IN STOCK)!")
    print("🎉 Database seeding complete!")
