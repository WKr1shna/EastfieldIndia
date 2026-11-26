export interface ProcurementStage {
  number: string;
  title: string;
  headline: string;
  message: string;
  steps: string[];
}

export interface BuyerJourneyStep {
  step: string;
  title: string;
  description: string;
  stageRef: "01" | "02" | "03";
  stageTitle: "UNDERSTAND" | "SOURCE & VERIFY" | "SUPPLY";
}

export const PROCUREMENT_STAGES: ProcurementStage[] = [
  {
    number: "01",
    title: "UNDERSTAND",
    headline: "Understand the buyer's requirements.",
    message: "We begin with your requirement, not a generic product offering.",
    steps: [
      "Buyer brief",
      "Grade",
      "Quantity",
      "Intended application",
      "Destination",
      "Packaging requirements",
      "Quality specifications",
      "Required documents",
    ],
  },
  {
    number: "02",
    title: "SOURCE & VERIFY",
    headline: "Source appropriate supply and assess it against the agreed requirements.",
    message: "Suitable supply is identified, evaluated and aligned with the agreed specifications.",
    steps: [
      "Identify suitable sourcing options",
      "Review availability",
      "Evaluate samples",
      "Align specifications",
      "Aggregate suitable lots",
      "Assess agreed quality parameters",
      "Confirm the lot",
    ],
  },
  {
    number: "03",
    title: "SUPPLY",
    headline: "Furnish the confirmed requirement.",
    message:
      "A confirmed requirement moves towards supply, with the opportunity for repeat buying and replenishment.",
    steps: [
      "Confirm commercial terms",
      "Confirm quantities and grade",
      "Confirm packaging",
      "Coordinate dispatch",
      "Supply the order",
      "Discuss repeat procurement",
    ],
  },
];

export const BUYER_JOURNEY_STEPS: BuyerJourneyStep[] = [
  {
    step: "01",
    title: "SHARE THE BRIEF",
    description: "Grade, quantity, intended use and destination.",
    stageRef: "01",
    stageTitle: "UNDERSTAND",
  },
  {
    step: "02",
    title: "CHECK AVAILABILITY",
    description: "Review sourcing options, timing and indicative commercial terms.",
    stageRef: "02",
    stageTitle: "SOURCE & VERIFY",
  },
  {
    step: "03",
    title: "EVALUATE THE SAMPLE",
    description: "Align product expectations and acceptance criteria.",
    stageRef: "02",
    stageTitle: "SOURCE & VERIFY",
  },
  {
    step: "04",
    title: "CONFIRM THE LOT",
    description: "Agree quantity, grade, checks, packing and delivery terms.",
    stageRef: "02",
    stageTitle: "SOURCE & VERIFY",
  },
  {
    step: "05",
    title: "AGGREGATE & VERIFY",
    description: "Consolidate the lot and assess agreed parameters.",
    stageRef: "02",
    stageTitle: "SOURCE & VERIFY",
  },
  {
    step: "06",
    title: "DISPATCH & REPLENISH",
    description: "Furnish the order and discuss the next buying cycle.",
    stageRef: "03",
    stageTitle: "SUPPLY",
  },
];
