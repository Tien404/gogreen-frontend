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

export function simulationLabel(
  kind: Schemas["SimulationRunOut"]["scenario_type"],
) {
  return kind === "CHARGER_FAULT"
    ? "Charging-point fault"
    : "Metro rental demand surge";
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
