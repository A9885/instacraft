import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/layout/Breadcrumb";
import WhatsAppCTA from "@/components/common/WhatsAppCTA";
import SaleBanner from "@/components/layout/SaleBanner";
import "../globals.css";
import { getSiteContent, getCategories, getSaleBanner } from "@/lib/api-server";

export default async function StoreLayout({ children }) {
  const [content, categories, banner] = await Promise.all([
    getSiteContent().catch(() => null),
    getCategories().catch(() => []),
    getSaleBanner().catch(() => null),
  ]);

  return (
    <>
      <SaleBanner initialData={banner} />
      <Navbar staticContent={content} staticCategories={categories} />
      <Breadcrumb />
      <main className="store-main" id="main-content">
        {children}
      </main>
      <Footer staticContent={content} staticCategories={categories} />
      <WhatsAppCTA />
    </>
  );
}
