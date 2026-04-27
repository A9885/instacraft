import { getProducts, getCategories } from "@/lib/api-server";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ishtacrafts.in";

  // 1. Fetch data for dynamic routes
  let products = [];
  let categories = [];
  try {
    products = await getProducts();
    categories = await getCategories();
  } catch (error) {
    console.error("Sitemap dynamic fetch failed:", error);
  }

  // 2. Define static routes
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/products",
    "/categories",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  // 3. Map categories
  const categoryRoutes = categories.map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 4. Map products
  const productRoutes = products.map((prod) => ({
    url: `${baseUrl}/products/${prod.slug}`,
    lastModified: new Date(prod.updatedAt || prod.createdAt || new Date()),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
