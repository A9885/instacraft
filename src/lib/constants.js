// ── Business Info ── store here, import everywhere (never hardcode in UI)
export const BUSINESS_INFO = {
  name: "Ishta Crafts",
  address: "23-3-561, Sultan Shahi, Charminar, Hyderabad (TS) – 500065",
  phone: "7799329591",
  whatsapp: "917799329591",
  email: "Support@flybuddy.com",
  mapUrl: "https://maps.google.com/?q=Sultan+Shahi+Charminar+Hyderabad",
};

export const WHATSAPP_URL = `https://wa.me/${BUSINESS_INFO.whatsapp}`;
export const WHATSAPP_QUOTE_URL = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=Hi%2C%20I%20am%20interested%20in%20a%20custom%20order%20from%20Ishta%20Crafts.`;
export const WHATSAPP_CUSTOM_URL = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=Hi%2C%20I%20have%20a%20custom%20design%20idea%20I%27d%20like%20to%20discuss.`;

// ── Product Filters ──
export const MATERIALS = ["Brass", "Bronze", "Aluminium"];

export const MATERIAL_COLORS = {
  Brass: "#c8a43a",
  Bronze: "#a0522d",
  Aluminium: "#8fa3b1",
};

// ── Metal Handicrafts Category Structure ──
export const METAL_CATEGORIES = [
  {
    slug: "wall-hangings",
    label: "Wall Hangings",
    desc: "Divine metal wall art for every space",
  },
  {
    slug: "table-top-mount",
    label: "Table Top / Décors",
    desc: "Idols, sculptures & decorative pieces",
  },
  {
    slug: "wall-table-combo",
    label: "Wall & Table Combo",
    desc: "Coordinated sets for complete room décor",
  },
];

// ── Custom Creations Services ──
export const CUSTOM_SERVICES = [
  {
    id: "custom-god-idols",
    title: "Custom God Idols",
    description:
      "Commission divine idols of your choice — any deity, any size, any finish. Pure Brass or Bronze, hand-cast by our master craftsmen in Hyderabad using the lost-wax technique.",
    icon: "sparkles",
  },
];

// ── Custom Features (Homepage Section) ──
export const CUSTOM_FEATURES = [
  {
    slug: "custom-god-idols",
    title: "Customized God Idols",
    description: "Commission divine idols of your choice — any deity, any size, any finish. Pure Brass or Bronze, hand-cast by our master craftsmen in Hyderabad.",
    image: "/images/pexels-photo-31452296.webp",
    ctaLabel: "Start Customizing",
    type: "custom",
  },
];

