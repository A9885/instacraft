/**
 * dataStore.js — Client-side localStorage bridge (Single Source of Truth)
 *
 * Static data files (/data/*.js) provide the DEFAULT seed values only.
 * Every admin mutation is written here; the frontend reads from here.
 */

import { siteConfig } from "@/data/siteConfig";

// ── Storage Keys ──────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  PRODUCTS:     'bh_products',
  CATEGORIES:   'bh_categories',
  OFFERS:       'bh_offers',
  COUPONS:      'bh_coupons',
  HOMEPAGE:     'bh_homepage',
  HERO_SLIDES:  'bh_hero_slides',
  TESTIMONIALS: 'bh_testimonials',
  SITECONTENT:  'bh_site_content',
  SEEDED:       'bh_seeded_v7',   // bumped for default images update
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function isBrowser() {
  return typeof window !== 'undefined';
}

function lsRead(key) {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function lsWrite(key, data) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
  }
}

// ── Seed ─────────────────────────────────────────────────────────────────────
export function seedStoreIfNeeded({ products, categories, offers, coupons, heroSlides, testimonials, siteContent }) {
  if (!isBrowser()) return;
  if (lsRead(STORAGE_KEYS.SEEDED)) return;

  lsWrite(STORAGE_KEYS.PRODUCTS,     products);
  lsWrite(STORAGE_KEYS.CATEGORIES,   categories);
  lsWrite(STORAGE_KEYS.OFFERS,       offers);
  lsWrite(STORAGE_KEYS.COUPONS,      coupons);
  lsWrite(STORAGE_KEYS.HERO_SLIDES,  heroSlides);
  lsWrite(STORAGE_KEYS.TESTIMONIALS, testimonials);
  lsWrite(STORAGE_KEYS.SITECONTENT,  siteContent);
  lsWrite(STORAGE_KEYS.SEEDED, true);
}

// ── CRUD Operations ──────────────────────────────────────────────────────────

export function lsGetProducts(fallback = []) { return lsRead(STORAGE_KEYS.PRODUCTS) ?? fallback; }
export function lsSetProducts(data) { lsWrite(STORAGE_KEYS.PRODUCTS, data); }

export function lsGetCategories(fallback = []) { return lsRead(STORAGE_KEYS.CATEGORIES) ?? fallback; }
export function lsSetCategories(data) { lsWrite(STORAGE_KEYS.CATEGORIES, data); }

export function lsGetOffers(fallback = []) { return lsRead(STORAGE_KEYS.OFFERS) ?? fallback; }
export function lsSetOffers(data) { lsWrite(STORAGE_KEYS.OFFERS, data); }

export function lsGetCoupons(fallback = []) { return lsRead(STORAGE_KEYS.COUPONS) ?? fallback; }
export function lsSetCoupons(data) { lsWrite(STORAGE_KEYS.COUPONS, data); }

export function lsGetHeroSlides(fallback = []) { return lsRead(STORAGE_KEYS.HERO_SLIDES) ?? fallback; }
export function lsSetHeroSlides(data) { lsWrite(STORAGE_KEYS.HERO_SLIDES, data); }

export function lsGetTestimonials(fallback = []) { return lsRead(STORAGE_KEYS.TESTIMONIALS) ?? fallback; }
export function lsSetTestimonials(data) { lsWrite(STORAGE_KEYS.TESTIMONIALS, data); }

export function lsGetSiteContent(fallback = null) { return lsRead(STORAGE_KEYS.SITECONTENT) ?? fallback; }
export function lsSetSiteContent(data) { lsWrite(STORAGE_KEYS.SITECONTENT, data); }

export function lsGetHomepage() {
  return lsRead(STORAGE_KEYS.HOMEPAGE) ?? {
    promoBannerText: 'Special Offer: Get FLAT 40% OFF!',
    promoBannerActive: true,
    email: 'info@ishtacrafts.in',
    phone: '9198XXX XXXX',
    address: 'Jaipur, Rajasthan'
  };
}
export function lsSetHomepage(data) { lsWrite(STORAGE_KEYS.HOMEPAGE, data); }

export function lsValidateCoupon(code, fallbackCoupons = []) {
  const coupons = lsGetCoupons(fallbackCoupons);
  const coupon  = coupons.find(c => c.code === code && c.active);
  if (!coupon) return { valid: false, message: 'Invalid coupon' };
  return { valid: true, coupon };
}
