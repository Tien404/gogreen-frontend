export const presets = [
  ["normal", "Normal campus day", "Rental, parking and charging journeys."],
  [
    "unavailable",
    "Last vehicle unavailable",
    "The selected vehicle changes before confirmation.",
  ],
  ["expiry", "Hold expiry", "Advance 15 minutes after creating a hold."],
  [
    "full",
    "Return hub full",
    "Central Library Hub is full; alternatives remain available.",
  ],
  [
    "no-alternative",
    "No return alternatives",
    "Every hub is full. The ride remains active.",
  ],
  [
    "combined",
    "Combined package unavailable",
    "Parking is available; charging is unavailable.",
  ],
  [
    "overstay",
    "No-show and overstay",
    "Includes an occupied overdue booking and extension conflict.",
  ],
  [
    "charging",
    "Charging exceptions",
    "Pending, interrupted and unmet-target sessions.",
  ],
  [
    "dispatch",
    "Dispatch recovery",
    "Destination becomes unavailable while in transit.",
  ],
  [
    "stale",
    "Stale data and zero capacity",
    "Unknown battery and a closed hub.",
  ],
  [
    "what-if",
    "What-if failure and stale result",
    "Retry a failed mock run; review a stale recommendation.",
  ],
  ["empty", "Empty history", "An empty activity view."],
  ["load-error", "Load failure", "Retry a scripted view loading failure."],
  [
    "older-event",
    "Ignored sample event",
    "Duplicate or older sample is recorded as ignored.",
  ],
] as const;
