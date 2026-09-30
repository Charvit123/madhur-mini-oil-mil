import type { PackagingKind, Unit } from "./types";

/**
 * Ported line-for-line from the prototype's `DB` object so this build shows
 * identical copy, prices and stock. This is what app/api/catalogue/** reads
 * from — swap it for a real database call and every route handler keeps
 * working, since they only ever touch this module's exported functions.
 */

export interface RawOil {
  id: string; slug: string; name: string; order: number;
  oilColor: string; seedColor: string; tagline: string; description: string;
  features: string[]; benefits: [string, string][]; faqs: [string, string][];
}

export interface RawPackaging {
  id: string; name: string; type: PackagingKind; size: number; unit: Unit; order: number;
}

export interface RawProduct {
  id: string; oilId: string; slug: string; name: string;
  short: string; rating: number; reviews: number; madeAt: string;
}

export interface RawVariant {
  id: string; productId: string; packagingId: string; sku: string;
  price: number; mrp: number; stock: number;
}

export interface RawReview {
  id: string; productId: string; name: string; city: string;
  rating: number; date: string; text: string;
}

export const oils: RawOil[] = [
  {
    id: "oil_gn", slug: "groundnut-oil", name: "Groundnut Oil", order: 1,
    oilColor: "#E2A227", seedColor: "#C99A5B",
    tagline: "Nutty, golden, built for Gujarati kitchens",
    description: "Pressed from Saurashtra groundnut bought at the Gondal yard, filtered twice and rested before packing. It keeps the roasted aroma that refining strips out, and its high smoke point makes it the everyday oil for frying, tempering and farsan.",
    features: [
      "Single-source groundnut from Saurashtra farms",
      "Mechanically pressed, never chemically extracted",
      "Double filtered, then rested for 48 hours",
      "Smoke point around 230°C, safe for deep frying",
      "Naturally high in MUFA",
      "No added colour, no preservatives",
    ],
    benefits: [
      ["Heart", "Mostly monounsaturated fat, which helps keep HDL levels steady."],
      ["Frying", "Absorbs less into food than light refined oils, so farsan stays crisp."],
      ["Taste", "Keeps the nutty aroma, so less oil is needed for the same flavour."],
      ["Vitamin E", "A natural source of antioxidant vitamin E."],
    ],
    faqs: [
      ["Is this refined or filtered?", "Filtered. The seed is pressed and the oil is cleaned mechanically twice. Nothing is bleached, deodorised or chemically treated, which is why the colour is deeper than refined oil."],
      ["How long does it keep?", "Nine months from the pressing date printed on the pack, stored away from sunlight and heat."],
      ["Why does it freeze slightly in winter?", "Filtered groundnut oil thickens below about 12°C. It clears on its own at room temperature and is not a fault."],
    ],
  },
  {
    id: "oil_ses", slug: "sesame-oil", name: "Sesame Oil", order: 2,
    oilColor: "#B9731C", seedColor: "#E8DCC2",
    tagline: "Cold pressed til, warm and unmistakable",
    description: "Wood-pressed at low speed so the til never heats past 45°C. Deep amber, strongly aromatic and traditionally used for tempering, pickles, and the winter cooking that Gujarat runs on.",
    features: [
      "Cold pressed in a wooden ghani at low RPM",
      "Seed temperature stays under 45°C",
      "Unrefined and unblended",
      "Strong natural aroma, use less per dish",
      "Rich in sesamol and sesamin",
      "Settles slightly, which is normal for cold pressed oil",
    ],
    benefits: [
      ["Cold press", "Low heat keeps the natural antioxidants intact."],
      ["Tempering", "A small quantity carries flavour across a whole dish."],
      ["Massage", "Traditionally used for abhyanga and winter body massage."],
      ["Pickles", "The high stability keeps homemade pickles from turning."],
    ],
    faqs: [
      ["Can I use this for deep frying?", "It works, but it is expensive for frying and the aroma is strong. Most homes keep sesame for tempering and use groundnut for frying."],
      ["Why is there sediment at the bottom?", "Cold pressed oil is filtered only through cloth, so fine seed particles settle. Shake gently before use."],
    ],
  },
  {
    id: "oil_cot", slug: "cottonseed-oil", name: "Cottonseed Oil", order: 3,
    oilColor: "#EFC64B", seedColor: "#F3EDE1",
    tagline: "Light and neutral, the bulk kitchen favourite",
    description: "A clean, light oil with almost no aroma of its own, which is why canteens, farsan shops and large families choose it. We press and filter it in the same small batches as everything else.",
    features: [
      "Neutral taste that does not change a dish",
      "Light body, drains off fried food easily",
      "Filtered in small batches",
      "Popular for canteens and bulk kitchens",
      "Stable at high heat",
      "Packed the same week it is pressed",
    ],
    benefits: [
      ["Neutral", "Lets the masala lead instead of the oil."],
      ["Economy", "The lowest cost per litre across our range."],
      ["Bulk", "Available in 15 kg tins and buckets for daily-use kitchens."],
      ["Stability", "Holds up across repeated frying sessions."],
    ],
    faqs: [
      ["Is cottonseed oil safe for daily cooking?", "Yes. Ours is food-grade, filtered and FSSAI certified. Like any oil, keep daily intake moderate."],
      ["Do you sell wholesale quantities?", "Yes, above 20 tins we quote directly. Call the mill or use the contact form."],
    ],
  },
];

