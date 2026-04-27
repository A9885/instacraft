import Image from "next/image";
import Link from "next/link";
import {
  getProducts,
  getFeaturedProducts,
  getCategories,
  getTestimonials,
  getSiteConfig,
  getHeroSlides,
  getPromoBanners,
} from "@/lib/api-server";
import HeroSlider from "@/components/layout/HeroSlider";
import PromoBannerStrip from "@/components/layout/PromoBannerStrip";
import DynamicHomePage from "@/components/layout/DynamicHomePage";
import {
  FadeIn,
  FadeInStagger,
  ScrollFade,
} from "@/components/animations/Reveal";

export default async function HomePage() {
  // Server-side: fetch from api.js (uses localStorage on client, static data on server)
  // These become the initial props / SSR seed for the dynamic client component
  const [
    allProducts,
    featured,
    categories,
    testimonials,
    siteConfig,
    heroSlides,
    promoBanners,
  ] = await Promise.all([
    getProducts(),
    getFeaturedProducts(),
    getCategories(),
    getTestimonials(3),
    getSiteConfig(),
    getHeroSlides(),
    getPromoBanners(),
  ]);

  const physicalProducts = allProducts.filter((p) => p.type !== "service");

  return (
    <>
      {/* ── HERO SLIDER ── */}
      <section aria-label="Hero Highlights">
        <HeroSlider products={physicalProducts} initialSlides={heroSlides} />
      </section>

      {/* ── PROMO BANNER STRIP ── */}
      <PromoBannerStrip initialBanners={promoBanners} />

      {/* ── CATEGORIES ── */}
      <ScrollFade>
        <section
          className="section bg-surface-sunken"
          aria-labelledby="categories-title"
        >
          <div className="container">
            <div className="section-header">
              <span className="overline">Browse by Collection</span>
              <h2 id="categories-title" className="heading-lg">
                Shop by Category
              </h2>
              <p className="text-body">
                Four curated collections of India&rsquo;s finest handmade art
              </p>
            </div>
            <FadeInStagger className="grid grid-4">
              {categories
                .filter((c) => c.slug !== "custom-creations")
                .map((cat) => (
                  <FadeIn key={cat.slug}>
                    <Link
                      href={`/shop/${cat.slug}`}
                      className="category-card"
                      aria-label={cat.label}
                    >
                      <Image
                        src={cat.image}
                        alt={cat.label}
                        width={600}
                        height={800}
                        priority={true}
                        fetchPriority="high"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="category-card-image"
                      />
                      <div className="category-card-overlay">
                        <div
                          className="category-card-icon-wrap"
                          style={{ marginBottom: "var(--space-2)" }}
                        ></div>
                        <h3 className="category-card-title">{cat.label}</h3>
                        <span className="category-card-count">
                          {cat.count} items
                        </span>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
            </FadeInStagger>
          </div>
        </section>
      </ScrollFade>

      {/* ── DYNAMIC CLIENT SECTIONS (reads localStorage → reflects admin changes) ── */}
      {/* Featured Products + Promo Banner + Custom Section + Testimonials */}
      <DynamicHomePage
        staticAllProducts={physicalProducts}
        staticFeatured={featured}
        staticTestimonials={testimonials}
        staticCategories={categories}
        staticConfig={siteConfig}
      />
    </>
  );
}
