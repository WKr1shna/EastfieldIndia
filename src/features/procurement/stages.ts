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
    title: "SOURCE & EVALUATE SAMPLE",
    description:
      "Review sourcing options, timing and indicative terms, then evaluate samples to align expectations and acceptance criteria.",
    stageRef: "02",
    stageTitle: "SOURCE & VERIFY",
  },
  {
    step: "03",
    title: "CONFIRM & VERIFY THE LOT",
    description:
      "Agree quantity, grade, packing and delivery terms, then aggregate the lot and verify agreed parameters.",
    stageRef: "02",
    stageTitle: "SOURCE & VERIFY",
  },
  {
    step: "04",
    title: "DISPATCH & REPLENISH",
    description: "Furnish the order and discuss the next buying cycle.",
    stageRef: "03",
    stageTitle: "SUPPLY",
  },
];
