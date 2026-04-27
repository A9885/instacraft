export const categories = [
  {
    slug: "wall-hangings",
    label: "Wall Hangings",
    description:
      "Handcrafted metal wall art — Brass, Bronze & Aluminium pieces to elevate any wall",
    icon: "wall_hanging",
    image: "/images/pexels-photo-14913872.webp",
    count: 9,
  },
  {
    slug: "table-top-mount",
    label: "Table Top / Décors",
    description:
      "Metal idols, sculptures & decorative pieces for shelves and tables",
    icon: "table_top",
    image: "/images/pexels-photo-12999486.webp",
    count: 6,
  },
  {
    slug: "wall-table-combo",
    label: "Wall & Table Combo",
    description: "Coordinated metal sets that bring harmony to entire rooms",
    icon: "combo",
    image: "/images/pexels-photo-33321182.webp",
    count: 4,
  },
  {
    slug: "gift-items",
    label: "Gift Items",
    description: "Thoughtfully curated gifts celebrating Indian artisanship",
    icon: "gift",
    image: "/images/pexels-photo-8819577.webp",
    count: 6,
  },
  {
    slug: "custom-creations",
    label: "Custom Creations",
    description:
      "Your Vision. Our Craft. — Bespoke metal art made to order in Hyderabad",
    icon: "custom",
    image: "/images/pexels-photo-21383559.webp",
    count: 3,
  },
];

export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug) || null;
}
