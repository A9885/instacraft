"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tag, Rocket, Clock, Sparkles, Flame, Star } from "lucide-react";

const BADGE_CONFIG = {
  sale: {
    Icon: Tag,
    color: "#7A1F1F", // Red
    bg: "rgba(122, 31, 31, 0.08)",
    border: "rgba(122, 31, 31, 0.2)",
  },
  launch: {
    Icon: Rocket,
    color: "#2B5A84", // Blue
    bg: "rgba(43, 90, 132, 0.08)",
    border: "rgba(43, 90, 132, 0.2)",
  },
  upcoming: {
    Icon: Clock,
    color: "#A87C2B", // Yellow/Gold
    bg: "rgba(168, 124, 43, 0.12)",
    border: "rgba(168, 124, 43, 0.3)",
  },
  new: {
    Icon: Sparkles,
    color: "#2F5D50", // Green
    bg: "rgba(47, 93, 80, 0.08)",
    border: "rgba(47, 93, 80, 0.2)",
  },
  hot: {
    Icon: Flame,
    color: "#B85C20", // Orange
    bg: "rgba(184, 92, 32, 0.08)",
    border: "rgba(184, 92, 32, 0.2)",
  },
  limited: {
    Icon: Star,
    color: "#5C3A70", // Purple
    bg: "rgba(92, 58, 112, 0.08)",
    border: "rgba(92, 58, 112, 0.2)",
  },
};

export default function PromoBannerStrip({ initialBanners = [] }) {
  const [banners, setBanners] = useState(initialBanners);
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    if (initialBanners.length > 0) {
      setBanners(initialBanners);
      return;
    }
    fetch("/api/promo-banners")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setBanners(data);
      })
      .catch(() => {});
  }, [initialBanners]);

  // Drag to scroll logic
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.scrollBehavior = "auto"; // Disable smooth scroll during drag
    scrollRef.current.style.cursor = "grabbing";
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    scrollRef.current.style.cursor = "grab";
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    scrollRef.current.style.cursor = "grab";
    scrollRef.current.style.scrollBehavior = "smooth"; // Re-enable smooth scroll
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 474; // 450px card width + 24px gap
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (banners.length === 0) return null;

  return (
    <section
      className="promo-strip-section"
      aria-label="Promotions and Upcoming Offers"
    >
      <div className="container-xl">
        <div className="promo-strip-wrapper">
          {/* Navigation Arrows */}
          <button
            className="promo-strip-arrow prev"
            onClick={() => scroll("left")}
            aria-label="Previous banners"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="promo-strip-arrow next"
            onClick={() => scroll("right")}
            aria-label="Next banners"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div
            className="promo-strip-grid"
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{ cursor: "grab", userSelect: "none" }}
          >
            {banners.map((banner) => {
              const cfg = BADGE_CONFIG[banner.badgeType] || BADGE_CONFIG.new;
              const BadgeIcon = cfg.Icon;
              return (
                <Link
                  key={banner._id || banner.id}
                  href={banner.ctaLink || "/shop"}
                  className="promo-strip-card"
                  aria-label={banner.title}
                  draggable={false}
                >
                  {/* Image */}
                  {banner.image && (
                    <div
                      className="promo-strip-img-wrap"
                      style={{ pointerEvents: "none" }}
                    >
                      <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="promo-strip-img"
                        draggable={false}
                      />
                      <div className="promo-strip-img-overlay" />
                    </div>
                  )}

                  {/* Content */}
                  <div
                    className="promo-strip-content"
                    style={{ pointerEvents: "none" }}
                  >
                    {/* Badge */}
                    {banner.badge && (
                      <span
                        className="promo-strip-badge"
                        style={{
                          background: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`,
                        }}
                      >
                        <BadgeIcon
                          size={11}
                          strokeWidth={2.5}
                          style={{ color: cfg.color, flexShrink: 0 }}
                        />
                        {banner.badge}
                      </span>
                    )}

                    {/* Text */}
                    <div className="promo-strip-text">
                      {banner.subtitle && (
                        <span className="promo-strip-subtitle">
                          {banner.subtitle}
                        </span>
                      )}
                      <h3 className="promo-strip-title">{banner.title}</h3>
                      {banner.description && (
                        <p className="promo-strip-desc">{banner.description}</p>
                      )}
                    </div>

                    {/* CTA */}
                    <span className="promo-strip-cta">
                      {banner.ctaText || "Shop Now"}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
