"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useCart } from "@/store/CartContext";
import { formatPrice } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import {
  TagIcon,
  CartIcon,
  StarIcon,
  ArrowRightIcon,
} from "@/components/common/Icons";

export default function HeroSlider({ products, initialSlides = [] }) {
  const [current, setCurrent] = useState(0);
  const [heroSlides, setHeroSlides] = useState(initialSlides);
  const { addItem } = useCart();

  // If server props update (e.g. from Admin revalidation), refresh the state
  useEffect(() => {
    setHeroSlides(initialSlides);
  }, [initialSlides]);

  // Since the server cache is fixed, initialSlides always has full data instantly.
  // We no longer need a dedicated background fetch!

  const nextSlide = useCallback(() => {
    if (heroSlides.length === 0) return;
    setCurrent((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  }, [heroSlides.length]);

  const prevSlide = () => {
    if (heroSlides.length === 0) return;
    setCurrent((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide, heroSlides.length]);

  if (heroSlides.length === 0) {
    return (
      <div
        className="hero-slider"
        style={{
          minHeight: "300px",
          maxHeight: "600px",
          height: "60vh",
          background: "var(--surface-sunken)",
        }}
      ></div>
    );
  }

  const currentSlide = heroSlides[current] || {};
  const featuredProduct = products?.find(
    (p) => p.slug === currentSlide.productSlug,
  );

  const handleAddToCart = () => {
    if (featuredProduct) {
      addItem(featuredProduct);
    }
  };

  return (
    <section className="hero-slider">
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id || index}
          className={`hero-slide ${index === current ? "active" : ""}`}
        >
          {index === current && (
            <video
              key={slide.video}
              src={slide.video}
              poster={slide.poster}
              className="hero-video-bg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          )}
          <div className="hero-overlay" />

          <div className="hero-slider-container">
            <div className="hero-slider-content">
              <span className="hero-slider-badge">
                <TagIcon size={14} /> {slide.badge}
              </span>
              <span className="hero-slider-subtitle">{slide.subtitle}</span>
              <h1
                className="hero-slider-title"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.title) }}
              />
              <p className="hero-slider-desc">{slide.description}</p>

              <div className="hero-slider-actions">
                <Link
                  href="/deals"
                  className="btn btn-primary btn-lg"
                  style={{
                    background: "var(--secondary)",
                    color: "var(--text-dark)",
                    border: "none",
                    gap: 8,
                  }}
                >
                  <CartIcon size={20} /> Grab Deal
                </Link>
                <Link
                  href={`/product/${slide.productSlug}`}
                  className="btn btn-outline btn-lg"
                  style={{
                    borderColor: "rgba(255,255,255,0.4)",
                    color: "#fff",
                    gap: 8,
                  }}
                >
                  View Details <ArrowRightIcon size={18} />
                </Link>
              </div>
            </div>
            <div className="hero-feature-card-container">
              {featuredProduct && (
                <div className="hero-feature-card">
                  <div className="feature-product-row">
                    <Link
                      href={`/product/${featuredProduct.slug}`}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "flex",
                        gap: "var(--space-4)",
                      }}
                    >
                      <Image
                        src={featuredProduct.images[0]}
                        alt={featuredProduct.title}
                        width={400}
                        height={400}
                        priority
                        fetchPriority="high"
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="feature-product-image"
                      />
                      <div className="feature-product-meta">
                        <div
                          className="feature-product-ratings"
                          style={{ display: "flex", gap: 2 }}
                        >
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              size={14}
                              className={
                                i < Math.floor(featuredProduct.rating || 0)
                                  ? "star-filled"
                                  : "star-empty"
                              }
                            />
                          ))}
                        </div>
                        <h3 className="feature-product-name">
                          {featuredProduct.title}
                        </h3>
                        <div className="feature-product-price">
                          {formatPrice(
                            featuredProduct.salePrice || featuredProduct.price,
                          )}
                          {featuredProduct.salePrice && (
                            <del>{formatPrice(featuredProduct.price)}</del>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="btn btn-ghost"
                    style={{
                      background: "#fff",
                      color: "var(--text-dark)",
                      width: "100%",
                      fontWeight: 700,
                      height: 48,
                      borderRadius: "var(--border-radius-lg)",
                      fontSize: "var(--fs-14)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <CartIcon size={18} /> Add to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}



      {/* Pagination Dots */}
      <div className="hero-slider-dots-wrap">
        <div className="hero-slider-dots">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`hero-slider-dot ${i === current ? "active" : ""}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
