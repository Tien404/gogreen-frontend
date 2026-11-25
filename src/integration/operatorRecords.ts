import type { Schemas } from "@/shared/api/contract.generated";

const alertLabels: Record<string, string> = {
  HUB_FULL: "No bookable parking spaces",
  CHARGER_UNAVAILABLE: "Charging point unavailable",
  DISPATCH_INTERRUPTED: "Vehicle dispatch interrupted",
};
const metricLabels: Record<string, string> = {
  rental_requests: "Rental requests",
  rentals_served: "Rentals served",
  unmet_rental_demand: "Unmet rental demand",
  available_vehicles_at_end: "Available vehicles at end",
  available_vehicles_at_start: "Available vehicles at start",
  parking_arrivals: "Parking arrivals",
  parking_occupied_at_end: "Occupied spaces at end",
  parking_bookable_at_end: "Bookable spaces at end",
  parking_rejected: "Parking arrivals turned away",
  charging_requests: "Charging requests",
  charging_capacity: "Usable charging capacity",
  charges_completed: "Charges completed",
  charges_not_completed_at_horizon: "Charges incomplete at end",
};

export function readableCode(code: string) {
  return code.toLowerCase().replaceAll("_", " ");
}

export function alertLabel(code: string) {
  return alertLabels[code] ?? readableCode(code);
}

export function metricLabel(name: string) {
  return metricLabels[name] ?? readableCode(name);
}

export function dispatchUrl(id: string) {
  return `/operator/dispatch/${encodeURIComponent(id)}`;
}

export function simulationUrl(id: string) {
  return `/operator/what-if/runs/${encodeURIComponent(id)}`;
}

export const simulationTypes = {
  RENTAL_DEMAND_SURGE: {
    query: "rental",
    label: "Rental demand surge",
    description: "Add rental requests at Metro or another hub.",
    icon: "activity",
  },
  PARKING_CAPACITY: {
    query: "parking",
    label: "Parking capacity",
    description:
      "See when new arrivals fill the hub and how many are turned away.",
    icon: "parking",
  },
  CHARGING_DEMAND_SURGE: {
    query: "charging",
    label: "Charging demand surge",
    description: "Add charging requests and see how many can finish.",
    icon: "bolt",
  },
  CHARGER_FAULT: {
    query: "charger",
    label: "Charging-point failure",
    description: "Model the loss of one working charging point.",
    icon: "alert",
  },
  FLEET_IMBALANCE: {
    query: "fleet",
    label: "Rental fleet imbalance",
    description: "Model a shortage or concentration of rental vehicles.",
    icon: "dispatch",
  },
} as const satisfies Record<
  Schemas["SimulationRunOut"]["scenario_type"],
  object
>;

export function simulationLabel(
  kind: Schemas["SimulationRunOut"]["scenario_type"],
) {
  return simulationTypes[kind].label;
}

export function dispatchAdviceUrl(advice: Schemas["SimulationAdvice"]) {
  const { type, vehicle_id, from_hub_id, to_hub_id } = advice;
  if (
    type !== "REDISTRIBUTE_VEHICLE" ||
    !vehicle_id ||
    !from_hub_id ||
    !to_hub_id
  )
    return null;
  return `/operator/dispatch?${new URLSearchParams({ vehicle_id, from_hub_id, to_hub_id })}#plan-dispatch`;
}