export const packagings: RawPackaging[] = [
  { id: "pk_t15k", name: "15 Kg Tin", type: "TIN", size: 15, unit: "KG", order: 1 },
  { id: "pk_t15l", name: "15 Litre Tin", type: "TIN", size: 15, unit: "LITRE", order: 2 },
  { id: "pk_b15k", name: "15 Kg Bucket", type: "BUCKET", size: 15, unit: "KG", order: 3 },
  { id: "pk_b10k", name: "10 Kg Bucket", type: "BUCKET", size: 10, unit: "KG", order: 4 },
  { id: "pk_t10l", name: "10 Litre Tin", type: "TIN", size: 10, unit: "LITRE", order: 5 },
  { id: "pk_j5k", name: "5 Kg Jar", type: "JAR", size: 5, unit: "KG", order: 6 },
  { id: "pk_t5l", name: "5 Litre Tin", type: "TIN", size: 5, unit: "LITRE", order: 7 },
  { id: "pk_bo1", name: "1 Litre Bottle", type: "BOTTLE", size: 1, unit: "LITRE", order: 8 },
  { id: "pk_bo05", name: "500 ml Bottle", type: "BOTTLE", size: 0.5, unit: "LITRE", order: 9 },
  { id: "pk_p1", name: "1 Litre Pouch", type: "POUCH", size: 1, unit: "LITRE", order: 10 },
];

export const products: RawProduct[] = [
  { id: "p_gn_df", oilId: "oil_gn", slug: "double-filtered-groundnut-oil", name: "Double Filtered Groundnut Oil", short: "Twice-filtered groundnut oil with the roasted aroma left in.", rating: 4.8, reviews: 214, madeAt: "Rajkot unit" },
  { id: "p_gn_fil", oilId: "oil_gn", slug: "wood-pressed-groundnut-oil", name: "Wood Pressed Groundnut Oil", short: "Ghani pressed in small lots for homes that want it unheated.", rating: 4.9, reviews: 96, madeAt: "Rajkot unit" },
  { id: "p_ses_cp", oilId: "oil_ses", slug: "cold-pressed-sesame-oil", name: "Cold Pressed Sesame Oil", short: "Wooden ghani til oil, deep amber and strongly aromatic.", rating: 4.7, reviews: 138, madeAt: "Rajkot unit" },
  { id: "p_ses_rf", oilId: "oil_ses", slug: "filtered-sesame-oil", name: "Filtered Sesame Oil", short: "A lighter sesame for everyday tempering.", rating: 4.5, reviews: 61, madeAt: "Rajkot unit" },
  { id: "p_cot_fl", oilId: "oil_cot", slug: "filtered-cottonseed-oil", name: "Filtered Cottonseed Oil", short: "Light, neutral and priced for kitchens that cook all day.", rating: 4.6, reviews: 173, madeAt: "Rajkot unit" },
];

