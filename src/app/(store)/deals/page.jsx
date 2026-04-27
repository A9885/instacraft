'use client';

/**
 * Deals page — reads offers from localStorage (admin-synced).
 * Converted to a client component so it picks up admin changes.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DealsPage() {
  const [allOffers, setAllOffers]   = useState([]);
  const [loading,   setLoading]     = useState(true);

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch('/api/offers/active?all=true');
        if (res.ok) {
          const data = await res.json();
          setAllOffers(data);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOffers();
  }, []);

  const active  = allOffers.filter(o => o.active);
  const expired = allOffers.filter(o => !o.active);

  if (loading) {
    return <div className="section"><div className="container py-12 text-center">Loading deals...</div></div>;
  }

  return (
    <div className="section" style={{ background: 'linear-gradient(to bottom, #fff, var(--surface-sunken))' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header mb-16">
          <span className="overline" style={{ color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.2em' }}>Limited Time</span>
          <h1 className="heading-xl" style={{ marginBottom: 'var(--space-4)' }}>Handcrafted Deals</h1>
          <p className="text-body" style={{ fontSize: 'var(--fs-18)', maxWidth: '600px', marginInline: 'auto' }}>
            Exclusive offers on our finest authentic Indian handicrafts. Grab them before they're gone.
          </p>
        </div>

        {/* Active offers */}
        {active.length > 0 && (
          <div className="mb-20">
            <h2 className="heading-md mb-8" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              Active Offers 
              <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }}></span>
            </h2>
            <div className="deals-grid">
              {active.map(offer => (
                <div
                  key={offer.id}
                  className="offer-card"
                  style={{ backgroundColor: offer.bgColor }}
                  role="article"
                >
                  <div className="offer-card-body">
                    <span
                      className="offer-card-badge"
                      style={{
                        background: offer.textColor,
                        color: offer.bgColor,
                      }}
                    >
                      {offer.type === 'percentage'
                        ? `${offer.discount}% OFF`
                        : offer.type === 'flat'
                        ? `₹${offer.discount} OFF`
                        : 'FREE SHIPPING'}
                    </span>
                    <h3 className="offer-card-title" style={{ color: offer.textColor }}>
                      {offer.title}
                    </h3>
                    <p className="offer-card-desc" style={{ color: offer.textColor }}>
                      {offer.description}
                    </p>
                    <div className="offer-card-expiry" style={{ color: offer.textColor, opacity: 0.8 }}>
                      Valid until {new Date(offer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <Link
                      href={offer.category ? `/shop/${offer.category}` : '/shop'}
                      className="offer-card-btn"
                      style={{ background: offer.textColor, color: offer.bgColor }}
                    >
                      Shop Collection
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </Link>
                  </div>

                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="offer-card-img"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {active.length === 0 && (
          <div className="text-center py-20 bg-surface rounded-xl border border-dashed border-border-color mb-20">
             <p className="text-muted" style={{ fontSize: 'var(--fs-18)' }}>No active offers at the moment. Check back soon!</p>
          </div>
        )}

        {/* Expired offers */}
        {expired.length > 0 && (
          <div className="mt-20 pt-16 border-top">
            <h2 className="heading-md mb-8" style={{ color: 'var(--text-muted)' }}>Previous Offers</h2>
            <div className="deals-grid">
              {expired.map(offer => (
                <div
                  key={offer.id}
                  className="offer-expired-card"
                >
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="offer-expired-img"
                    loading="lazy"
                  />
                  <div className="offer-expired-body">
                    <h3>{offer.title}</h3>
                    <p>{offer.description}</p>
                    <div className="mt-2" style={{ fontSize: 'var(--fs-12)', fontWeight: 600, color: 'var(--text-hint)' }}>
                      Ended on {new Date(offer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


