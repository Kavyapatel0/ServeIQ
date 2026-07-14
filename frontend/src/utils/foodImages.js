/**
 * Food image utilities for ServeIQ.
 *
 * All images are sourced from Unsplash (free to use for display purposes).
 * When a menu item has no image_url from the backend, we pick a fallback
 * image based on: item name keyword matching → category → generic fallback.
 *
 * URL format: ?w=400&q=80&auto=format&fit=crop gives fast, sharp thumbnails.
 */

// ─── Per-category fallback pools ────────────────────────────────────────────
// Multiple images per category → we pick deterministically by item id so the
// same item always gets the same image across renders.
const CATEGORY_IMAGES = {
  "Main Course": [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80&auto=format&fit=crop",
  ],
  "Starters": [
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80&auto=format&fit=crop",
  ],
  "Beverages": [
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=400&q=80&auto=format&fit=crop",
  ],
  "Desserts": [
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=400&q=80&auto=format&fit=crop",
  ],
  "Breads": [
    "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400&q=80&auto=format&fit=crop",
  ],
  "Street Food": [
    "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=400&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80&auto=format&fit=crop",
  ],
};

// ─── Keyword → specific image overrides ────────────────────────────────────
// Checked before category lookup. Keys are lowercase substrings.
const KEYWORD_IMAGES = {
  "pizza":          "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80&auto=format&fit=crop",
  "margherita":     "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80&auto=format&fit=crop",
  "burger":         "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80&auto=format&fit=crop",
  "chicken burger": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80&auto=format&fit=crop",
  "veg burger":     "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80&auto=format&fit=crop",
  "pasta":          "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=80&auto=format&fit=crop",
  "biryani":        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80&auto=format&fit=crop",
  "noodle":         "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80&auto=format&fit=crop",
  "fried rice":     "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80&auto=format&fit=crop",
  "rice":           "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80&auto=format&fit=crop",
  "paneer":         "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=400&q=80&auto=format&fit=crop",
  "dal":            "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80&auto=format&fit=crop",
  "curry":          "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=80&auto=format&fit=crop",
  "soup":           "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80&auto=format&fit=crop",
  "salad":          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80&auto=format&fit=crop",
  "spring roll":    "https://images.unsplash.com/photo-1606525437082-5ae6ddcee0e9?w=400&q=80&auto=format&fit=crop",
  "samosa":         "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80&auto=format&fit=crop",
  "tikka":          "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=400&q=80&auto=format&fit=crop",
  "kebab":          "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80&auto=format&fit=crop",
  "shawarma":       "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&q=80&auto=format&fit=crop",
  "sandwich":       "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&q=80&auto=format&fit=crop",
  "wrap":           "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80&auto=format&fit=crop",
  "tacos":          "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80&auto=format&fit=crop",
  "steak":          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80&auto=format&fit=crop",
  "fish":           "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80&auto=format&fit=crop",
  "seafood":        "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80&auto=format&fit=crop",
  "prawn":          "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&q=80&auto=format&fit=crop",
  "sushi":          "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80&auto=format&fit=crop",
  "coffee":         "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80&auto=format&fit=crop",
  "cold coffee":    "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80&auto=format&fit=crop",
  "latte":          "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80&auto=format&fit=crop",
  "chai":           "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=400&q=80&auto=format&fit=crop",
  "tea":            "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80&auto=format&fit=crop",
  "juice":          "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80&auto=format&fit=crop",
  "smoothie":       "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80&auto=format&fit=crop",
  "milkshake":      "https://images.unsplash.com/photo-1572490122747-3e9172b0ad19?w=400&q=80&auto=format&fit=crop",
  "lassi":          "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&q=80&auto=format&fit=crop",
  "water":          "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80&auto=format&fit=crop",
  "brownie":        "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&q=80&auto=format&fit=crop",
  "cake":           "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80&auto=format&fit=crop",
  "ice cream":      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80&auto=format&fit=crop",
  "kulfi":          "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80&auto=format&fit=crop",
  "halwa":          "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80&auto=format&fit=crop",
  "kheer":          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80&auto=format&fit=crop",
  "gulab jamun":    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80&auto=format&fit=crop",
  "rasgulla":       "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80&auto=format&fit=crop",
  "chocolate":      "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&q=80&auto=format&fit=crop",
  "waffle":         "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&q=80&auto=format&fit=crop",
  "pancake":        "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&q=80&auto=format&fit=crop",
  "naan":           "https://images.unsplash.com/photo-1614777735417-4bf673c53c0e?w=400&q=80&auto=format&fit=crop",
  "roti":           "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400&q=80&auto=format&fit=crop",
  "bread":          "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80&auto=format&fit=crop",
};

// ─── Generic fallback ────────────────────────────────────────────────────────
const GENERIC_FALLBACK = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80&auto=format&fit=crop";

/**
 * Returns the best available image URL for a menu item.
 *
 * Priority:
 * 1. item.image_url (from backend / DB)
 * 2. Keyword match in item name
 * 3. Category pool (round-robined by item.id)
 * 4. Generic food fallback
 */
export function getMenuItemImage(item) {
  if (item?.image_url) return item.image_url;

  const nameLower = (item?.name ?? "").toLowerCase();

  // Longest keyword match wins (avoids "coffee" matching "cold coffee" wrong)
  const matchedKeyword = Object.keys(KEYWORD_IMAGES)
    .filter((kw) => nameLower.includes(kw))
    .sort((a, b) => b.length - a.length)[0];

  if (matchedKeyword) return KEYWORD_IMAGES[matchedKeyword];

  const categoryName = item?.category?.name ?? item?.category ?? "";
  const pool = CATEGORY_IMAGES[categoryName];
  if (pool?.length) {
    const idx = (item?.id ?? 0) % pool.length;
    return pool[idx];
  }

  return GENERIC_FALLBACK;
}

/**
 * Category sidebar image/emoji helper — returns the right emoji for
 * category icons in the sidebar, plus a representative thumbnail for
 * any future category card designs.
 */
export const CATEGORY_EMOJI = {
  "Main Course": "🍽",
  "Starters":    "🥗",
  "Desserts":    "🍰",
  "Beverages":   "☕",
  "Breads":      "🍞",
  "Street Food": "🌮",
  "All":         "✦",
};
