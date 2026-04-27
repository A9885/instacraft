'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Ishta Crafts Global Error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-sunken, #f9f6f2)',
      padding: 'var(--space-8, 2rem)',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '3rem',
        borderRadius: '24px',
        boxShadow: '0 12px 48px rgba(139, 0, 0, 0.08)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: 'rgba(139, 0, 0, 0.05)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #8b0000)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        
        <h1 style={{ 
          fontFamily: 'var(--font-heading, "Outfit", sans-serif)', 
          fontSize: '2rem', 
          fontWeight: 800, 
          color: 'var(--text-dark, #1a1a1a)',
          marginBottom: '1rem' 
        }}>
          Something went wrong
        </h1>
        
        <p style={{ 
          color: 'var(--text-muted, #666)', 
          lineHeight: 1.6, 
          marginBottom: '2rem' 
        }}>
          We encountered an unexpected error while preparing your artisan marketplace experience. Don&apos;t worry, we&apos;re here to help you get back on track.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
            style={{ 
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontWeight: 700,
              gap: '8px'
            }}
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="btn btn-outline"
            style={{ 
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontWeight: 700,
              color: 'var(--text-dark)',
              textDecoration: 'none'
            }}
          >
            Go Home
          </Link>
        </div>
      </div>
      
      <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'rgba(0,0,0,0.3)' }}>
        Error Code: {error?.digest || 'EC-IC-99'}
      </p>
    </div>
  );
}
