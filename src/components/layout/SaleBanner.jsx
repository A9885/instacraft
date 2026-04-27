"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function SaleBanner({ initialData }) {
  // initialData can now be an array of banners or the old single-banner object
  const normalize = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data.filter((b) => b.enabled);
    // backwards-compat: old single object
    if (data.enabled) return [data];
    return [];
  };

  const [banners] = useState(() => normalize(initialData));
  const [visible, setVisible] = useState(banners.length > 0);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef(null);

  const goTo = useCallback(
    (index) => {
      if (animating || banners.length === 0) return;
      setAnimating(true);
      setCurrent((index + banners.length) % banners.length);
      setTimeout(() => setAnimating(false), 300);
    },
    [animating, banners.length],
  );

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance every 4 seconds when there are multiple banners
  useEffect(() => {
    if (banners.length <= 1) return;
    intervalRef.current = setInterval(goNext, 4000);
    return () => clearInterval(intervalRef.current);
  }, [banners.length, goNext]);

  const resetInterval = () => {
    clearInterval(intervalRef.current);
    if (banners.length > 1) {
      intervalRef.current = setInterval(goNext, 4000);
    }
  };

  // Check expiry
  const isExpired = (b) => b.expiresAt && new Date(b.expiresAt) < new Date();

  if (!visible || banners.length === 0) return null;

  const banner = banners[current];

  // Skip expired banners silently
  if (isExpired(banner)) return null;

  return (
    <div
      className="sale-banner"
      style={{
        "--banner-bg": banner.bgColor || "#7A1F1F",
        "--banner-text": banner.textColor || "#FFFFFF",
        position: "relative",
        opacity: animating ? 0 : 1,
        transition: "opacity 0.25s ease",
      }}
      role="banner"
      aria-label="Promotional announcement"
    >
      <div
        className="sale-banner-inner"
        style={{
          paddingLeft: banners.length > 1 ? 28 : 0,
          paddingRight: banners.length > 1 ? 28 : 0,
        }}
      >
        <p className="sale-banner-message">{banner.message}</p>

        {banner.ctaText && banner.ctaLink && (
          <Link href={banner.ctaLink} className="sale-banner-cta">
            {banner.ctaText}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 6h8M7 3l3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}

        {/* Dot indicators */}
        {banners.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: 5,
              marginLeft: 12,
              alignItems: "center",
            }}
          >
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  goTo(i);
                  resetInterval();
                }}
                aria-label={`Banner ${i + 1}`}
                style={{
                  width: i === current ? 14 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: "var(--banner-text)",
                  opacity: i === current ? 0.9 : 0.35,
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "width 0.25s ease, opacity 0.25s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
