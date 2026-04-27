/**
 * api.js — Shared data layer (Client-side / Shared)
 * handles fetch() calls to API routes.
 */

import { categories as defaultCategories } from "@/data/categories";
import {
  lsGetCategories,
} from "@/lib/dataStore";

// ── Helpers ───────────────────────────────────────────────────────────────────

const delay = (ms = 0) => new Promise((r) => setTimeout(r, ms));

// ── PRODUCTS ──────────────────────────────────────────────────────────────────

export async function getProducts(forceFresh = false, page = 1, limit = 1000) {
  const url = `/api/products?page=${page}&limit=${limit}${forceFresh ? "&fresh=1" : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.details || errorData.error || "Failed to fetch products");
  }
  return res.json();
}

export async function updateProduct(id, productData, idToken) {
  const res = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function deleteProduct(id, idToken) {
  const res = await fetch(`/api/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
}

export async function getProductById(id) {
  const res = await fetch(`/api/products/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function getFeaturedProducts() {
  const products = await getProducts();
  return products.filter(p => p.featured).slice(0, 8);
}

export async function searchProducts(q) {
  const products = await getProducts();
  q = q.toLowerCase();
  return products.filter(
    (p) =>
      p.type !== "service" &&
      (p.title.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        (p.description || "").toLowerCase().includes(q)),
  );
}

// ── CATEGORIES ────────────────────────────────────────────────────────────────

export async function getCategories() {
  await delay();
  return lsGetCategories(defaultCategories);
}

export async function getCategoryBySlug(slug) {
  await delay();
  const categories = lsGetCategories(defaultCategories);
  return categories.find((c) => c.slug === slug) || null;
}

// ── OFFERS ────────────────────────────────────────────────────────────────────

export async function getOffers(idToken, forceFresh = false, includeInactive = false) {
  const url = includeInactive ? "/api/offers?includeInactive=1" : "/api/offers/active";
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch offers");
  return res.json();
}

// ── COUPONS ───────────────────────────────────────────────────────────────────

export async function getCoupons(idToken, forceFresh = false) {
  const url = `/api/coupons${forceFresh ? "?fresh=1" : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch coupons");
  return res.json();
}

export async function validateCoupon(code) {
  try {
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });
    const data = await res.json();
    if (!res.ok) return { valid: false, message: data.message || "Invalid coupon code" };
    return { valid: true, coupon: data.coupon };
  } catch (error) {
    console.error("Coupon validation fetch error:", error);
    return { valid: false, message: "Error validating coupon. Please try again." };
  }
}

// ── CUSTOMERS / TESTIMONIALS ──────────────────────────────────────────────────

export async function getCustomers(idToken, forceFresh = false, page = 1, limit = 1000) {
  const url = `/api/customers?page=${page}&limit=${limit}${forceFresh ? "&fresh=1" : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

export async function getTestimonials(forceFresh = false) {
  const url = `/api/testimonials${forceFresh ? "?fresh=1" : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch testimonials");
  return res.json();
}

export async function updateTestimonials(testimonials, idToken) {
  const res = await fetch("/api/testimonials", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(testimonials),
  });
  if (!res.ok) throw new Error("Failed to update testimonials");
  return res.json();
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────────

export async function getDashboardAnalytics() {
  const res = await fetch("/api/admin/analytics");
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

// ── SITE CONFIG ───────────────────────────────────────────────────────────────

export async function getSiteConfig(forceFresh = false) {
  const url = `/api/site-config/public${forceFresh ? "?fresh=1" : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch site config");
  return res.json();
}

export async function updateSiteConfig(config, idToken) {
  const res = await fetch("/api/site-config", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error("Failed to update site config");
  return res.json();
}

// ── HERO SLIDES ───────────────────────────────────────────────────────────────

export async function getHeroSlides(forceFresh = false, includeInactive = false, idToken = null) {
  const url = `/api/hero-slides${includeInactive ? "?includeInactive=1" : ""}`;
  const headers = idToken ? { Authorization: `Bearer ${idToken}` } : {};
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch hero slides");
  return res.json();
}

export async function updateHeroSlides(slides, idToken) {
  const res = await fetch("/api/hero-slides", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(slides),
  });
  if (!res.ok) throw new Error("Failed to update hero slides");
  return res.json();
}

// ── SITE CONTENT ──────────────────────────────────────────────────────────────

export async function getSiteContent(forceFresh = false) {
  const url = `/api/site-content${forceFresh ? "?fresh=1" : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch site content");
  const data = await res.json();
  return data.siteContent;
}

export async function updateSiteContent(content, idToken) {
  const res = await fetch("/api/site-content", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ siteContent: content }),
  });
  if (!res.ok) throw new Error("Failed to update site content");
  return res.json();
}
