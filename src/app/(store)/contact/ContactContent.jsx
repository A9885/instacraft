'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Clock, Send, CheckCircle2, UserCheck } from 'lucide-react';
import { getSiteContent } from '@/lib/api';
import { useSiteConfig } from '@/store/SiteConfigContext';
import Link from 'next/link';

export default function ContactContent() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const { config: configData } = useSiteConfig();

const SHOP_ADDRESS = "Charminar, Hyderabad, Telangana, India";
const MAP_URL = "https://www.google.com/maps/search/Charminar,+Hyderabad";
const SHOP_KEYWORDS = "Authentic Indian Handicrafts, Artisan Marketplace, Hyderabad Artisans, Handcrafted Décor";

  useEffect(() => {
    const fetchContent = async () => {
      const siteData = await getSiteContent();
      
      if (siteData && configData) {
        setContent({
          ...siteData.contact,
          email: configData.email,
          phone: configData.phone,
          address: SHOP_ADDRESS, // Manually set to Charminar
          mapEmbed: MAP_URL
        });
      }
    };
    fetchContent();
  }, [configData]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    setTimeout(() => { 
      setLoading(false); 
      setSubmitted(true); 
    }, 1500);
  }

  if (!content) return <div className="section" style={{ minHeight: '80vh' }}></div>;

  const contactItems = [
    {
      icon: <Mail size={22} />,
      title: 'Email Us',
      value: content.email,
      href: `mailto:${content.email}`,
      desc: 'Inquiries within 24h',
      color: 'var(--primary)'
    },
    {
      icon: <Phone size={22} />,
      title: 'WhatsApp',
      value: '+91 77993 29591',
      href: `https://wa.me/${content.phone}`,
      desc: 'Direct Support Line',
      color: 'var(--whatsapp)'
    },
    {
      icon: <Clock size={22} />,
      title: 'Hours',
      value: 'Mon–Sat, 10–6 IST',
      href: '#',
      desc: 'Available for Chat',
      color: 'var(--secondary)'
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--surface-sunken)', minHeight: '100vh' }}>
      
      {/* ── PRE-HERO SEPARATOR ── */}
      <div style={{ height: '32px', backgroundColor: 'var(--surface-white)' }}></div>

      {/* ── PREMIUM HEADER SECTION ── */}
      <header className="section" style={{ 
        paddingTop: 'var(--space-12)', 
        paddingBottom: 'var(--space-16)', 
        backgroundColor: 'var(--surface-white)', 
        borderBottom: '1px solid var(--border-light)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Background Pattern */}
        <div style={{ 
          position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', 
          background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)',
          opacity: 0.08, pointerEvents: 'none'
        }}></div>

        <div className="container">
          <div className="section-header" style={{ maxWidth: '800px', textAlign: 'left', margin: 0 }}>
            <span className="overline" style={{ color: 'var(--primary)', letterSpacing: '0.2em' }}>{content.overline}</span>
            <h1 className="heading-lg" style={{ 
              fontSize: 'clamp(40px, 6vw, 64px)', 
              lineHeight: 1.1, 
              marginTop: 'var(--space-4)',
              color: 'var(--text-dark)'
            }}>
              Let&apos;s <span style={{ color: 'var(--primary)', fontWeight: 500 }}>Create</span> Something Special Together
            </h1>
            <p className="text-body" style={{ fontSize: 'var(--fs-20)', opacity: 0.8, maxWidth: '600px', marginTop: 'var(--space-6)' }}>
              {content.description}
            </p>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT GRID ── */}
      <main className="section" style={{ marginTop: '-60px', position: 'relative', zIndex: 2 }}>
        <div className="container">
          {/* TOP SECTION: Form + Contact Pills */}
          <div className="responsive-grid-2" style={{ gap: 'var(--space-8)', alignItems: 'start' }}>
            
            {/* Form Card */}
            <div className="card" style={{ 
              padding: 'var(--space-8)', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
              border: 'none',
              borderRadius: 'var(--border-radius-xl)',
              backgroundColor: 'var(--surface-white)'
            }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
                   <div style={{ 
                     width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(30, 215, 96, 0.1)', 
                     display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)',
                     color: 'var(--whatsapp)'
                   }}>
                     <CheckCircle2 size={48} />
                   </div>
                   <h2 className="heading-md mb-2">Message Delivered</h2>
                   <p className="text-muted">An artisan specialist will contact you very soon. Thank you for reaching out. Your vision matters to us.</p>
                   <button onClick={() => setSubmitted(false)} className="btn btn-outline mt-8">Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 className="heading-sm mb-8" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MessageSquare size={20} color="var(--primary)" />
                    Send us a digital letter
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--space-4)' }}>
                      <div className="form-group">
                        <label className="form-label">Honored Name</label>
                        <input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Atul Kumar" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Digital Address</label>
                        <input className="form-input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="name@email.com" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Inquiry Subject</label>
                      <select className="form-input form-select" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                        <option value="">Choose one...</option>
                        <option>Order History Inquiry</option>
                        <option>Custom Handcrafted Piece</option>
                        <option>Partner as Artisan</option>
                        <option>Logistics Support</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">How can we assist you?</label>
                      <textarea className="form-input form-textarea" rows={6} required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Share your thoughts or requirements..." />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ 
                      width: '100%', padding: 'var(--space-5)', fontSize: '16px', 
                      justifyContent: 'center', gap: 12, boxShadow: '0 8px 16px rgba(122, 31, 31, 0.2)'
                    }}>
                      {loading ? 'Sending to Ateliers...' : <><Send size={20} /> Send Inquiry</>}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Contact Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {contactItems.map(item => (
                <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer" className="card" style={{ 
                  textDecoration: 'none', transition: 'all 0.3s ease', border: '1px solid #fff',
                  backgroundColor: 'var(--surface-white)'
                }}>
                  <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 'var(--space-5)' }}>
                    <div style={{ 
                      width: 44, height: 44, borderRadius: '12px', backgroundColor: 'var(--surface-sunken)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color,
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>{item.title}</h4>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>{item.value}</p>
                    </div>
                  </div>
                </a>
              ))}
              
              {/* Trust Section */}
              <div className="card" style={{ padding: 'var(--space-6)', marginTop: 8, border: 'none', backgroundColor: 'var(--surface-white)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <CheckCircle2 size={16} /> Verified Artisan Direct
                </h4>
                <p className="text-body-sm" style={{ color: 'var(--black)', opacity: 0.85 }}>
                  Every inquiry is handled directly by our artisan team. No middleman, no delays. Pure Indian craftsmanship at your service.
                </p>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: Atelier + Artisan Row */}
          <div className="responsive-grid-2" style={{ gap: 'var(--space-8)', marginTop: 'var(--space-8)' }}>
              {/* Physical Address Card */}
              <div className="card" style={{ backgroundColor: 'var(--primary-dark)', color: 'var(--surface-white)', border: 'none', borderRadius: 'var(--border-radius-xl)' }}>
                <div className="card-body" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: '320px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-4)' }}>
                      <MapPin size={24} color="var(--secondary)" />
                      <h3 className="heading-sm" style={{ margin: 0, color: 'var(--surface-white)' }}>Main Atelier</h3>
                   </div>
                   <Link href={MAP_URL} target="_blank" style={{ textDecoration: 'none' }} aria-label={`View our atelier location at ${SHOP_ADDRESS} on Google Maps`}>
                     <p style={{ fontSize: '20px', fontWeight: 600, lineHeight: 1.4, color: 'var(--surface-white)', marginBottom: 'var(--space-8)', cursor: 'pointer' }}>
                        {SHOP_ADDRESS}
                     </p>
                   </Link>
                   <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
                     <Link href={MAP_URL} target="_blank" className="btn btn-secondary" style={{ minWidth: '200px' }}>
                        Get Directions →
                     </Link>
                   </div>
                </div>
              </div>

              {/* Artisan CTA Card */}
              <div className="card" style={{ border: '2px dashed var(--secondary)', background: 'var(--surface-white)', borderRadius: 'var(--border-radius-xl)' }}>
                <div className="card-body" style={{ padding: 'var(--space-8)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(198, 156, 63, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-dark)', margin: '0 auto var(--space-6)' }}>
                    <UserCheck size={32} />
                  </div>
                  <h3 className="heading-sm" style={{ color: 'var(--text-dark)', marginBottom: 12 }}>Join our Artisan Collective</h3>
                  <p className="text-body" style={{ fontSize: 'var(--fs-15)', marginBottom: 20 }}>Are you an independent creator? Let&apos;s bring your art to the world.</p>
                  <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <a href={`mailto:${content.email}`} className="btn btn-primary" style={{ minWidth: '200px' }}>
                      Apply as Partner
                    </a>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </main>

      {/* ── MAP PLACEHOLDER (CLICK TO OPEN) ── */}
      <section className="section" style={{ paddingBottom: 'var(--space-20)' }}>
        <div className="container">
          <Link href={MAP_URL} target="_blank" style={{ textDecoration: 'none' }}>
            <div style={{ 
              height: '400px', width: '100%', borderRadius: 'var(--border-radius-xl)', 
              overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '6px solid #fff',
              position: 'relative', cursor: 'pointer', backgroundColor: 'var(--surface-sunken)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 16,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url("https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop")',
              backgroundSize: 'cover', backgroundPosition: 'center'
            }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--primary)', 
                color: 'var(--surface-white)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(122, 31, 31, 0.3)'
              }}>
                <MapPin size={32} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 className="heading-sm" style={{ color: 'var(--text-dark)', marginBottom: 4 }}>Open Interactive Map</h3>
                <p className="text-muted" style={{ fontWeight: 600 }}>{SHOP_ADDRESS}</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 991px) {
          main .responsive-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
