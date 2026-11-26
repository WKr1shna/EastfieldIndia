export interface MakhanaGrade {
  id: string;
  name: string;
  inquiryValue: string;
  shortLabel: string;
  summary: string;
  useCase: string;
  sizingContext: string;
  packagingContext: string;
  image: string;
  imageAlt: string;
  visualNote: string;
  scaleFactor: number;
}

export const MAKHANA_GRADES: MakhanaGrade[] = [
  {
    id: "4-suta",
    name: "4 SUTA",
    inquiryValue: "4 Suta",
    shortLabel: "Commercial / Bulk",
    summary: "Commercial / bulk applications.",
    useCase:
      "Suited to commercial processing, roasted snack formulations, flour/ingredient milling, and high-volume trade lines where uniform bulk utility is prioritized.",
    sizingContext: "Smaller commercial suta band; lot distribution confirmed per sample.",
    packagingContext: "Bulk woven or food-grade lined sacks per buyer specification.",
    image: "/images/grades/4-suta.jpg",
    imageAlt: "Illustrative visual of 4 Suta commercial bulk grade Bihar makhana in a dark green ceramic bowl",
    visualNote: "Illustrative visual — actual lot size profile confirmed against sample.",
    scaleFactor: 0.72,
  },
  {
    id: "5-suta",
    name: "5 SUTA",
    inquiryValue: "5 Suta",
    shortLabel: "Wholesale & Trade",
    summary: "Common wholesale and trade requirements.",
    useCase:
      "Widely used across domestic wholesale, regional distribution, and food-service lines balancing visual consistency and commercial viability.",
    sizingContext: "Mid-tier trade suta band; size distribution verified lot by lot.",
    packagingContext: "Unbranded bulk bags or distributor-ready master packs by agreement.",
    image: "/images/grades/5-suta.jpg",
    imageAlt: "Illustrative visual of 5 Suta wholesale trade grade Bihar makhana in a dark green ceramic bowl",
    visualNote: "Illustrative visual — actual lot size profile confirmed against sample.",
    scaleFactor: 0.84,
  },
  {
    id: "6-suta",
    name: "6 SUTA",
    inquiryValue: "6 Suta",
    shortLabel: "Premium & Retail",
    summary: "Selected premium and retail-oriented requirements.",
    useCase:
      "Chosen by retail brands, D2C snack makers, and export buyers requiring plump appearance, strong puff expansion, and clean presentation.",
    sizingContext: "Selected larger suta band; uniformity and visual condition agreed upfront.",
    packagingContext: "Bulk export cartons, lined bags, or private-label coordination.",
    image: "/images/grades/6-suta.jpg",
    imageAlt: "Illustrative visual of 6 Suta premium retail grade Bihar makhana in a dark green ceramic bowl showing natural creases and irregular contours",
    visualNote: "Illustrative visual — realistic commercial proportion; actual lot size profile confirmed per sample.",
    scaleFactor: 0.94,
  },
  {
    id: "6-plus-suta",
    name: "6+ SUTA",
    inquiryValue: "6+ Suta",
    shortLabel: "Larger-Size Selection",
    summary: "Larger-size requirements, subject to lot assessment.",
    useCase:
      "Targeted for flagship retail packs, gifting assortments, and export specifications requesting fuller pop diameter while preserving natural makhana texture.",
    sizingContext: "Upper suta selection; availability and count confirmed per seasonal lot.",
    packagingContext: "Protective moisture-barrier bulk packs or brand-ready formats.",
    image: "/images/grades/6-plus-suta.jpg",
    imageAlt: "Illustrative visual of 6+ Suta larger-size Bihar makhana in a dark green ceramic bowl showing natural texture and surface flecks",
    visualNote: "Illustrative visual — realistic jumbo grade proportion; actual lot size profile confirmed per sample.",
    scaleFactor: 1.0,
  },
  {
    id: "custom",
    name: "CUSTOM",
    inquiryValue: "Custom requirement",
    shortLabel: "Buyer-Defined Spec",
    summary: "Buyer-defined grade and acceptance criteria.",
    useCase:
      "Tailored blends, specific sieve tolerances, moisture thresholds, or application-specific raw material lots aggregated backwards from your brief.",
    sizingContext: "Defined directly by buyer sieve band, broken tolerance, and appearance criteria.",
    packagingContext: "Bulk, unbranded, brand supply, or private-label coordination by agreement.",
    image: "/images/sourcing/b2b-inspection-supply.jpg",
    imageAlt: "Illustrative visual of stainless steel grading sieves and makhana sample inspection bowls",
    visualNote: "Illustrative visual — structured around your custom technical brief.",
    scaleFactor: 0.9,
  },
];

export const SUPPLY_FORMATS = [
  {
    title: "Bulk Supply",
    detail: "Consolidated commercial lots in food-grade bulk sacks or lined cartons.",
  },
  {
    title: "Unbranded Supply",
    detail: "Clean trade-ready lots prepared for downstream processing or repacking.",
  },
  {
    title: "Brand Supply",
    detail: "Specification-aligned raw material supporting established food labels.",
  },
  {
    title: "Private-Label Coordination",
    detail: "Available by agreed arrangement based on volume, format, and destination.",
  },
] as const;
