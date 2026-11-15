export const scenarioFixtures: Record<
  string,
  {
    hub: string;
    source: string;
    destination: string;
    baseline: number[];
    scenario: number[];
    served: number;
    rejected: number;
    waiting: number;
    trips: number;
    baselineServed: number;
    baselineRejected: number;
    wait: number;
    started: number;
    chargingWaiting: number;
    event: string;
    rationale: string;
  }
> = {
  "Demand surge": {
    hub: "metro",
    source: "north",
    destination: "metro",
    baseline: [12, 16, 18, 14, 11, 10],
    scenario: [12, 20, 28, 32, 24, 18],
    served: 32,
    rejected: 3,
    waiting: 5,
    trips: 25,
    baselineServed: 28,
    baselineRejected: 7,
    wait: 12,
    started: 6,
    chargingWaiting: 2,
    event: "Student arrivals from Metro Line 1 peak at Metro Interchange Hub.",
    rationale:
      "The arrival preset concentrates onward campus journeys at Metro Interchange Hub. Dormitory Hub provides an illustrative source for additional shared vehicles.",
  },
  "Full hub": {
    hub: "library",
    source: "north",
    destination: "science",
    baseline: [12, 16, 18, 14, 11, 10],
    scenario: [12, 18, 24, 28, 22, 16],
    served: 27,
    rejected: 8,
    waiting: 5,
    trips: 21,
    baselineServed: 28,
    baselineRejected: 7,
    wait: 15,
    started: 4,
    chargingWaiting: 3,
    event: "Central Library Hub reaches its fixture parking capacity.",
    rationale:
      "The full-hub preset redirects campus demand toward University Campus Hub, while Dormitory Hub retains spare vehicles.",
  },
  "Increased charging demand": {
    hub: "library",
    source: "north",
    destination: "science",
    baseline: [4, 6, 8, 6, 4, 3],
    scenario: [4, 9, 14, 18, 16, 12],
    served: 24,
    rejected: 6,
    waiting: 10,
    trips: 19,
    baselineServed: 28,
    baselineRejected: 7,
    wait: 24,
    started: 8,
    chargingWaiting: 7,
    event: "Charging requests increase; seven remain waiting.",
    rationale:
      "The charging-demand preset holds more vehicles at Central Library Hub. University Campus Hub has fewer rental-ready vehicles.",
  },
  "Charging-point failure": {
    hub: "library",
    source: "north",
    destination: "science",
    baseline: [4, 6, 8, 6, 4, 3],
    scenario: [4, 7, 12, 15, 14, 10],
    served: 23,
    rejected: 9,
    waiting: 8,
    trips: 18,
    baselineServed: 28,
    baselineRejected: 7,
    wait: 28,
    started: 3,
    chargingWaiting: 6,
    event: "One charging point becomes unavailable in the result fixture.",
    rationale:
      "The fault preset reduces ready supply from Central Library Hub. A small transfer from Dormitory Hub supports the illustrated University Campus Hub shortfall.",
  },
  "Uneven fleet distribution": {
    hub: "library",
    source: "north",
    destination: "science",
    baseline: [12, 16, 18, 14, 11, 10],
    scenario: [12, 22, 30, 28, 26, 20],
    served: 30,
    rejected: 4,
    waiting: 6,
    trips: 24,
    baselineServed: 28,
    baselineRejected: 7,
    wait: 10,
    started: 5,
    chargingWaiting: 2,
    event:
      "Dormitory Hub retains spare vehicles while University Campus Hub demand rises.",
    rationale:
      "The uneven-fleet preset places most shared supply at Dormitory Hub and more requests at University Campus Hub.",
  },
};

export const scenarioTypes = [
  "Demand surge",
  "Full hub",
  "Increased charging demand",
  "Charging-point failure",
  "Uneven fleet distribution",
];
