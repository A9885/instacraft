'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getSiteConfig } from '@/lib/api';

const SiteConfigContext = createContext();

export function SiteConfigProvider({ children, initialConfig = null }) {
  const [config, setConfig] = useState(initialConfig);
  const [loading, setLoading] = useState(!initialConfig);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const data = await getSiteConfig();
        if (data) setConfig(data);
      } catch (err) {
        console.error('Failed to fetch site config in context:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!initialConfig) {
      fetchConfig();
    }
  }, [initialConfig]);

  return (
    <SiteConfigContext.Provider value={{ config, loading }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
}
