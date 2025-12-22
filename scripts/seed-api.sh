#!/bin/bash

# API Base URL
API_BASE="http://localhost:3000/api"

# First, register an admin user and get token
echo "Registering admin user..."
curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pavilion.com",
    "password": "admin123",
    "full_name": "Super Admin",
    "account_type": "admin"
  }' | jq '.'

echo -e "\n\nLogging in..."
TOKEN=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pavilion.com",
    "password": "admin123"
  }' | jq -r '.token')

echo "Token: $TOKEN"

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "Failed to get token. Exiting..."
  exit 1
fi

# Create Brands
echo -e "\n\nCreating brands..."
BRANDS=("SS:ss" "MRF:mrf" "SG:sg" "Nike:nike" "Puma:puma" "Yonex:yonex" "Wilson:wilson")

for brand in "${BRANDS[@]}"; do
  IFS=':' read -r name slug <<< "$brand"
  curl -s -X POST "$API_BASE/admin/brands" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"name\": \"$name\",
      \"slug\": \"$slug\",
      \"logo_url\": \"https://via.placeholder.com/150\",
      \"is_featured\": true
    }" | jq '.id' || echo "Brand $name might already exist"
done

# Get brand IDs
echo -e "\n\nFetching brands..."
BRAND_DATA=$(curl -s "$API_BASE/brands")
SS_ID=$(echo "$BRAND_DATA" | jq -r '.[] | select(.slug=="ss") | .id')
MRF_ID=$(echo "$BRAND_DATA" | jq -r '.[] | select(.slug=="mrf") | .id')
NIKE_ID=$(echo "$BRAND_DATA" | jq -r '.[] | select(.slug=="nike") | .id')

echo "SS Brand ID: $SS_ID"

# Create Categories
echo -e "\n\nCreating categories..."
CRICKET_CAT=$(curl -s -X POST "$API_BASE/admin/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Cricket",
    "slug": "cricket",
    "image_url": "https://images.unsplash.com/photo-1610450294178-f1e30562db21",
    "description": "Cricket Equipment"
  }' | jq -r '.id')

echo "Cricket Category ID: $CRICKET_CAT"

CRICKET_BATS=$(curl -s -X POST "$API_BASE/admin/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"Cricket Bats\",
    \"slug\": \"cricket-bats\",
    \"parent_id\": \"$CRICKET_CAT\",
    \"image_url\": \"https://images.unsplash.com/photo-1610450294178-f1e30562db21\"
  }" | jq -r '.id')

echo "Cricket Bats Category ID: $CRICKET_BATS"

# Create Products
echo -e "\n\nCreating products..."
for i in {1..50}; do
  SKU="SKU-BAT-$i"
  curl -s -X POST "$API_BASE/admin/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"sku\": \"$SKU\",
      \"name\": \"Professional Cricket Bat Model $i\",
      \"slug\": \"cricket-bat-model-$i\",
      \"brand_id\": \"$SS_ID\",
      \"category_id\": \"$CRICKET_BATS\",
      \"short_description\": \"High-quality cricket bat for professionals\",
      \"description\": \"Premium English willow cricket bat with excellent balance and power. Perfect for professional and serious amateur players.\",
      \"mrp\": $((2000 + RANDOM % 8000)),
      \"dealer_price\": $((1500 + RANDOM % 6000)),
      \"discount_price\": $((1800 + RANDOM % 7000)),
      \"images\": [\"https://images.unsplash.com/photo-1610450294178-f1e30562db21\", \"https://images.pexels.com/photos/5994862/pexels-photo-5994862.jpeg\"],
      \"is_featured\": $((RANDOM % 4 == 0)),
      \"quote_flag\": false,
      \"stock_quantity\": $((10 + RANDOM % 90))
    }" > /dev/null

  if [ $((i % 10)) -eq 0 ]; then
    echo "Created $i products..."
  fi
done

echo -e "\n\nCreating Football category and products..."
FOOTBALL_CAT=$(curl -s -X POST "$API_BASE/admin/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Football",
    "slug": "football",
    "image_url": "https://images.unsplash.com/photo-1698963716007-dfbe3ffadcca",
    "description": "Football Equipment"
  }' | jq -r '.id')

for i in {1..30}; do
  SKU="SKU-FOOT-$i"
  curl -s -X POST "$API_BASE/admin/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"sku\": \"$SKU\",
      \"name\": \"Professional Football Size $((3 + RANDOM % 3))\",
      \"slug\": \"football-model-$i\",
      \"brand_id\": \"$NIKE_ID\",
      \"category_id\": \"$FOOTBALL_CAT\",
      \"short_description\": \"Official match football\",
      \"description\": \"Premium quality match football with superior grip and durability.\",
      \"mrp\": $((800 + RANDOM % 3200)),
      \"dealer_price\": $((600 + RANDOM % 2400)),
      \"discount_price\": $((700 + RANDOM % 2800)),
      \"images\": [\"https://images.unsplash.com/photo-1698963716007-dfbe3ffadcca\"],
      \"is_featured\": $((RANDOM % 5 == 0)),
      \"quote_flag\": false,
      \"stock_quantity\": $((20 + RANDOM % 80))
    }" > /dev/null
done

echo -e "\n\nSeeding completed!"
echo "Total products created: 80"
echo "You can now login with:"
echo "Email: admin@pavilion.com"
echo "Password: admin123"
