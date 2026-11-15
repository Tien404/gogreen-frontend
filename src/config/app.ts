export const config = {
  brand: "gogreen",
  tagline: "Your campus, connected.",
  title: "gogreen · VNU-HCM mobility",
  campus: "VNU-HCM Urban Area",
  timezone: "Asia/Ho_Chi_Minh",
  snapshot: "2026-10-20T09:00:00+07:00",
  // Sample policies for the frontend; these values are not prescribed by the assignment.
  vehicleTypes: ["Electric bicycle", "Electric motorcycle"],
  holdMinutes: 10,
  minimumBattery: 25,
  extendedJourneyBattery: 60,
  extensionMinutes: 30,
  checkInGrace: 15,
  chargeStep: 20,
  packageTarget: 80,
  pointPowerKW: 3.6,
} as const;
