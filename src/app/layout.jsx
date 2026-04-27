import "./globals.css";
import { AuthProvider } from "@/store/AuthContext";
import AppProvider from "@/store/AppProvider";

export const metadata = {
  metadataBase: new URL("https://ishtacrafts.in"),
  title: {
    default:
      "Ishta Crafts — Premium Indian Handicrafts & Artisan Marketplace",
    template: "%s | Ishta Crafts",
  },
  description:
    "Discover authentic handcrafted treasures — macramé, folk paintings, dhokra brass, blue pottery and more, sourced directly from India's master artisans.",
  keywords: [
    "handicrafts",
    "artisan",
    "indian crafts",
    "handmade",
    "folk art",
    "dhokra",
    "macrame",
    "banarasi",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ishtacrafts.in",
    siteName: "Ishta Crafts",
    title:
      "Ishta Crafts — Premium Indian Handicrafts & Artisan Marketplace",
    description:
      "Discover authentic handcrafted treasures sourced directly from India's master artisans.",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Ishta Crafts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ishta Crafts — Premium Indian Handicrafts",
    description:
      "Discover authentic handcrafted treasures from India's master artisans.",
    images: ["/og-image.webp"],
  },
  robots: { index: true, follow: true },
};

import { getSiteConfig } from "@/lib/api-server";

export default async function RootLayout({ children }) {
  const siteConfig = await getSiteConfig().catch(() => null);

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Kalam:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <AppProvider initialConfig={siteConfig}>{children}</AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
