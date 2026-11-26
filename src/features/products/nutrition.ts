export interface NutritionHighlight {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  nutrients?: string[];
}

export interface ProductAttribute {
  label: string;
  detail: string;
}

export interface CulinaryApplication {
  id: string;
  title: string;
  summary: string;
  formats: string[];
}

export const MAKHANA_ATTRIBUTES: ProductAttribute[] = [
  {
    label: "Naturally Gluten-Free",
    detail: "Popped seed kernel of Euryale ferox, naturally free from wheat gluten in its plain form.",
  },
  {
    label: "Crunchy Texture",
    detail: "Light, crisp aerated structure formed through traditional controlled heat-popping.",
  },
  {
    label: "Plant-Based",
    detail: "100% botanical aquatic crop cultivated in Bihar's freshwater wetlands.",
  },
  {
    label: "Low Fat (Plain Form)",
    detail: "Naturally low in fat prior to roasting oil or seasoning additions.",
  },
  {
    label: "Nutrient-Rich Profile",
    detail: "Contains plant protein, dietary fibre, carbohydrates, and essential minerals.",
  },
  {
    label: "Traditional Indian Heritage",
    detail: "Consumed across India for generations in fasting foods, sweets, and everyday snacks.",
  },
];

export const NUTRITION_HIGHLIGHTS: NutritionHighlight[] = [
  {
    id: "heart",
    title: "HEART-CONSCIOUS CHOICES",
    eyebrow: "Naturally Low Fat",
    description:
      "Makhana is naturally low in fat in its plain form and contains minerals such as magnesium and potassium that contribute to normal bodily functions.",
  },
  {
    id: "digestive",
    title: "DIGESTIVE WELLNESS",
    eyebrow: "Dietary Fibre",
    description:
      "Makhana contains dietary fibre, which may contribute to a balanced diet and everyday digestive wellness.",
  },
  {
    id: "minerals",
    title: "MINERALS & NUTRIENTS",
    eyebrow: "Essential Elements",
    description:
      "Makhana provides naturally occurring minerals that support normal nutrition as part of a varied diet.",
    nutrients: ["Magnesium", "Phosphorus", "Potassium", "Calcium", "Iron"],
  },
  {
    id: "antioxidant",
    title: "ANTIOXIDANT POTENTIAL",
    eyebrow: "Phytonutrients",
    description:
      "Makhana naturally contains antioxidant compounds, including polyphenols and flavonoids. Research into specific health effects is ongoing.",
  },
  {
    id: "snack",
    title: "A SATISFYING SNACK",
    eyebrow: "Crisp & Versatile",
    description:
      "Its crunchy texture and light puff structure make it suited to roasted snack ranges, culinary dishes, and clean-label food formulations.",
  },
];

export const NUTRITIONAL_PROFILE_PILLARS = [
  { name: "Carbohydrates", note: "Primary light energy source" },
  { name: "Protein", note: "Plant-derived seed kernel protein" },
  { name: "Dietary Fibre", note: "Supports balanced daily intake" },
  { name: "Essential Minerals", note: "Mg · P · K · Ca · Fe" },
  { name: "Naturally Low Fat", note: "In unseasoned plain form" },
] as const;

export const CULINARY_APPLICATIONS: CulinaryApplication[] = [
  {
    id: "snacking",
    title: "Roasted & Seasoned Snacks",
    summary:
      "Absorbs spice blends, olive or ghee glazes, and clean-label seasonings evenly without losing crunch.",
    formats: ["Flavoured retail packs", "Plain roasted tubs", "Trail & nut mixes"],
  },
  {
    id: "culinary",
    title: "Traditional & Modern Culinary",
    summary:
      "Used across Indian curries, kheer, festival preparations, and contemporary gluten-free kitchen menus.",
    formats: ["HoReCa kitchen bulk", "Festive & sweet recipes", "Crisp salad/soup toppers"],
  },
  {
    id: "ingredients",
    title: "Food Manufacturing & Milling",
    summary:
      "Processed into puffed snack bases, roasted flakes, or finely milled gluten-free ingredient flours.",
    formats: ["4 Suta commercial grades", "Gluten-free snack bases", "Custom nutrition blends"],
  },
];

export const NUTRITION_ACCURACY_NOTE =
  "Makhana is naturally gluten-free and low in fat in its plain, unprocessed form. Gluten-free suitability for finished consumer products depends on agreed processing, seasoning, and packing controls. Nutritional characteristics describe plain makhana seed kernels and are not intended as medical claims.";
