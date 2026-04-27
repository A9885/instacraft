"use client";

/**
 * DynamicHomePage — Client wrapper for the homepage product sections.
 *
 * The main (store)/page.jsx is a Server Component so it can do fast SSR.
 * This component hydrates the dynamic sections (featured products, promo banner)
 * from localStorage after mount, so admin changes are immediately reflected.
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import { ArrowRightIcon } from "@/components/common/Icons";
import { CUSTOM_FEATURES } from "@/lib/constants";
import { getTestimonials } from "@/lib/api";
import { useSiteConfig } from "@/store/SiteConfigContext";
import { FadeIn, FadeInStagger, ScrollFade } from "@/components/animations/Reveal";

// ── REUSABLE CATEGORY SLIDER COMPONENT ───────────────────────────────────────
// Moved outside to ensure stable component identity and avoid hook mismatches
function CategorySection({
  id,
  title,
  overline,
  description,
  products,
  link,
  bgSunken = false,
}) {
  if (!products || products.length === 0) return null;

  return (
    <ScrollFade>
      <section
        className={`section ${bgSunken ? "bg-surface-sunken" : ""}`}
        aria-labelledby={`${id}-title`}
      >
        <div className="container">
          <div className="flex-between mb-8" style={{ alignItems: "flex-end" }}>
            <div>
              <span className="overline">{overline}</span>
              <h2 id={`${id}-title`} className="heading-lg">
                {title}
              </h2>
              <p className="text-body" style={{ marginTop: 8 }}>
                {description}
              </p>
            </div>
            <Link
              href={link}
              style={{
                color: "var(--primary)",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "var(--fs-14)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Explore More <ArrowRightIcon size={16} />
            </Link>
          </div>
          <ProductGrid products={products.slice(0, 8)} layout="row" />
        </div>
      </section>
    </ScrollFade>
  );
}

export default function DynamicHomePage({
  staticAllProducts = [],
  staticFeatured = [],
  staticTestimonials = [],
  staticCategories = [],
  staticConfig = null,
}) {
  const [featured, setFeatured] = useState(staticFeatured);
  const [wallHangings, setWallHangings] = useState([]);
  const [tableTop, setTableTop] = useState([]);
  const [combos, setCombos] = useState([]);
  const [giftItems, setGiftItems] = useState([]);
  const { config: siteConfig } = useSiteConfig();
  const [testimonials, setTestimonials] = useState(staticTestimonials);
  const [customHeroImage, setCustomHeroImage] = useState(
    CUSTOM_FEATURES[0]?.image || "",
  );

  useEffect(() => {
    // 1. Best Sellers (Top Rated, Excluding Services)
    const topRated = [...staticAllProducts]
      .filter((p) => p.type !== "service")
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 8);
    setFeatured(topRated);

    // 2. Categories
    setWallHangings(staticAllProducts.filter((p) => p.category === "wall-hangings"));
    setTableTop(staticAllProducts.filter((p) => p.category === "table-top-mount"));
    setCombos(staticAllProducts.filter((p) => p.category === "wall-table-combo"));
    setGiftItems(staticAllProducts.filter((p) => p.category === "gift-items"));

    const fetchLiveTestimonials = async () => {
      try {
        const tData = await getTestimonials();
        if (tData && tData.length > 0) setTestimonials(tData);
      } catch (err) {
        console.error("Testimonial fetch error:", err);
      }
    };

    const fetchLiveContent = async () => {
      try {
        const res = await fetch("/api/site-content");
        const data = await res.json();
        if (data.siteContent?.customCreationsHero) {
          setCustomHeroImage(data.siteContent.customCreationsHero);
        }
      } catch (err) {
        console.error("Site content fetch error:", err);
      }
    };

    fetchLiveTestimonials();
    fetchLiveContent();
  }, [staticAllProducts.length]); // Use length for stability if the array reference itself is unstable

  return (
    <>
      {/* ── BEST SELLERS ── */}
      <CategorySection
        id="featured"
        title="Best Sellers"
        overline="Handpicked for You"
        description="Our most loved handcrafted pieces — treasured by thousands"
        products={featured}
        link="/shop"
      />

      {/* ── WALL HANGINGS ── */}
      <CategorySection
        id="wall-hangings"
        title={
          staticCategories.find((c) => c.slug === "wall-hangings")?.label ||
          "Wall Hangings"
        }
        overline="Decor for Your Walls"
        description={
          staticCategories.find((c) => c.slug === "wall-hangings")?.description
        }
        products={wallHangings}
        link="/shop/wall-hangings"
        bgSunken={true}
      />

      {/* ── TABLE TOP / DÉCORS ── */}
      <CategorySection
        id="table-top"
        title={
          staticCategories.find((c) => c.slug === "table-top-mount")?.label ||
          "Table Top / Décors"
        }
        overline="Art for Your Surfaces"
        description={
          staticCategories.find((c) => c.slug === "table-top-mount")
            ?.description
        }
        products={tableTop}
        link="/shop/table-top-mount"
      />

      {/* ── WALL & TABLE COMBO ── */}
      <CategorySection
        id="combos"
        title={
          staticCategories.find((c) => c.slug === "wall-table-combo")?.label ||
          "Wall & Table Combo"
        }
        overline="Perfectly Paired Sets"
        description={
          staticCategories.find((c) => c.slug === "wall-table-combo")
            ?.description
        }
        products={combos}
        link="/shop/wall-table-combo"
        bgSunken={true}
      />

      {/* Gift Items section removed */}

      {/* ── CUSTOM PHOTO FRAMES SPOTLIGHT ── */}
      {CUSTOM_FEATURES.length > 0 &&
        (() => {
          const feature = CUSTOM_FEATURES[0];
          return (
            <ScrollFade>
              <section
                className="section bg-surface-sunken"
                aria-labelledby="custom-section-title"
              >
                <div className="container">
                  <div className="section-header">
                    <span className="overline">Made Just for You</span>
                    <h2 id="custom-section-title" className="heading-lg">
                      {feature.title}
                    </h2>
                    <p className="text-body">
                      Commission divine idols of your choice — any deity, any
                      size, any finish.
                    </p>
                  </div>

                  {/* Two-column spotlight — responsive */}
                  <style>{`
                    .custom-spotlight-card {
                      display: grid;
                      grid-template-columns: 1fr 1fr;
                      gap: var(--space-8);
                      align-items: center;
                      max-width: 900px;
                      margin: 0 auto;
                      background: var(--surface);
                      border-radius: 20px;
                      overflow: hidden;
                      border: 1px solid var(--border);
                      box-shadow: 0 8px 40px rgba(0,0,0,0.07);
                    }
                    .custom-spotlight-img {
                      position: relative;
                      min-height: 360px;
                    }
                    @media (max-width: 600px) {
                      .custom-spotlight-card {
                        grid-template-columns: 1fr;
                        gap: 0;
                      }
                      .custom-spotlight-img {
                        min-height: 260px;
                      }
                      .custom-spotlight-content {
                        padding: var(--space-6) var(--space-5) !important;
                      }
                    }
                  `}</style>
                  <div className="custom-spotlight-card">
                    {/* Image column */}
                    <Link
                      href="/shop/custom-creations"
                      className="custom-spotlight-img"
                      style={{ display: "block", cursor: "pointer" }}
                    >
                      <Image
                        src={customHeroImage || feature.image}
                        alt={feature.title}
                        fill
                        sizes="(max-width: 600px) 100vw, 50vw"
                        style={{ objectFit: "cover" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(135deg, rgba(139,0,0,0.25) 0%, transparent 60%)",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: 16,
                          left: 16,
                          background: "var(--secondary)",
                          color: "#fff",
                          fontSize: "var(--fs-12)",
                          fontWeight: 700,
                          padding: "4px 12px",
                          borderRadius: 999,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Custom
                      </span>
                    </Link>

                    {/* Content column */}
                    <div
                      className="custom-spotlight-content"
                      style={{
                        padding: "var(--space-10) var(--space-8)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--space-4)",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 54,
                          height: 54,
                          borderRadius: 14,
                          background:
                            "linear-gradient(135deg, var(--primary), var(--secondary))",
                          marginBottom: "var(--space-2)",
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" />
                        </svg>
                      </span>
                      <h3
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "var(--fs-24)",
                          fontWeight: 800,
                          color: "var(--text-dark)",
                          lineHeight: 1.2,
                        }}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className="text-body"
                        style={{
                          lineHeight: "var(--lh-loose)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {feature.description}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          flexWrap: "wrap",
                          margin: "var(--space-2) 0",
                        }}
                      >
                        {["Brass", "Bronze", "Aluminium"].map((m) => (
                          <span key={m} className="badge badge-secondary">
                            {m}
                          </span>
                        ))}
                      </div>
                      <Link
                        href="/shop/custom-creations"
                        className="btn btn-primary"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          alignSelf: "flex-start",
                        }}
                        aria-label={`${feature.ctaLabel} — ${feature.title}`}
                      >
                        {feature.ctaLabel} <ArrowRightIcon size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            </ScrollFade>
          );
        })()}

      {/* ── TESTIMONIALS ── */}
      <ScrollFade>
        <section className="section" aria-labelledby="testimonials-title">
          <div className="container">
            <div className="section-header">
              <span className="overline">Customer Love</span>
              <h2 id="testimonials-title" className="heading-lg">
                What Our Customers Say
              </h2>
            </div>
            <FadeInStagger className="grid grid-3">
              {testimonials.map((t) => (
                <FadeIn key={t.id}>
                  <blockquote className="testimonial-card">
                    <div
                      className="stars mb-3"
                      aria-label={`${t.rating} out of 5 stars`}
                    >
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill="var(--secondary)"
                          color="var(--secondary)"
                        />
                      ))}
                    </div>
                    <p className="testimonial-text">{t.text}</p>
                    <footer className="testimonial-author">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        width={80}
                        height={80}
                        className="testimonial-avatar"
                      />
                      <div>
                        <cite
                          style={{
                            fontStyle: "normal",
                            fontWeight: 600,
                            fontSize: "var(--fs-15)",
                            color: "var(--text-dark)",
                            display: "block",
                          }}
                        >
                          {t.name}
                        </cite>
                        <span className="text-muted">
                          {t.city} · Bought: {t.product}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </FadeIn>
              ))}
            </FadeInStagger>
          </div>
        </section>
      </ScrollFade>
    </>
  );
}
