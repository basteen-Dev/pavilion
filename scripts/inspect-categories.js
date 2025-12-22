require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .limit(10); // Just fetch a few to see the structure

    if (error) {
        console.error('Error fetching categories:', error);
        return;
    }

    const output = JSON.stringify(categories, null, 2);
    console.log(output);
    fs.writeFileSync('categories_sample.txt', output);
}

inspectSchema();
