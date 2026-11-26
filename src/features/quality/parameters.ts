export interface QualityParameter {
  code: string;
  title: string;
  summary: string;
  detail: string;
}

export const QUALITY_PARAMETERS: QualityParameter[] = [
  {
    code: "01",
    title: "GRADE & SIZE",
    summary: "Suta band and size range.",
    detail: "Defined suta family and sieve profile matched to the intended commercial or retail channel.",
  },
  {
    code: "02",
    title: "UNIFORMITY",
    summary: "Size distribution within the lot.",
    detail: "Proportion of target-band pops versus undersized or oversized kernels across the consolidated batch.",
  },
  {
    code: "03",
    title: "MOISTURE",
    summary: "Agreed moisture limit.",
    detail: "Target moisture range aligned prior to packing to support crispness, shelf stability, and transit resilience.",
  },
  {
    code: "04",
    title: "BROKEN CONTENT",
    summary: "Accepted broken-piece percentage.",
    detail: "Clear tolerance threshold for splits, halves, or crushed pieces based on buyer application.",
  },
  {
    code: "05",
    title: "APPEARANCE",
    summary: "Colour, expansion and visual condition.",
    detail: "Cream-ivory tone, puff expansion symmetry, and acceptable natural seed-coat flecking.",
  },
  {
    code: "06",
    title: "FOREIGN MATTER",
    summary: "Cleanliness and visible impurities.",
    detail: "Visual cleaning expectations to keep the lot free of husk fragments, dust, and extraneous matter.",
  },
  {
    code: "07",
    title: "PACK & HANDLE",
    summary: "Packing, storage and transit conditions.",
    detail: "Liner selection, outer bag strength, palletization or carton spec suited to distance and humidity.",
  },
  {
    code: "08",
    title: "TESTS & DOCUMENTS",
    summary: "As required for buyer and destination.",
    detail: "Commercial paperwork and third-party lab testing coordinated per order, market, and destination.",
  },
];

export const QUALITY_DISCLAIMER =
  "Tolerances, inspection, testing and documents are agreed for the buyer, product lot and destination. No blanket certification or test claim is implied.";
