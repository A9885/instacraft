import Link from "next/link";
import { getProducts, getCategories } from "@/lib/api-server";
import DynamicProductListing from "@/components/shop/DynamicProductListing";
import { Image, Palette, Gift, ShoppingBag } from "lucide-react";
import { PotteryIcon } from "@/components/common/Icons";

export const metadata = {
  title: "Shop — All Handcrafted Products",
  description:
    "Browse our complete collection of authentic Indian handicrafts — wall hangings, table decor, gift items and more.",
  alternates: { canonical: "https://ishtacrafts.in/shop" },
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const physicalProducts = products.filter((p) => p.type !== "service");

  const getCategoryIcon = (iconName, size = 18) => {
    const icons = {
      wall_hanging: <Image size={size} />,
      table_top: <PotteryIcon size={size} />,
      combo: <Palette size={size} />,
      gift: <Gift size={size} />,
    };
    return icons[iconName] || null;
  };

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div
          className="flex-between mb-8"
          style={{ flexWrap: "wrap", gap: "var(--space-4)" }}
        >
          <div>
            <h1 className="heading-lg">All Handcrafted Products</h1>
            <p className="text-body mt-2">
              Browse {physicalProducts.length} products made by India&rsquo;s master
              artisans
            </p>
          </div>
          <span
            className="badge badge-secondary"
            style={{
              fontSize: "var(--fs-14)",
              padding: "var(--space-2) var(--space-4)",
            }}
          >
            {physicalProducts.length} {physicalProducts.length === 1 ? "product" : "products"}
          </span>
        </div>

        {/* Category filter tabs */}
        <nav
          className="flex flex-wrap gap-3 mb-8"
          aria-label="Product category filters"
          style={{ marginBottom: "var(--space-8)" }}
        >
          <Link
            href="/shop"
            className="btn btn-primary btn-sm"
            aria-current="page"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <ShoppingBag size={18} /> All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop/${cat.slug}`}
              className="btn btn-outline btn-sm"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {getCategoryIcon(cat.icon)} {cat.label}
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

        {/* DynamicProductListing reads from localStorage on the client
            so admin changes are reflected after a page refresh */}
        <DynamicProductListing staticProducts={physicalProducts} />
      </div>
    </div>
  );
}
