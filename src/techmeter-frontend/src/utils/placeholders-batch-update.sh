#!/bin/bash
# Script to replace all via.placeholder.com URLs with local SVG placeholders

files=(
  "src/pages/cart/Cart.tsx"
  "src/pages/cart/Checkout.tsx"
  "src/pages/courses/CourseDetail.tsx"
  "src/pages/orders/OrderDetail.tsx"
  "src/pages/profile/Profile.tsx"
  "src/pages/provider/Dashboard.tsx"
  "src/pages/wishlist/Wishlist.tsx"
)

for file in "${files[@]}"; do
  echo "Processing $file..."
done