export const variants: RawVariant[] = [
  { id: "v1", productId: "p_gn_df", packagingId: "pk_t15k", sku: "MDH-GN-DF-15KT", price: 2850, mrp: 3150, stock: 42 },
  { id: "v2", productId: "p_gn_df", packagingId: "pk_t15l", sku: "MDH-GN-DF-15LT", price: 2690, mrp: 2950, stock: 31 },
  { id: "v3", productId: "p_gn_df", packagingId: "pk_b15k", sku: "MDH-GN-DF-15KB", price: 2790, mrp: 3050, stock: 7 },
  { id: "v4", productId: "p_gn_df", packagingId: "pk_b10k", sku: "MDH-GN-DF-10KB", price: 1910, mrp: 2100, stock: 22 },
  { id: "v5", productId: "p_gn_df", packagingId: "pk_t5l", sku: "MDH-GN-DF-05LT", price: 995, mrp: 1120, stock: 64 },
  { id: "v6", productId: "p_gn_df", packagingId: "pk_bo1", sku: "MDH-GN-DF-01LB", price: 225, mrp: 255, stock: 180 },
  { id: "v7", productId: "p_gn_df", packagingId: "pk_bo05", sku: "MDH-GN-DF-500B", price: 120, mrp: 135, stock: 0 },
  { id: "v8", productId: "p_gn_fil", packagingId: "pk_j5k", sku: "MDH-GN-WP-05KJ", price: 1245, mrp: 1390, stock: 18 },
  { id: "v9", productId: "p_gn_fil", packagingId: "pk_bo1", sku: "MDH-GN-WP-01LB", price: 285, mrp: 310, stock: 96 },
  { id: "v10", productId: "p_ses_cp", packagingId: "pk_bo1", sku: "MDH-SE-CP-01LB", price: 495, mrp: 560, stock: 74 },
  { id: "v11", productId: "p_ses_cp", packagingId: "pk_bo05", sku: "MDH-SE-CP-500B", price: 265, mrp: 295, stock: 110 },
  { id: "v12", productId: "p_ses_cp", packagingId: "pk_t5l", sku: "MDH-SE-CP-05LT", price: 2290, mrp: 2480, stock: 12 },
  { id: "v13", productId: "p_ses_rf", packagingId: "pk_bo1", sku: "MDH-SE-FL-01LB", price: 385, mrp: 420, stock: 58 },
  { id: "v14", productId: "p_ses_rf", packagingId: "pk_t15l", sku: "MDH-SE-FL-15LT", price: 5150, mrp: 5600, stock: 4 },
  { id: "v15", productId: "p_cot_fl", packagingId: "pk_t15k", sku: "MDH-CO-FL-15KT", price: 2190, mrp: 2420, stock: 53 },
  { id: "v16", productId: "p_cot_fl", packagingId: "pk_b15k", sku: "MDH-CO-FL-15KB", price: 2150, mrp: 2380, stock: 26 },
  { id: "v17", productId: "p_cot_fl", packagingId: "pk_b10k", sku: "MDH-CO-FL-10KB", price: 1480, mrp: 1620, stock: 33 },
  { id: "v18", productId: "p_cot_fl", packagingId: "pk_p1", sku: "MDH-CO-FL-01LP", price: 165, mrp: 185, stock: 240 },
  { id: "v19", productId: "p_cot_fl", packagingId: "pk_bo1", sku: "MDH-CO-FL-01LB", price: 185, mrp: 205, stock: 142 },
];

export const reviews: RawReview[] = [
  { id: "r1", productId: "p_gn_df", name: "Hetal Trivedi", city: "Rajkot", rating: 5, date: "2026-08-12", text: "We have been buying the 15 kg tin every two months for three years. The smell when you open a fresh tin is the reason we stopped buying from the supermarket." },
  { id: "r2", productId: "p_gn_df", name: "Nikunj Patel", city: "Ahmedabad", rating: 5, date: "2026-07-02", text: "Fried about 4 kg of fafda in it over a weekend and the oil stayed clear. Delivery came in four days, tin was sealed properly with no leaking." },
  { id: "r3", productId: "p_ses_cp", name: "Mira Shah", city: "Surat", rating: 4, date: "2026-06-28", text: "Strong aroma, exactly like the ghani oil my mother used. Took one star off only because the 1 litre bottle finishes too fast in our house." },
];

// ---- lookup helpers, shared by every route handler in app/api/catalogue ----
export const findOil = (slug: string) => oils.find((o) => o.slug === slug);
export const findOilById = (id: string) => oils.find((o) => o.id === id);
export const findProduct = (slug: string) => products.find((p) => p.slug === slug);
export const findProductById = (id: string) => products.find((p) => p.id === id);
export const findPackaging = (id: string) => packagings.find((p) => p.id === id);
export const variantsForOil = (oilId: string) =>
  variants.filter((v) => products.find((p) => p.id === v.productId)?.oilId === oilId);
export const variantsForProduct = (productId: string) =>
  variants.filter((v) => v.productId === productId);
export const reviewsForProduct = (productId: string) =>
  reviews.filter((r) => r.productId === productId);
