'use client';

import { CartProvider }     from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { SearchProvider }   from './SearchContext';
import { AdminProvider }    from './AdminContext';
import { SiteConfigProvider } from './SiteConfigContext';
import StoreSyncProvider    from './StoreSyncProvider';

export default function AppProvider({ children, initialConfig }) {
  return (
    // StoreSyncProvider seeds localStorage from static data on first visit
    <StoreSyncProvider>
      <SiteConfigProvider initialConfig={initialConfig}>
        <CartProvider>
          <WishlistProvider>
            <SearchProvider>
              <AdminProvider>
                {children}
              </AdminProvider>
            </SearchProvider>
          </WishlistProvider>
        </CartProvider>
      </SiteConfigProvider>
    </StoreSyncProvider>
  );
}
