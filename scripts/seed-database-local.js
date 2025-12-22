// Database seeding script for local development
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://root:gdF4CHLIrUX0JMFop11SW8tr9Y6Tk67d@dpg-d534alggjchc73eu0eeg-a.virginia-postgres.render.com/pavilion_npg7',
  ssl: {
    rejectUnauthorized: false
  }
});

const sportImages = {
  cricket: [
    'https://images.unsplash.com/photo-1610450294178-f1e30562db21',
    'https://images.pexels.com/photos/5994862/pexels-photo-5994862.jpeg',
    'https://images.pexels.com/photos/3786132/pexels-photo-3786132.jpeg'
  ],
  football: [
    'https://images.unsplash.com/photo-1698963716007-dfbe3ffadcca',
    'https://images.unsplash.com/photo-1577223618563-3d858655ab86'
  ],
  basketball: [
    'https://images.unsplash.com/photo-1603124076947-7b6412d8958e',
    'https://images.unsplash.com/photo-1559302995-ab792ee16ce8',
    'https://images.pexels.com/photos/13077749/pexels-photo-13077749.jpeg'
  ],
  tennis: [
    'https://images.unsplash.com/photo-1595412916059-1034e17aaf85',
    'https://images.unsplash.com/photo-1594476559210-a93c4d6fc5e1'
  ],
  generic: [
    'https://images.unsplash.com/photo-1583051663501-de1f00bd6ad4',
    'https://images.unsplash.com/photo-1567660444666-aed93ec8aa57'
  ]
};

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // 1. Create brands
    const brands = [
      { name: 'SS', slug: 'ss', logo: '/brands/ss.png' },
      { name: 'MRF', slug: 'mrf', logo: '/brands/mrf.png' },
      { name: 'SG', slug: 'sg', logo: '/brands/sg.png' },
      { name: 'Kookaburra', slug: 'kookaburra', logo: '/brands/kookaburra.png' },
      { name: 'Gray-Nicolls', slug: 'gray-nicolls', logo: '/brands/gray-nicolls.png' },
      { name: 'Nike', slug: 'nike', logo: '/brands/nike.png' },
      { name: 'Adidas', slug: 'adidas', logo: '/brands/adidas.png' },
      { name: 'Puma', slug: 'puma', logo: '/brands/puma.png' },
      { name: 'Yonex', slug: 'yonex', logo: '/brands/yonex.png' },
      { name: 'Wilson', slug: 'wilson', logo: '/brands/wilson.png' }
    ];

    const brandIds = {};
    for (const brand of brands) {
      const result = await pool.query(
        `INSERT INTO brands (name, slug, logo_url, is_featured, display_order) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (slug) DO UPDATE SET name = $1
         RETURNING id`,
        [brand.name, brand.slug, brand.logo, Math.random() > 0.5, Math.floor(Math.random() * 10)]
      );
      brandIds[brand.slug] = result.rows[0].id;
    }
    console.log('Brands created:', Object.keys(brandIds).length);

    // 2. Create categories
    const categories = [
      { name: 'Cricket', slug: 'cricket', parent: null, image: sportImages.cricket[0] },
      { name: 'Cricket Bats', slug: 'cricket-bats', parent: 'cricket', image: sportImages.cricket[0] },
      { name: 'Cricket Balls', slug: 'cricket-balls', parent: 'cricket', image: sportImages.cricket[1] },
      { name: 'Protective Gear', slug: 'protective-gear', parent: 'cricket', image: sportImages.cricket[2] },
      { name: 'Cricket Clothing', slug: 'cricket-clothing', parent: 'cricket', image: sportImages.cricket[0] },
      
      { name: 'Football', slug: 'football', parent: null, image: sportImages.football[0] },
      { name: 'Footballs', slug: 'footballs', parent: 'football', image: sportImages.football[0] },
      { name: 'Football Boots', slug: 'football-boots', parent: 'football', image: sportImages.football[1] },
      { name: 'Goalkeeper Gear', slug: 'goalkeeper-gear', parent: 'football', image: sportImages.football[0] },
      
      { name: 'Basketball', slug: 'basketball', parent: null, image: sportImages.basketball[0] },
      { name: 'Basketballs', slug: 'basketballs', parent: 'basketball', image: sportImages.basketball[0] },
      { name: 'Basketball Shoes', slug: 'basketball-shoes', parent: 'basketball', image: sportImages.basketball[1] },
      
      { name: 'Tennis', slug: 'tennis', parent: null, image: sportImages.tennis[0] },
      { name: 'Tennis Rackets', slug: 'tennis-rackets', parent: 'tennis', image: sportImages.tennis[0] },
      { name: 'Tennis Balls', slug: 'tennis-balls', parent: 'tennis', image: sportImages.tennis[1] },
      
      { name: 'Badminton', slug: 'badminton', parent: null, image: sportImages.generic[0] },
      { name: 'Badminton Rackets', slug: 'badminton-rackets', parent: 'badminton', image: sportImages.generic[0] },
      { name: 'Shuttlecocks', slug: 'shuttlecocks', parent: 'badminton', image: sportImages.generic[1] }
    ];

    const categoryIds = {};
    for (const category of categories) {
      let parentId = null;
      if (category.parent) {
        parentId = categoryIds[category.parent];
      }
      
      const result = await pool.query(
        `INSERT INTO categories (name, slug, parent_id, image_url, display_order) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (slug) DO UPDATE SET name = $1
         RETURNING id`,
        [category.name, category.slug, parentId, category.image, Math.floor(Math.random() * 10)]
      );
      categoryIds[category.slug] = result.rows[0].id;
    }
    console.log('Categories created:', Object.keys(categoryIds).length);

    // 3. Create 200 products
    const productTemplates = {
      'cricket-bats': [
        'English Willow Cricket Bat', 'Kashmir Willow Bat', 'Professional Cricket Bat', 
        'Youth Cricket Bat', 'Training Cricket Bat', 'Tournament Edition Bat'
      ],
      'cricket-balls': [
        'Leather Cricket Ball Red', 'Leather Cricket Ball White', 'Tennis Cricket Ball',
        'Practice Cricket Ball', 'Match Cricket Ball'
      ],
      'protective-gear': [
        'Cricket Helmet', 'Batting Pads', 'Batting Gloves', 'Wicket Keeping Gloves',
        'Thigh Guard', 'Arm Guard', 'Chest Guard', 'Abdominal Guard'
      ],
      'footballs': [
        'Official Match Football', 'Training Football', 'Indoor Football',
        'Beach Football', 'Street Football'
      ],
      'basketballs': [
        'Official Game Basketball', 'Training Basketball', 'Indoor Basketball',
        'Outdoor Basketball', 'Youth Basketball'
      ],
      'tennis-rackets': [
        'Professional Tennis Racket', 'Junior Tennis Racket', 'Training Tennis Racket',
        'Carbon Fiber Racket', 'Beginner Tennis Racket'
      ],
      'badminton-rackets': [
        'Professional Badminton Racket', 'Carbon Fiber Badminton Racket', 
        'Aluminum Badminton Racket', 'Junior Badminton Racket'
      ]
    };

    const descriptions = [
      'Premium quality sports equipment designed for professional athletes',
      'High-performance gear trusted by champions worldwide',
      'Durable and reliable equipment for serious players',
      'Professional-grade product with superior craftsmanship',
      'Top-tier sports gear for competitive performance'
    ];

    let productsCreated = 0;
    const targetProducts = 200;
    
    while (productsCreated < targetProducts) {
      for (const [categorySlug, templates] of Object.entries(productTemplates)) {
        if (productsCreated >= targetProducts) break;
        
        for (const template of templates) {
          if (productsCreated >= targetProducts) break;
          
          const brandKeys = Object.keys(brandIds);
          const randomBrand = brandKeys[Math.floor(Math.random() * brandKeys.length)];
          const brandId = brandIds[randomBrand];
          const categoryId = categoryIds[categorySlug];
          
          const variantNumber = Math.floor(Math.random() * 100) + 1;
          const name = `${template} - Model ${variantNumber}`;
          const sku = `SKU-${Date.now()}-${productsCreated}`;
          const slug = `${categorySlug}-${randomBrand}-${variantNumber}-${Date.now()}`.toLowerCase();
          
          const mrp = Math.floor(Math.random() * 9000) + 1000;
          const dealerPrice = mrp * 0.7;
          const discountPrice = mrp * 0.85;
          
          // Select sport type for images
          let imageSet = sportImages.generic;
          if (categorySlug.includes('cricket')) imageSet = sportImages.cricket;
          else if (categorySlug.includes('football')) imageSet = sportImages.football;
          else if (categorySlug.includes('basketball')) imageSet = sportImages.basketball;
          else if (categorySlug.includes('tennis')) imageSet = sportImages.tennis;
          
          const images = [
            imageSet[Math.floor(Math.random() * imageSet.length)],
            imageSet[Math.floor(Math.random() * imageSet.length)]
          ];
          
          const isFeatured = Math.random() > 0.8;
          const quoteFlag = Math.random() > 0.9;
          const description = descriptions[Math.floor(Math.random() * descriptions.length)];
          
          await pool.query(
            `INSERT INTO products 
             (sku, name, slug, brand_id, category_id, short_description, description, mrp_price, dealer_price, selling_price, size, is_featured, allow_quote, stock_quantity) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             ON CONFLICT (sku) DO NOTHING`,
            [sku, name, slug, brandId, categoryId, description, description + ' with excellent build quality and performance characteristics.', mrp, dealerPrice, discountPrice, null, isFeatured, quoteFlag, Math.floor(Math.random() * 100) + 10]
          );
          
          productsCreated++;
          if (productsCreated % 20 === 0) {
            console.log(`Created ${productsCreated} products...`);
          }
        }
      }
    }
    
    console.log(`Total products created: ${productsCreated}`);

    // 4. Create default admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const roleResult = await pool.query(`SELECT id FROM roles WHERE name = 'superadmin'`);
    if (roleResult.rows.length > 0) {
      await pool.query(
        `INSERT INTO users (email, password_hash, name, role, is_active) 
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (email) DO NOTHING`,
        ['admin@pavilion.com', adminPassword, 'Super Admin', 'superadmin']
      );
      console.log('Admin user created: admin@pavilion.com / admin123');
    }

    console.log('Database seeding completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    await pool.end();
    process.exit(1);
  }
}

seedDatabase();
