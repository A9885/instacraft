"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { 
  getHeroSlides, 
  updateHeroSlides, 
  getProducts,
  getSiteConfig,
  updateSiteConfig
} from '@/lib/api';
import { 
  Save, AlertCircle, CheckCircle2, 
  Image as ImageIcon, Upload, Trash2, 
  Plus, Monitor, Tag, Type, AlignLeft, Video, 
  Link as LinkIcon 
} from 'lucide-react';

export default function HeroSliderAdminPage() {
  const { user } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
  const [heroSlides, setHeroSlides] = useState([]);
  const [products, setProducts] = useState([]);
  const [productSort, setProductSort] = useState('name-asc');
  const [siteConfig, setSiteConfig] = useState(null);
  const [maxMbInput, setMaxMbInput] = useState(30);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    setHasMounted(true);
    const fetchData = async () => {
      if (!user) return;
      try {
        const idToken = await user.getIdToken();
        const [slidesData, productsData, configData] = await Promise.all([
          getHeroSlides(true, true, idToken),
          getProducts(true),
          getSiteConfig(true)
        ]);
        setHeroSlides(Array.isArray(slidesData) ? slidesData : []);
        setSiteConfig(configData);
        if (configData?.maxUploadSize) setMaxMbInput(configData.maxUploadSize);
        // Handle both old array format and new pagination object format
        const productList = Array.isArray(productsData) ? productsData : (productsData?.products || []);
        setProducts(productList);
      } catch (err) {
        console.error("Failed to fetch hero slider data:", err);
      }
    };
    fetchData();
  }, [user]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      
      // Save global upload limit if changed
      if (siteConfig && maxMbInput !== siteConfig.maxUploadSize) {
        await updateSiteConfig({ ...siteConfig, maxUploadSize: parseFloat(maxMbInput) }, idToken);
      }

      const slidesWithOrder = heroSlides.map((slide, idx) => ({
        ...slide,
        order: idx,
        active: slide.active !== undefined ? slide.active : true
      }));
      await updateHeroSlides(slidesWithOrder, idToken);
      setStatus({ type: 'success', message: 'Hero Slider and settings updated successfully!' });
      setTimeout(() => {
        setStatus({ type: '', message: '' });
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to update Hero Slider.' });
    }
  };

  const updateSlide = (index, field, value) => {
    const next = [...heroSlides];
    next[index] = { ...next[index], [field]: value };
    setHeroSlides(next);
  };

  const getSortedProducts = () => {
    return [...products].sort((a, b) => {
      if (productSort === 'name-asc') return a.title.localeCompare(b.title);
      if (productSort === 'name-desc') return b.title.localeCompare(a.title);
      if (productSort === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (productSort === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      return 0;
    });
  };

  const handleFileUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (file && user) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        setStatus({ type: 'info', message: 'Uploading file to local storage...' });
        const idToken = await user.getIdToken();
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${idToken}` },
          body: formData
        });
        
        const data = await res.json();
        
        if (res.ok && data.url) {
          callback(data.url);
          setStatus({ type: 'success', message: 'File uploaded successfully!' });
          setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } else {
          setStatus({ type: 'error', message: data.error || 'Upload failed' });
        }
      } catch (err) {
        console.error(err);
        setStatus({ type: 'error', message: 'Network error during upload' });
      }
    }
  };

  const addSlide = () => {
    const newSlide = {
      id: Date.now().toString(),
      title: 'New Slider Headline',
      subtitle: 'Premium Handicrafts',
      badge: 'New Collection',
      description: 'Discover our latest handcrafted items.',
      video: '/videos/hero-bg-default.mp4',
      poster: '/images/hero-poster-default.webp',
      productSlug: '',
      active: true,
      order: heroSlides.length
    };
    setHeroSlides([...heroSlides, newSlide]);
  };

  const deleteSlide = (index) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      setHeroSlides(heroSlides.filter((_, i) => i !== index));
    }
  };

  if (!hasMounted) {
    return (
      <div className="admin-page" style={{ opacity: 0 }}>
        {/* Safety mount check for hydration stability */}
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="flex-between flex-between-responsive mb-8">
        <div>
          <span className="overline">Store Interface</span>
          <h1 className="heading-lg"><span>Hero Slider Management</span></h1>
        </div>
        <div className="flex-responsive">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-sunken)', padding: '6px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginRight: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Video size={16} className="text-muted" />
              <span className="text-small" style={{ fontWeight: 600 }}>Max Upload:</span>
              <input 
                type="number" 
                className="form-input form-input-sm" 
                style={{ width: '70px', textAlign: 'center' }}
                value={maxMbInput}
                onChange={(e) => setMaxMbInput(e.target.value)}
              />
              <span className="text-small text-muted">MB</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-sunken)', padding: '4px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span className="text-small text-muted" style={{ fontWeight: 600 }}>Sort Products:</span>
            <select 
              className="form-input form-input-sm" 
              style={{ width: 'auto', border: 'none', background: 'transparent', padding: '0 8px' }}
              value={productSort}
              onChange={(e) => setProductSort(e.target.value)}
            >
              <option value="name-asc">A-Z</option>
              <option value="name-desc">Z-A</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
          <button className="btn btn-outline" onClick={addSlide} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} /> <span>Add Slide</span>
          </button>
          <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Save size={18} /> <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {status.message && (
        <div className={`badge ${status.type === 'success' ? 'badge-success' : 'badge-error'}`} style={{ width: '100%', padding: 'var(--space-3)', marginBottom: 'var(--space-6)', justifyContent: 'center', fontSize: 'var(--fs-14)' }}>
          {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {heroSlides.map((slide, idx) => (
          <section key={slide._id || slide.id} className="admin-card">
            <div className="flex-between mb-6">
              <h2 className="heading-sm" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Monitor size={20} /> <span>Slide #{idx + 1}</span>
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-sunken)', padding: '4px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <label className="text-small" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input 
                      type="checkbox" 
                      checked={slide.active !== false} 
                      onChange={e => updateSlide(idx, 'active', e.target.checked)}
                    />
                    <span>Active Status</span>
                  </label>
                </div>
                <button type="button" onClick={() => deleteSlide(idx)} className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}>
                  <Trash2 size={16} /> <span>Remove</span>
                </button>
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 'var(--space-8)' }}>
              {/* Left Column: Text Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label"><Tag size={14} /> Badge Text</label>
                  <input 
                    className="form-input" 
                    value={slide.badge || ''} 
                    onChange={e => updateSlide(idx, 'badge', e.target.value)} 
                    placeholder="e.g. Festival Deal - 40% OFF"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"><Type size={14} /> Subtitle</label>
                  <input 
                    className="form-input" 
                    value={slide.subtitle || ''} 
                    onChange={e => updateSlide(idx, 'subtitle', e.target.value)} 
                    placeholder="e.g. Limited Time Offer"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"><AlignLeft size={14} /> Headline (Title)</label>
                  <input 
                    className="form-input" 
                    value={slide.title || ''} 
                    onChange={e => updateSlide(idx, 'title', e.target.value)} 
                    placeholder="e.g. Buddha Meditation <span>Collection</span>"
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>Tip: Use &lt;span&gt; around words to make them gold.</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-input form-textarea" 
                    rows={4} 
                    value={slide.description || ''} 
                    onChange={e => updateSlide(idx, 'description', e.target.value)} 
                    placeholder="Tell your customers about this collection..."
                  />
                </div>
              </div>

              {/* Right Column: Media & Product */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label"><Video size={14} /> Background Video URL</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input className="form-input" value={slide.video || ''} onChange={e => updateSlide(idx, 'video', e.target.value)} />
                    <button type="button" className="btn btn-outline" onClick={() => document.getElementById(`hero-vid-${idx}`).click()}><Upload size={16} /></button>
                    <input id={`hero-vid-${idx}`} type="file" style={{ display: 'none' }} accept="video/*" onChange={(e) => handleFileUpload(e, (v) => updateSlide(idx, 'video', v))} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label"><ImageIcon size={14} /> Poster Image URL</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 100, height: 60, borderRadius: 4, background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                      {slide.poster ? <img src={slide.poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>No Image</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <input className="form-input form-input-sm mb-1" value={slide.poster || ''} onChange={e => updateSlide(idx, 'poster', e.target.value)} />
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => document.getElementById(`hero-poster-${idx}`).click()}><Upload size={14} /> Replace</button>
                      <input id={`hero-poster-${idx}`} type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, (v) => updateSlide(idx, 'poster', v))} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label"><LinkIcon size={14} /> Featured Product</label>
                  <select 
                    className="form-input" 
                    value={slide.productSlug || ''} 
                    onChange={e => updateSlide(idx, 'productSlug', e.target.value)}
                  >
                    <option value="">None (Select a Product)</option>
                    {getSortedProducts().map(p => (
                      <option key={p._id || p.slug} value={p.slug}>{p.title}</option>
                    ))}
                  </select>
                  <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>Choose which product card appears on this slide.</small>
                </div>
              </div>
            </div>
          </section>
        ))}

        {heroSlides.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border-color)' }}>
            <ImageIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
            <p className="text-body-lg" style={{ color: 'var(--text-muted)' }}>No hero slides found. Add your first banner to get started!</p>
            <button className="btn btn-primary mt-6" onClick={addSlide}><Plus size={18} /> Add Your First Slide</button>
          </div>
        )}
      </div>
    </div>
  );
}
