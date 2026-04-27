'use client';

/**
 * StoreSyncProvider
 *
 * A lightweight client component that runs once on first render to seed
 * localStorage from the static data files. It is placed in the root layout
 * so it executes on every page load before any data is consumed.
 *
 * On subsequent visits the seed is skipped (STORAGE_KEYS.SEEDED flag).
 * To force a re-seed (e.g., after a data schema change), bump the version
 * suffix in STORAGE_KEYS.SEEDED inside dataStore.js.
 */

import { useEffect } from 'react';
import { seedStoreIfNeeded } from '@/lib/dataStore';
import { categories } from '@/data/categories';

export default function StoreSyncProvider({ children }) {
  useEffect(() => {
    seedStoreIfNeeded({ products: [], categories, offers: [], coupons: [], heroSlides: [], testimonials: [] });
  }, []);

  return children;
}
