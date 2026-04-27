import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProductsByCategory,
  getCategoryBySlug,
  getCategories,
} from "@/lib/api-server";
import ProductGrid from "@/components/product/ProductGrid";
import DynamicProductListing from "@/components/shop/DynamicProductListing";
import CustomCreationsClient from "@/app/(store)/custom/CustomCreationsClient";
import { Image, Palette, Gift, ShoppingBag, Sparkles } from "lucide-react";
import { PotteryIcon } from "@/components/common/Icons";

export async function generateMetadata({ params }) {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "Category Not Found" };
  const keywords = [
    "Metal Handicrafts India",
    "Brass Idols",
    "Custom Sculptures India",
    "Hyderabad Handicrafts",
    cat.label,
    "Handmade Metal Art",
  ];
  return {
    title: `${cat.label} — Metal Handicrafts India | Ishta Crafts Hyderabad`,
    description: `Shop handcrafted ${cat.label} — Brass, Bronze & Aluminium pieces from master artisans in Hyderabad. ${cat.description}. Authentic Metal Handicrafts India.`,
    keywords: keywords.join(", "),
    alternates: { canonical: `https://ishtacrafts.in/shop/${category}` },
    openGraph: {
      title: `${cat.label} | Ishta Crafts`,
      description: cat.description,
      images: [{ url: cat.image, width: 600, height: 800, alt: cat.label }],
    },
  };
}

export async function generateStaticParams() {
  // Speed Mode: Skip pre-building categories to avoid build timeouts.
  return [];
}

export default async function CategoryShopPage({ params }) {
  const getCategoryIcon = (iconName, size = 18) => {
    const icons = {
      wall_hanging: <Image size={size} />,
      table_top: <PotteryIcon size={size} />,
      combo: <Palette size={size} />,
      gift: <Gift size={size} />,
      custom: <Sparkles size={size} />,
    };
    return icons[iconName] || null;
  };

  const { category } = await params;
  const isCustomCategory = category === "custom-creations";
  const [cat, products] = await Promise.all([
    getCategoryBySlug(category),
    getProductsByCategory(category),
  ]);
  const allCategories = await getCategories();

  if (!cat) notFound();

  // ── Custom Creations gets its own dedicated full-page experience ──
  if (category === "custom-creations") {
    return <CustomCreationsClient />;
  }

  return (
    <div className="section">
      <div className="container">


        {/* Header */}
        <div
          className="flex-between mb-8"
          style={{ flexWrap: "wrap", gap: "var(--space-4)" }}
        >
          <div>
            <h1 className="heading-lg">{cat.label}</h1>
            <p className="text-body mt-2">
              {isCustomCategory ? "Your Vision. Our Craft." : cat.description}
            </p>
          </div>
          <span
            className="badge badge-secondary"
            style={{
              fontSize: "var(--fs-14)",
              padding: "var(--space-2) var(--space-4)",
            }}
          >
            {products.length} {products.length === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Category filter tabs */}
        <nav
          className="flex flex-wrap gap-3"
          aria-label="Category filters"
          style={{ marginBottom: "var(--space-8)" }}
        >
          <Link
            href="/shop"
            className="btn btn-outline btn-sm"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ShoppingBag size={18} /> All
          </Link>
          {allCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop/${c.slug}`}
              className={`btn btn-sm ${c.slug === category ? "btn-primary" : "btn-outline"}`}
              aria-current={c.slug === category ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {getCategoryIcon(c.icon)} {c.label}
            </Link>
          ))}
        </nav>

        <input
          type="checkbox"
          id="mobile-filter-toggle"
          className="mobile-filter-toggle"
        />

        <label htmlFor="mobile-filter-toggle" className="mobile-filter-open">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Filters
        </label>

        <label
          htmlFor="mobile-filter-toggle"
          className="mobile-filter-overlay"
        ></label>

        {/* DynamicProductListing reads from localStorage on the client */}
        <DynamicProductListing
          staticProducts={products}
          category={category}
          isCustomCategory={isCustomCategory}
        />
      </div>
    </div>
  );
}
