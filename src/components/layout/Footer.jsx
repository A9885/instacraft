'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { InstagramIcon, FacebookIcon, PinterestIcon, TwitterIcon, PhoneIcon, MailIcon } from '../common/Icons';
import { getCategories, getSiteContent } from '@/lib/api';
import { useSiteConfig } from '@/store/SiteConfigContext';
import { WHATSAPP_URL } from '@/lib/constants';

export default function Footer({ staticContent, staticCategories }) {
  const [categories, setCategories] = useState(staticCategories || []);
  const [content, setContent] = useState(staticContent || null);
  const { config: siteConfig } = useSiteConfig();

  useEffect(() => {
    // If Server Component passed the data, skip fetching entirely to prevent the 3.5s waterfall
    if (staticContent && staticCategories?.length > 0) return;

    const fetchData = async () => {
      const [cats, siteData] = await Promise.all([
        getCategories(),
        getSiteContent(),
      ]);
      setCategories(cats);
      setContent(siteData);
    };
    fetchData();
  }, [staticContent, staticCategories]);

  if (!content || !siteConfig) return <footer className="footer" style={{ minHeight: '400px' }}></footer>;

  const footer = content?.footer || { links: [], socialLinks: [] };
  const contact = siteConfig; // Use siteConfig for contact

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-top">
          {/* Brand column */}
          <div className="footer-brand">
            <Link href="/" aria-label="Ishta Crafts — Home" style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              {footer.logo ? (
                <img src={footer.logo} alt="Ishta Crafts Official Logo - Premier Indian Artisan Marketplace" style={{ height: 40, width: 'auto' }} />
              ) : (
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--fs-28)', fontWeight: 700, color: 'var(--secondary)' }}>Ishta Crafts</span>
              )}
            </Link>
            <p style={{ lineHeight: 1.6 }}>{footer.brandDescription || "Discover authentic Indian handicrafts directly from our master artisan collective. We bring centuries-old heritage crafts like Madhubani, Dhokra, and artisanal Macramé to your modern home."}</p>
            <address style={{ fontStyle: 'normal', marginTop: 'var(--space-3)', fontSize: 'var(--fs-13)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              {contact.address}
            </address>
            <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <a href={`https://wa.me/${contact.whatsapp || contact.phone}`} target="_blank" rel="noopener noreferrer" className="footer-link" style={{ fontSize: 'var(--fs-13)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <PhoneIcon size={14} /> WhatsApp: +91 77993 29591
              </a>
              <a href={`mailto:${contact.email}`} className="footer-link" style={{ fontSize: 'var(--fs-13)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MailIcon size={14} /> {contact.email}
              </a>
            </div>
            <div className="footer-newsletter mt-6">
              <input type="email" placeholder="Your email address" aria-label="Subscribe to newsletter" />
              <button className="btn btn-secondary btn-sm">Subscribe</button>
            </div>
            <div className="footer-socials mt-6">
              {(footer.socialLinks || []).map(s => {
                let href = s.href || '';
                
                // 1. Remove leading '#' if the user accidentally typed one (fixes the about:blank#blocked)
                if (href.startsWith('#')) {
                  href = href.substring(1);
                }
                
                // 2. Ensure it starts with http/https
                if (href && !href.startsWith('http')) {
                  href = `https://${href}`;
                }
                
                return (
                  <a 
                    key={s.platform} 
                    href={href || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="footer-social-btn" 
                    aria-label={s.platform} 
                    title={s.platform}
                  >
                    {s.platform === 'Instagram' && <InstagramIcon size={20} />}
                    {s.platform === 'Facebook' && <FacebookIcon size={20} />}
                    {s.platform === 'Pinterest' && <PinterestIcon size={20} />}
                    {s.platform === 'Twitter' && <TwitterIcon size={20} />}
                    {s.platform === 'YouTube' && <span style={{ fontSize: 12, fontWeight: 700 }}>YT</span>}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Shop */}
          <nav aria-label="Shop navigation">
            <h3 className="footer-heading">Shop</h3>
            <ul className="footer-links">
              {categories.map(cat => (
                <li key={cat.slug}>
                  <Link href={`/shop/${cat.slug}`} className="footer-link" aria-label={`Browse our collection of ${cat.label}`}>{cat.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/deals" className="footer-link" aria-label="View current deals and special offers">Deals & Offers</Link>
              </li>
              <li>
                <Link href="/about" className="footer-link" aria-label="Learn more about our artisan story and mission">Our Story</Link>
              </li>
              <li>
                <Link href="/about#artisans" className="footer-link" aria-label="Meet the master craftsmen behind our Indian handicrafts">Meet Artisans</Link>
              </li>
              <li>
                <Link href="/about#mission" className="footer-link" aria-label="Explore our mission for artisan empowerment and heritage preservation">Our Mission</Link>
              </li>
            </ul>
          </nav>

          {/* Dynamic Sections (from footer.links) */}
          {(footer.links || []).map((section) => (
            <nav key={section.title} aria-label={`${section.title} navigation`}>
              <h3 className="footer-heading">{section.title}</h3>
              <ul className="footer-links">
                {(section.items || []).map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="footer-link">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {footer.copyright}</p>
          <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <Link href="#" className="footer-link" style={{ opacity: 0.5, fontSize: 'var(--fs-13)' }}>Privacy Policy</Link>
            <Link href="#" className="footer-link" style={{ opacity: 0.5, fontSize: 'var(--fs-13)' }}>Terms of Service</Link>
            <Link href="#" className="footer-link" style={{ opacity: 0.5, fontSize: 'var(--fs-13)' }}>GI Tag Certified</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
