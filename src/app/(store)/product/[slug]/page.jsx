import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getProducts } from "@/lib/api-server";
import { formatPrice, calcDiscountPercent } from "@/lib/utils";
import ProductGallery from "@/components/product/ProductGallery";
import RelatedProducts from "@/components/product/RelatedProducts";
import AddToCartButton from "@/components/product/AddToCartButton";
import WishlistButton from "@/components/product/WishlistButton";
import PincodeChecker from "@/components/product/PincodeChecker";
import Link from "next/link";
import { Star, User, AlertTriangle, Check } from "lucide-react";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.title} — Handcrafted by ${product.artisan || "Ishta Artisan"}`,
    description: product.description?.substring(0, 155) || "",
    alternates: { canonical: `https://ishtacrafts.in/product/${slug}` },
    openGraph: {
      title: product.title,
      description: product.description?.substring(0, 155) || "",
      images: [
        { url: product.images?.[0] || "/images/placeholder.webp", width: 600, height: 600, alt: product.title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      images: [product.images?.[0] || "/images/placeholder.webp"],
    },
  };
}

export async function generateStaticParams() {
  // Speed Mode: Skip pre-building products to avoid build timeouts.
  return [];
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(slug, product.category, 4);
  const discount = calcDiscountPercent(product.price, product.salePrice);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images,
    brand: { "@type": "Brand", name: "Ishta Crafts" },
    offers: {
      "@type": "Offer",
      price: product.salePrice || product.price,
      priceCurrency: "INR",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="section">
        <div className="container">


          <div className="col-layout">
            {/* Gallery */}
            <ProductGallery 
              images={product.images} 
              title={product.title} 
              outOfStock={product.stock === 0} 
            />

            {/* Product Info */}
            <div>
              <p className="product-card-category mb-2">
                {product.category?.replace(/-/g, " ") || "Handicrafts"}
              </p>
              <h1 className="heading-lg mb-3">{product.title}</h1>

              {/* Rating */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  marginBottom: "var(--space-5)",
                }}
              >
                <div
                  className="stars"
                  aria-label={`Rated ${product.rating} out of 5`}
                >
                  {Array.from({ length: Math.round(product.rating) }).map(
                    (_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill="var(--secondary)"
                        color="var(--secondary)"
                      />
                    ),
                  )}
                </div>
                <span
                  style={{
                    fontSize: "var(--fs-14)",
                    color: "var(--text-medium)",
                  }}
                >
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div
                className="product-card-price-row mb-5"
                style={{ alignItems: "center" }}
              >
                <span className="price" style={{ fontSize: "var(--fs-28)" }}>
                  {formatPrice(product.salePrice || product.price)}
                </span>
                {product.salePrice && (
                  <>
                    <span className="price-sale">
                      {formatPrice(product.price)}
                    </span>
                    <span className="price-discount">{discount}% off</span>
                  </>
                )}
              </div>

              {/* Artisan */}
              {product.artisan && (
                <div className="card card-bordered card-sm mb-5">
                  <div
                    className="card-body"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-4)",
                    }}
                  >
                    <span style={{ fontSize: 36 }} aria-hidden="true">
                      <User size={36} />
                    </span>
                    <div>
                      <p className="label mb-1">Crafted By</p>
                      <p
                        className="artisan-credit"
                        style={{
                          fontSize: "var(--fs-16)",
                          fontStyle: "normal",
                          color: "var(--text-dark)",
                          fontWeight: 600,
                        }}
                      >
                        {product.artisan}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stock */}
              <div className="mb-5">
                {product.stock === 0 && (
                  <span className="stock-badge-out">Out of Stock</span>
                )}
                {product.stock > 0 && product.stock < 10 && (
                  <span className="stock-badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <AlertTriangle size={14} />
                    Only {product.stock} left
                  </span>
                )}
                {product.stock >= 10 && (
                  <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Check size={14} />
                    In Stock
                  </span>
                )}
              </div>

              {/* Pincode Checker */}
              <PincodeChecker />

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-3)",
                  marginBottom: "var(--space-6)",
                }}
              >
                <AddToCartButton
                  product={product}
                  disabled={product.stock === 0}
                  className="btn-lg"
                />
                <WishlistButton product={product} />
              </div>

              {/* Details */}
              <div className="divider" />
              <h2 className="heading-sm mb-3">Product Details</h2>
              <p
                className="text-body mb-5"
                style={{ lineHeight: "var(--lh-loose)" }}
              >
                {product.description}
              </p>

              <div
                className="grid grid-2"
                style={{
                  gap: "var(--space-4)",
                  marginBottom: "var(--space-6)",
                }}
              >
                {[
                  { label: "Dimensions", value: product.dimensions },
                  { label: "Weight", value: product.weight },
                  {
                    label: "Material",
                    value: product.tags.slice(0, 2).join(", "),
                  },
                  {
                    label: "Category",
                    value: product.category?.replace(/-/g, " ") || "Handicrafts",
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <span className="label">{item.label}</span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "var(--fs-15)",
                        color: "var(--text-dark)",
                        marginTop: 2,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-2)",
                  flexWrap: "wrap",
                }}
              >
                {product.tags.map((tag) => (
                  <span key={tag} className="badge badge-neutral">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-12">
            <RelatedProducts products={related} />
          </div>
        </div>
      </div>
    </>
  );
}
