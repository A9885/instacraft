'use client';

/**
 * DynamicProductListing — Client component for dynamic shop pages
 *
 * Reads products directly from localStorage (via dataStore) so that admin
 * changes are immediately reflected on the frontend after a page refresh.
 *
 * Falls back to the staticProducts prop (server-rendered seed) on initial
 * hydration before localStorage is available, preventing a content flash.
 */

import { useState, useEffect } from 'react';
import ShopFilterContainer from './ShopFilterContainer';
import { lsGetProducts } from '@/lib/dataStore';

export default function DynamicProductListing({
  staticProducts = [],
  category = null,        // filter by category if provided (string)
  isCustomCategory = false,
}) {
  const [products, setProducts] = useState(staticProducts);

  useEffect(() => {
    // 1. Filter by category if one is provided
    let filtered = category
      ? staticProducts.filter((p) => p.category === category)
      : staticProducts;

    // 2. Hide "service" type items from the "All Products" (null category) view
    // because they are already highlighted in their own dedicated Custom section.
    if (!category) {
      filtered = filtered.filter((p) => p.type !== "service");
    }

    setProducts(filtered);
  }, [category, staticProducts]); // re-run if category or server data changes

  return (
    <ShopFilterContainer
      initialProducts={products}
      isCustomCategory={isCustomCategory}
    />
  );
}
