require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectColumns() {
    console.log("Fetching columns for 'categories' table...");
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'categories' });

    // Fallback if RPC doesn't exist, try getting one row
    if (error) {
        console.log("RPC failed, trying select...", error.message);
        const { data: rows, error: selectError } = await supabase.from('categories').select('*').limit(1);
        if (selectError) {
            console.error("Select failed:", selectError);
            return;
        }
        if (rows && rows.length > 0) {
            console.log("Keys in first row:", Object.keys(rows[0]));
            fs.writeFileSync('categories_keys.txt', JSON.stringify(Object.keys(rows[0]), null, 2));
        } else {
            console.log("Table is empty or not found.");
        }
        return;
    }
}

inspectColumns();
