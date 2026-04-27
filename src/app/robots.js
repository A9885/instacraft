export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ishtacrafts.in";
  
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/checkout/success",
          "/profile",
          "/wholesale",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
