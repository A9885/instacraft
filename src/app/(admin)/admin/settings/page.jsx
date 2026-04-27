'use client';

import { useState, useEffect } from 'react';
import { 
  lsGetHomepage, lsSetHomepage, 
  lsGetCategories, lsSetCategories
} from '@/lib/dataStore';
import { 
  getSiteContent, updateSiteContent,
  getTestimonials, updateTestimonials,
  getSiteConfig, updateSiteConfig
} from '@/lib/api';
import { 
  Save, AlertCircle, CheckCircle2, Monitor, 
  Image as ImageIcon, Upload, MessageSquare, 
  Plus, Trash2, Info, Phone, Mail, Link as LinkIcon, Star, Truck 
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { useAuth } from '@/store/AuthContext';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('global');
  const [siteConfig, setSiteConfig] = useState(null);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [siteContent, setSiteContent] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    setHasMounted(true);
    const fetchData = async () => {
      try {
        const [siteData, testimonialsData, configData] = await Promise.all([
          getSiteContent(true),
          getTestimonials(true),
          getSiteConfig(true)
        ]);
        const mergeContent = (raw) => ({
          ...raw,
          about: {
            hero: { title: '', description: '', image: '', ...(raw?.about?.hero || {}) },
            mission: { title: '', text1: '', image: '', ...(raw?.about?.mission || {}) },
            artisans: {
              list: raw?.about?.artisans?.list || [],
              ...(raw?.about?.artisans || {}),
            },
            ...(raw?.about || {}),
          },
          contact: {
            overline: '', title: '', description: '',
            ...(raw?.contact || {}),
          },
          footer: {
            brandDescription: '', copyright: '', logo: '', socialLinks: [],
            ...(raw?.footer || {}),
          },
        });
        setSiteContent(mergeContent(siteData));
        setTestimonials(testimonialsData);
        setSiteConfig(configData);
        setCategories(lsGetCategories());
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      lsSetCategories(categories);
      
      await Promise.all([
        updateSiteContent(siteContent, token),
        updateTestimonials(testimonials, token),
        updateSiteConfig(siteConfig, token)
      ]);
      
      setStatus({ type: 'success', message: 'All settings and content saved!' });
      setTimeout(() => {
        setStatus({ type: '', message: '' });
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to save settings.' });
    }
  };

  const updateTestimonial = (index, field, value) => {
    const next = [...testimonials];
    next[index] = { ...next[index], [field]: value };
    setTestimonials(next);
  };

  const addTestimonial = () => {
    setTestimonials([...testimonials, { id: Date.now(), name: 'New Customer', city: 'City', text: 'Amazing product!', rating: 5, avatar: '/images/avatar-placeholder.webp', product: 'Item Name' }]);
  };

  const deleteTestimonial = (index) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  };

  const updateCategory = (index, field, value) => {
    const next = [...categories];
    next[index] = { ...next[index], [field]: value };
    setCategories(next);
  };

  const updateAbout = (section, field, value) => {
    setSiteContent(prev => ({
      ...prev,
      about: {
        ...prev.about,
        [section]: {
          ...prev.about[section],
          [field]: value
        }
      }
    }));
  };

  const addArtisan = () => {
    const newList = [...(siteContent.about.artisans.list || []), { name: 'New Artisan', craft: 'Craft type', story: 'Short story about the artisan...', avatar: '' }];
    setSiteContent({
      ...siteContent, 
      about: { ...siteContent.about, artisans: { ...siteContent.about.artisans, list: newList } }
    });
  };

  const deleteArtisan = (index) => {
    const newList = siteContent.about.artisans.list.filter((_, i) => i !== index);
    setSiteContent({
      ...siteContent, 
      about: { ...siteContent.about, artisans: { ...siteContent.about.artisans, list: newList } }
    });
  };

  const updateContact = (field, value) => {
    setSiteConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateContactPage = (field, value) => {
    setSiteContent(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  const updateFooter = (field, value) => {
    setSiteContent(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        [field]: value
      }
    }));
  };

  const handleFileUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        setStatus({ type: 'info', message: 'Uploading image to local storage...' });
        const idToken = await user?.getIdToken();
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${idToken}` },
          body: formData
        });
        
        const data = await res.json();
        
        if (res.ok && data.url) {
          callback(data.url);
          setStatus({ type: 'success', message: 'Image uploaded successfully!' });
          setTimeout(() => setStatus({ type: '', message: '' }), 2000);
        } else {
          setStatus({ type: 'error', message: data.error || 'Upload failed' });
        }
      } catch (err) {
        console.error(err);
        setStatus({ type: 'error', message: 'Network error during upload' });
      }
    }
  };

  if (!hasMounted || !siteContent || !siteConfig) return <div className="admin-page" style={{ opacity: 0 }}></div>;

  return (
    <div className="admin-page">
      <div className="flex-between flex-between-responsive mb-8">
        <div>
          <span className="overline">Global Controls</span>
          <h1 className="heading-lg"><span>Store & Content Management</span></h1>
        </div>
        <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Save size={18} /> <span>Save All Changes</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-2)' }}>
        {['global', 'about', 'contact', 'footer'].map(tab => (
          <button 
            key={tab} 
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ textTransform: 'capitalize' }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {status.message && (
        <div className={`badge ${status.type === 'success' ? 'badge-success' : 'badge-error'}`} style={{ width: '100%', padding: 'var(--space-3)', marginBottom: 'var(--space-6)', justifyContent: 'center', fontSize: 'var(--fs-14)' }}>
          {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {activeTab === 'global' && (
          <>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <section className="admin-card">
                <h2 className="heading-sm mb-6" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Monitor size={20} /> <span>Homepage & Banner</span>
                </h2>
                <div className="form-group mb-6">
                  <label className="form-label">Promo Banner Text</label>
                  <textarea className="form-input form-textarea" rows={3} value={siteConfig.promoBannerText} onChange={e => setSiteConfig({...siteConfig, promoBannerText: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={siteConfig.promoBannerActive} onChange={e => setSiteConfig({...siteConfig, promoBannerActive: e.target.checked})} className="filter-checkbox" />
                    <span className="text-body" style={{ fontWeight: 600 }}>Show Top Banner</span>
                  </label>
                </div>
              </section>

              <section className="admin-card" style={{ marginTop: 'var(--space-6)' }}>
                <h2 className="heading-sm mb-6" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Truck size={20} /> <span>Shipping Configuration</span>
                </h2>
                <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
                  <div className="form-group">
                    <label className="form-label">Shipping Fee (₹)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 199" 
                      value={siteConfig.shippingFee ?? ''} 
                      onChange={e => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setSiteConfig({...siteConfig, shippingFee: val});
                      }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Free Shipping Threshold (₹)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 1000" 
                      value={siteConfig.freeShippingThreshold ?? ''} 
                      onChange={e => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setSiteConfig({...siteConfig, freeShippingThreshold: val});
                      }} 
                    />
                  </div>
                </div>
                <div className="badge badge-info mt-4" style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--surface-sunken)', opacity: 0.8, marginTop: 'var(--space-4)' }}>
                  <span style={{ fontSize: 11, lineHeight: 1.4 }}>
                    <strong>Note:</strong> If left empty, sensible defaults will apply automatically (Fee = ₹199, Threshold = ₹1000). 
                    To offer unconditional free shipping, enter explicitly <strong>0</strong> in the Shipping Fee field.
                  </span>
                </div>
              </section>
            </div>

            <section className="admin-card">
              <div className="flex-between mb-6">
                <h2 className="heading-sm"><MessageSquare size={20} /> <span>Testimonials</span></h2>
                <button type="button" className="btn btn-outline btn-sm" onClick={addTestimonial}><Plus size={16} /> Add</button>
              </div>
              <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
                {testimonials.map((t, idx) => (
                  <div key={t.id} className="admin-card" style={{ background: 'var(--surface-sunken)', position: 'relative' }}>
                    <button type="button" onClick={() => deleteTestimonial(idx)} style={{ position: 'absolute', top: 8, right: 8, color: 'var(--error)', background: 'none', border: 'none' }}><Trash2 size={16} /></button>
                    
                    <div className="flex gap-4 mb-3">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: 'var(--surface)', margin: '0 auto 4px' }}>
                          {t.avatar ? <img src={t.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                        </div>
                        <button type="button" className="btn btn-ghost btn-sm" style={{ padding: 0, fontSize: 9 }} onClick={() => document.getElementById(`t-avatar-${idx}`).click()}>Edit</button>
                        <input id={`t-avatar-${idx}`} type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, (v) => updateTestimonial(idx, 'avatar', v))} />
                      </div>
                      <input className="form-input form-input-sm" style={{ flex: 1 }} value={t.name} onChange={e => updateTestimonial(idx, 'name', e.target.value)} />
                    </div>
                    
                    <textarea className="form-input form-textarea" rows={2} style={{ fontSize: 'var(--fs-12)' }} value={t.text} onChange={e => updateTestimonial(idx, 'text', e.target.value)} />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'about' && (
          <>
            <div className="grid grid-2" style={{ gap: 'var(--space-8)' }}>
              <section className="admin-card">
                <h2 className="heading-sm mb-6"><Info size={20} /> <span>Hero Section</span></h2>
                <div className="form-group mb-4">
                  <label className="form-label">Hero Title</label>
                  <input className="form-input" value={siteContent.about.hero.title} onChange={e => updateAbout('hero', 'title', e.target.value)} />
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Description</label>
                  <textarea className="form-input form-textarea" rows={4} value={siteContent.about.hero.description} onChange={e => updateAbout('hero', 'description', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hero Banner (Optional)</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 80, height: 50, borderRadius: 4, background: 'var(--black)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      {siteContent.about.hero.image && <img src={siteContent.about.hero.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <input className="form-input form-input-sm mb-1" placeholder="Image URL" value={siteContent.about.hero.image || ''} onChange={e => updateAbout('hero', 'image', e.target.value)} />
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => document.getElementById('about-hero-img').click()}><Upload size={14} /> Upload</button>
                      <input id="about-hero-img" type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, (v) => updateAbout('hero', 'image', v))} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="admin-card">
                <h2 className="heading-sm mb-6"><Star size={20} /> <span>Mission Section</span></h2>
                <div className="form-group mb-4">
                  <label className="form-label">Mission Title</label>
                  <input className="form-input" value={siteContent.about.mission.title} onChange={e => updateAbout('mission', 'title', e.target.value)} />
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Section Image</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 4, background: 'var(--black)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      {siteContent.about.mission.image ? <img src={siteContent.about.mission.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                    </div>
                    <div style={{ flex: 1 }}>
                      <input className="form-input form-input-sm mb-1" value={siteContent.about.mission.image} onChange={e => updateAbout('mission', 'image', e.target.value)} />
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => document.getElementById('about-mission-img').click()} style={{ gap: 6 }}><Upload size={14} /> Replace Image</button>
                      <input id="about-mission-img" type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, (v) => updateAbout('mission', 'image', v))} />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Main Mission Text</label>
                  <textarea className="form-input form-textarea" rows={3} value={siteContent.about.mission.text1} onChange={e => updateAbout('mission', 'text1', e.target.value)} />
                </div>
              </section>
            </div>

            <section className="admin-card">
              <div className="flex-between mb-6">
                <h2 className="heading-sm"><span>Meet Our Artisans</span></h2>
                <button type="button" className="btn btn-outline btn-sm" onClick={addArtisan}><Plus size={16} /> Add</button>
              </div>
              <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
                {siteContent.about.artisans.list.map((a, idx) => (
                  <div key={idx} className="admin-card" style={{ background: 'var(--surface-sunken)', position: 'relative' }}>
                    <button type="button" onClick={() => deleteArtisan(idx)} style={{ position: 'absolute', top: 8, right: 8, color: 'var(--error)', background: 'none', border: 'none' }}><Trash2 size={16} /></button>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--space-3)' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', background: 'var(--surface)' }}>
                          {a.avatar ? <img src={a.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                        </div>
                        <button type="button" className="btn btn-ghost btn-sm" style={{ padding: 0, fontSize: 10 }} onClick={() => document.getElementById(`art-avatar-${idx}`).click()}>Change</button>
                        <input id={`art-avatar-${idx}`} type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => {
                          handleFileUpload(e, (v) => {
                            const newList = [...siteContent.about.artisans.list];
                            newList[idx].avatar = v;
                            setSiteContent({...siteContent, about: {...siteContent.about, artisans: {...siteContent.about.artisans, list: newList}}});
                          });
                        }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="form-group mb-2"><label className="form-label text-small">Name</label><input className="form-input form-input-sm" value={a.name} onChange={e => {
                          const newList = [...siteContent.about.artisans.list];
                          newList[idx].name = e.target.value;
                          setSiteContent({...siteContent, about: {...siteContent.about, artisans: {...siteContent.about.artisans, list: newList}}});
                        }} /></div>
                        <div className="form-group"><label className="form-label text-small">Craft</label><input className="form-input form-input-sm" value={a.craft} onChange={e => {
                          const newList = [...siteContent.about.artisans.list];
                          newList[idx].craft = e.target.value;
                          setSiteContent({...siteContent, about: {...siteContent.about, artisans: {...siteContent.about.artisans, list: newList}}});
                        }} /></div>
                      </div>
                    </div>
                    <div className="form-group"><label className="form-label text-small">Story</label><textarea className="form-input form-textarea" rows={3} style={{ fontSize: 'var(--fs-12)' }} value={a.story} onChange={e => {
                      const newList = [...siteContent.about.artisans.list];
                      newList[idx].story = e.target.value;
                      setSiteContent({...siteContent, about: {...siteContent.about, artisans: {...siteContent.about.artisans, list: newList}}});
                    }} /></div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'contact' && (
          <section className="admin-card" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="grid grid-2 mb-8" style={{ gap: 'var(--space-8)' }}>
              {/* Page Labels (SiteContent) */}
              <div>
                <h2 className="heading-sm mb-6"><span>Page Content</span></h2>
                <div className="form-group mb-4">
                  <label className="form-label">Contact Page Overline</label>
                  <input className="form-input" value={siteContent.contact.overline} onChange={e => updateContactPage('overline', e.target.value)} />
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Main Title</label>
                  <input className="form-input" value={siteContent.contact.title} onChange={e => updateContactPage('title', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description Under Title</label>
                  <textarea className="form-input form-textarea" rows={3} value={siteContent.contact.description} onChange={e => updateContactPage('description', e.target.value)} />
                </div>
              </div>

              {/* Master Contact Info (SiteConfig) */}
              <div>
                <h2 className="heading-sm mb-6"><Phone size={20} /> <span>Store Contact Info</span></h2>
                <div className="form-group mb-4">
                  <label className="form-label">Office/Store Address</label>
                  <textarea className="form-input form-textarea" rows={3} value={siteConfig.address} onChange={e => updateContact('address', e.target.value)} />
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">WhatsApp Number</label>
                  <input className="form-input" value={siteConfig.phone} onChange={e => updateContact('phone', e.target.value)} />
                </div>
                <div className="form-group mb-4">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" value={siteConfig.email} onChange={e => updateContact('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Map Link (Optional)</label>
                  <input className="form-input" value={siteConfig.mapEmbed || ''} onChange={e => updateContact('mapEmbed', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="badge badge-info" style={{ width: '100%', justifyContent: 'center', background: 'var(--surface-sunken)', opacity: 0.8 }}>
              <span style={{ fontSize: 11 }}>Note: Changes made to "Store Contact Info" will also update the Footer and Homepage Banner.</span>
            </div>
          </section>
        )}

        {activeTab === 'footer' && (
          <section className="admin-card" style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 className="heading-sm mb-6"><Monitor size={20} /> <span>Footer Configuration</span></h2>
            <div className="form-group mb-6">
              <label className="form-label">Brand Description</label>
              <textarea className="form-input form-textarea" rows={3} value={siteContent.footer.brandDescription} onChange={e => updateFooter('brandDescription', e.target.value)} />
            </div>
            <div className="grid grid-2 mb-6" style={{ gap: 'var(--space-6)' }}>
              <div className="form-group">
                <label className="form-label">Brand Logo</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 4, background: 'var(--surface-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    {siteContent.footer.logo ? <img src={siteContent.footer.logo} alt="" style={{ width: '100%', height: 'auto' }} /> : <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>No Logo</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input className="form-input form-input-sm mb-1" placeholder="Logo Image URL" value={siteContent.footer.logo || ''} onChange={e => updateFooter('logo', e.target.value)} />
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => document.getElementById('footer-logo-img').click()} style={{ gap: 6 }}><Upload size={14} /> Upload Logo</button>
                    <input id="footer-logo-img" type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, (v) => updateFooter('logo', v))} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Copyright Text</label>
                <input className="form-input" value={siteContent.footer.copyright} onChange={e => updateFooter('copyright', e.target.value)} />
              </div>
            </div>

            <div className="divider" />
            <h3 className="heading-sm mb-4">Social Links</h3>
            <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
              {siteContent.footer.socialLinks.map((s, idx) => (
                <div key={s.platform} className="form-group">
                  <label className="form-label">{s.platform} URL</label>
                  <input className="form-input" value={s.href} onChange={e => {
                    const next = [...siteContent.footer.socialLinks];
                    next[idx].href = e.target.value;
                    updateFooter('socialLinks', next);
                  }} />
                </div>
              ))}
            </div>
          </section>
        )}

      </form>
    </div>
  );
}
