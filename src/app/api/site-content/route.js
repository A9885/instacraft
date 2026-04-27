import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { revalidateTag } from "next/cache";
import db from "@/lib/db";
import { siteContent as defaultData } from "@/data/siteContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getContent() {
  try {
    await db.query("ALTER TABLE site_content ADD COLUMN custom_creations JSON");
  } catch (e) {}
  try {
    await db.query("ALTER TABLE site_content ADD COLUMN custom_creations_hero VARCHAR(255)");
  } catch (e) {}
  const rows = await db.query("SELECT * FROM site_content LIMIT 1");
  return rows[0] || null;
}

export async function GET() {
  try {
    let content = await getContent();
    if (!content) {
      const defaultValue = {
        about: JSON.stringify(defaultData.about),
        contact: JSON.stringify(defaultData.contact),
        footer: JSON.stringify(defaultData.footer),
        custom_creations: JSON.stringify([]),
        custom_creations_hero: "/images/pexels-photo-31452296.webp",
      };
      
      const result = await db.query(
        "INSERT INTO site_content (about, contact, footer, custom_creations, custom_creations_hero, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(3), NOW(3))",
        [defaultValue.about, defaultValue.contact, defaultValue.footer, defaultValue.custom_creations, defaultValue.custom_creations_hero]
      );
      const rows = await db.query("SELECT * FROM site_content WHERE id = ?", [result.insertId]);
      content = rows[0];
    }

    const parseJSON = (str, fallback) => {
      try {
        return typeof str === 'string' ? JSON.parse(str) : (str || fallback);
      } catch {
        return fallback;
      }
    };

    const normalize = (raw) => {
      const parsedAbout = parseJSON(raw.about, defaultData.about);
      const parsedContact = parseJSON(raw.contact, defaultData.contact);
      const parsedFooter = parseJSON(raw.footer, defaultData.footer);
      const parsedCustomCreations = parseJSON(raw.custom_creations, []);

      // Deep merge sections to ensure all fields exist even if partial data is in DB
      const about = {
        ...defaultData.about,
        ...parsedAbout,
        mission: {
          ...defaultData.about.mission,
          ...(parsedAbout.mission || {}),
          stats: (parsedAbout.mission?.stats?.length > 0) ? parsedAbout.mission.stats : defaultData.about.mission.stats,
        },
        values: {
          ...defaultData.about.values,
          ...(parsedAbout.values || {}),
          list: (parsedAbout.values?.list?.length > 0) ? parsedAbout.values.list : defaultData.about.values.list,
        },
        artisans: {
          ...defaultData.about.artisans,
          ...(parsedAbout.artisans || {}),
          list: (parsedAbout.artisans?.list?.length > 0) ? parsedAbout.artisans.list : defaultData.about.artisans.list,
        }
      };



      return {
        ...raw,
        _id: raw.id.toString(),
        about,
        contact: { ...defaultData.contact, ...parsedContact },
        footer: { ...defaultData.footer, ...parsedFooter },
        customCreations: parsedCustomCreations,
        customCreationsHero: raw.custom_creations_hero || "/images/pexels-photo-31452296.webp"
      };
    };


    return NextResponse.json({ 
      success: true, 
      siteContent: normalize(content) 
    });
  } catch (error) {
    console.error("GET /api/site-content error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch site content" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const data = await request.json();
    let content = await getContent();

    // Remove contact sub-fields managed by SiteConfig
    const cleanedContent = { ...data.siteContent };
    if (cleanedContent.contact) {
      delete cleanedContent.contact.email;
      delete cleanedContent.contact.phone;
      delete cleanedContent.contact.address;
    }

    if (!content) {
      await db.query(
        "INSERT INTO site_content (about, contact, footer, custom_creations, custom_creations_hero, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(3), NOW(3))",
        [
          JSON.stringify(cleanedContent.about || {}),
          JSON.stringify(cleanedContent.contact || {}),
          JSON.stringify(cleanedContent.footer || {}),
          JSON.stringify(cleanedContent.customCreations || []),
          cleanedContent.customCreationsHero || "/images/pexels-photo-31452296.webp"
        ]
      );
    } else {
      await db.query(
        "UPDATE site_content SET about = ?, contact = ?, footer = ?, custom_creations = ?, custom_creations_hero = ?, updated_at = NOW(3) WHERE id = ?",
        [
          JSON.stringify(cleanedContent.about ?? content.about),
          JSON.stringify(cleanedContent.contact ?? content.contact),
          JSON.stringify(cleanedContent.footer ?? content.footer),
          JSON.stringify(cleanedContent.customCreations ?? content.custom_creations),
          cleanedContent.customCreationsHero !== undefined ? cleanedContent.customCreationsHero : content.custom_creations_hero,
          content.id
        ]
      );
    }

    const updatedContent = await getContent();
    revalidateTag("site-content");
    return NextResponse.json({ success: true, siteContent: { ...updatedContent, _id: updatedContent.id.toString() } });
  } catch (error) {
    console.error("PUT /api/site-content error:", error);
    return NextResponse.json({ success: false, error: "Failed to update site content" }, { status: 500 });
  }
}
