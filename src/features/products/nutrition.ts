export interface PosterBenefit {
  id: string;
  statement: string;
  contextLine: string;
  column: "banner" | "left" | "right";
}

export interface NutritionalHighlightItem {
  id: string;
  number: string;
  heading: string;
  description: string;
  badge: string;
}

export const POSTER_BANNER_BENEFIT: PosterBenefit = {
  id: "heart",
  statement: "SUPPORTS HEART HEALTH",
  contextLine:
    "Naturally low in fat in its plain form and contains magnesium and potassium that support normal bodily functions.",
  column: "banner",
};

export const POSTER_LEFT_BENEFITS: PosterBenefit[] = [
  {
    id: "digestive",
    statement: "SUPPORTS DIGESTIVE HEALTH",
    contextLine: "Contains dietary fibre, contributing to a balanced everyday diet.",
    column: "left",
  },
  {
    id: "bone",
    statement: "SUPPORTS BONE HEALTH",
    contextLine: "Provides naturally occurring calcium, magnesium, and phosphorus.",
    column: "left",
  },
  {
    id: "weight",
    statement: "SUPPORTS WEIGHT MANAGEMENT",
    contextLine:
      "Light, airy popped snack naturally low in fat in its unseasoned plain form.",
    column: "left",
  },
  {
    id: "nutrient-rich",
    statement: "NUTRIENT-RICH",
    contextLine:
      "Contains plant protein, carbohydrates, dietary fibre, and essential minerals.",
    column: "left",
  },
];

export const POSTER_RIGHT_BENEFITS: PosterBenefit[] = [
  {
    id: "antioxidants",
    statement: "RICH IN ANTIOXIDANTS",
    contextLine:
      "Naturally contains antioxidant compounds including polyphenols and flavonoids; research is ongoing.",
    column: "right",
  },
  {
    id: "plant-based",
    statement: "SOURCE OF PLANT-BASED NUTRIENTS",
    contextLine: "100% botanical popped seed kernel of Euryale ferox cultivated in Bihar wetlands.",
    column: "right",
  },
  {
    id: "crunchy",
    statement: "A SATISFYING, CRUNCHY SNACK",
    contextLine:
      "Crisp aerated puff texture suited to roasted snacks, culinary dishes, and food formulations.",
    column: "right",
  },
  {
    id: "superfood",
    statement: "TRADITIONAL INDIAN SUPERFOOD",
    contextLine:
      "Harvested and enjoyed across India for generations; rooted in Bihar's food heritage.",
    column: "right",
  },
];

export const NUTRITIONAL_HIGHLIGHTS: NutritionalHighlightItem[] = [
  {
    id: "amino-acids",
    number: "01",
    heading: "ESSENTIAL & NON-ESSENTIAL AMINO ACIDS",
    description:
      "Makhana contains a diverse amino acid profile, including both essential and non-essential amino acids, contributing to its plant-based nutritional value.",
    badge: "Protein Quality",
  },
  {
    id: "histidine-rich",
    number: "02",
    heading: "HISTIDINE-RICH",
    description:
      "Contains Histidine, an essential amino acid important for growth, tissue maintenance, and normal physiological functions—particularly valued during periods of growth and development.",
    badge: "Essential Amino Acid",
  },
  {
    id: "immunity-support",
    number: "03",
    heading: "NUTRITION THAT SUPPORTS IMMUNITY",
    description:
      "Dietary amino acids and naturally occurring micronutrients help support normal immune function as part of a varied, balanced diet.",
    badge: "Daily Wellness",
  },
  {
    id: "eaai-profile",
    number: "04",
    heading: "RICH AMINO ACID PROFILE",
    description:
      "Food-science studies of Euryale ferox seed kernels report a balanced amino acid composition and notable essential amino acid index (EAAI) compared with many conventional snack grains.",
    badge: "EAAI Composition",
  },
  {
    id: "low-gi",
    number: "05",
    heading: "LOW GLYCEMIC INDEX",
    description:
      "Reported in nutritional literature to have a relatively low glycemic index in its plain form, making it a considered option for balanced, mindful snacking.",
    badge: "Balanced Energy",
  },
];

export const NUTRITIONAL_PROFILE_PILLARS = [
  "Carbohydrates",
  "Protein",
  "Dietary Fibre",
  "Magnesium · Phosphorus · Potassium · Calcium · Iron",
  "Naturally Low Fat (Plain Form)",
] as const;

export const CULINARY_APPLICATIONS = [
  {
    id: "snacking",
    title: "Roasted & Seasoned Snacks",
    summary: "Evenly holds clean-label spices and light glazes while keeping its crisp crunch.",
  },
  {
    id: "culinary",
    title: "Culinary & Kitchen Bulk",
    summary: "Versatile in traditional Indian recipes, curries, kheer, and gluten-free menus.",
  },
  {
    id: "ingredients",
    title: "Food Manufacturing",
    summary: "Ideal base for puffed snacks, trail mixes, roasted flakes, and milled flours.",
  },
] as const;

export const NUTRITION_ACCURACY_NOTE =
  "Shown in the context of a balanced diet. Makhana is naturally gluten-free and low in fat in its plain, unprocessed form; gluten-free suitability for finished goods depends on agreed processing and packing controls. Statements reflect general properties reported in published literature on makhana seed kernels and are not medical claims.";

/**
 * Internal compliance register: Client-provided traditional/marketing claims
 * intentionally withheld from public medical claims pending substantiation.
 */
export const HELD_CLIENT_CLAIMS_PENDING_SUBSTANTIATION = [
  "Good for diabetic patients",
  "Maintains kidney health",
  "Detoxifies liver",
  "Improves bone strength",
  "Cure for diarrhea",
  "Helps build muscle mass",
  "Good for fertility in men",
  "Prevents skin problems",
  "Anti-aging benefits",
] as const;
