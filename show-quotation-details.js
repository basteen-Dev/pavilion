const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://root:gdF4CHLIrUX0JMFop11SW8tr9Y6Tk67d@dpg-d534alggjchc73eu0eeg-a.virginia-postgres.render.com/pavilion_npg7',
  ssl: { rejectUnauthorized: false }
});

async function showAllDetails() {
  try {
    console.log('=== QUOTATION SYSTEM DETAILS ===\n');
    
    // 1. Show products with URLs
    console.log('1. AVAILABLE PRODUCTS:');
    const products = await pool.query('SELECT id, name, sku, dealer_price, mrp_price FROM products LIMIT 5');
    products.rows.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name}`);
      console.log(`      SKU: ${product.sku}`);
      console.log(`      ID: ${product.id}`);
      console.log(`      Dealer Price: ₹${product.dealer_price}`);
      console.log(`      MRP: ₹${product.mrp_price}`);
      console.log(`      URL: http://localhost:3000/product/${product.sku}`);
      console.log('');
    });
    
    // 2. Show customers
    console.log('2. AVAILABLE CUSTOMERS:');
    const customers = await pool.query('SELECT id, company_name, email FROM customers LIMIT 3');
    customers.rows.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.company_name}`);
      console.log(`      ID: ${customer.id}`);
      console.log(`      Email: ${customer.email}`);
      console.log('');
    });
    
    // 3. Show existing quotations
    console.log('3. EXISTING QUOTATIONS:');
    const quotations = await pool.query('SELECT id, quotation_number, status, total_amount, created_at FROM quotations ORDER BY created_at DESC LIMIT 3');
    if (quotations.rows.length === 0) {
      console.log('   No quotations found');
    } else {
      quotations.rows.forEach((quot, index) => {
        console.log(`   ${index + 1}. ${quot.quotation_number}`);
        console.log(`      ID: ${quot.id}`);
        console.log(`      Status: ${quot.status}`);
        console.log(`      Total: ₹${quot.total_amount}`);
        console.log(`      Created: ${quot.created_at}`);
        console.log('');
      });
    }
    
    // 4. API Endpoints
    console.log('4. API ENDPOINTS:');
    console.log('   POST /api/admin/quotations/preview - Preview quotation');
    console.log('   POST /api/admin/quotations - Create draft quotation');
    console.log('   GET /api/admin/quotations - List all quotations');
    console.log('   GET /api/admin/quotations/[id] - Get single quotation');
    console.log('   PUT /api/admin/quotations/[id] - Update quotation status');
    
    // 5. Test URLs
    console.log('\n5. TEST URLs:');
    console.log('   Admin Dashboard: http://localhost:3000/admin/dashboard');
    console.log('   Products API: http://localhost:3000/api/products');
    console.log('   Quotations API: http://localhost:3000/api/admin/quotations');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

showAllDetails();
