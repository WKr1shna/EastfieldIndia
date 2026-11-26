export interface BuyerSegment {
  number: string;
  title: string;
  inquiryValue: string;
  description: string;
  focusPoints: string[];
  tag: string;
}

export const BUYER_SEGMENTS: BuyerSegment[] = [
  {
    number: "01",
    title: "EXPORTERS & IMPORTERS",
    inquiryValue: "Importer",
    description:
      "Grade-defined bulk procurement, lot consolidation and destination-specific requirements.",
    focusPoints: [
      "Grade-defined lot aggregation",
      "Export packing & transit alignment",
      "Order-specific documentation support",
    ],
    tag: "Cross-Border Trade",
  },
  {
    number: "02",
    title: "WHOLESALERS & DISTRIBUTORS",
    inquiryValue: "Wholesaler",
    description:
      "Trade-focused grades, coordinated volumes and repeat procurement planning.",
    focusPoints: [
      "Consistent 4, 5 & 6 Suta availability",
      "Structured replenishment cycles",
      "Reliable Bihar-origin dispatch",
    ],
    tag: "Trade & Distribution",
  },
  {
    number: "03",
    title: "RETAIL, E-COMMERCE & D2C",
    inquiryValue: "E-commerce/D2C",
    description:
      "Raw-material sourcing for snack, wellness and food brands; packaging or private-label coordination by agreement.",
    focusPoints: [
      "Retail-oriented 6 & 6+ Suta lots",
      "Consistent expansion & visual condition",
      "Private-label coordination by agreement",
    ],
    tag: "Consumer Food Brands",
  },
  {
    number: "04",
    title: "HoReCa & INSTITUTIONAL",
    inquiryValue: "HoReCa",
    description:
      "Application-led bulk requirements, agreed specifications and replenishment cycles.",
    focusPoints: [
      "Application-matched grade profiles",
      "Agreed moisture & broken limits",
      "Scheduled institutional supply",
    ],
    tag: "Foodservice & Bulk",
  },
];

export const SOURCE_ECOSYSTEM_NODES = [
  "Producers",
  "Processors",
  "Local sourcing networks",
  "Regional suppliers",
  "Makhana-producing regions",
] as const;

export const BUYER_ECOSYSTEM_NODES = [
  "Importers",
  "Exporters",
  "Wholesalers",
  "Distributors",
  "Food brands",
  "Retail businesses",
  "HoReCa",
  "Institutional buyers",
] as const;
