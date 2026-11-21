import type {
  Activity,
  Charge,
  Dispatch,
  Incident,
  State,
  Vehicle,
} from "@/domain/types";
import {
  apiClock,
  hubState,
  serverAvailableCounts,
} from "@/features/hubs/hubResources";
import type { Schemas } from "@/shared/api/contract.generated";
import { ApiError } from "@/shared/api/errors";
import { apiTime, mapHub, mapStatus, mapVehicle } from "./apiMappers";
import { readableCode } from "./operatorRecords";
import { activityLink, chargeSchedule } from "./studentRecords";
const clock = (instant: string) => apiClock(apiTime(instant));
export function dispatchRecord(row: Schemas["DispatchOut"]): Dispatch {
  const status = mapStatus("dispatch", row.status);
  if (!status)
    throw new ApiError(
      502,
      "INVALID_RESPONSE",
      "Unexpected dispatch status.",
      true,
    );
  return {
    id: row.task_id,
    source: row.from_hub_id,
    destination: row.to_hub_id,
    vehicles: [row.vehicle_id],
    status,
    reason: row.reason ?? undefined,
    started: row.started_at ? clock(row.started_at) : undefined,
    completed: row.completed_at ? clock(row.completed_at) : undefined,
  };
}
export function incidentRecord(
  row: Schemas["IncidentOut"],
  hubs: State["hubs"],
): Incident {
  const status = mapStatus("incident", row.status);
  if (!status)
    throw new ApiError(
      502,
      "INVALID_RESPONSE",
      "Unexpected incident status.",
      true,
    );
  const hub = hubs.find((item) => item.id === row.hub_id)?.name ?? row.hub_id;
  return {
    id: row.incident_id,
    resource: [hub, row.vehicle_id ?? row.resource_id]
      .filter(Boolean)
      .join(" · "),
    severity: readableCode(row.severity),
    type: readableCode(row.incident_type),
    description: row.description ?? "",
    status,
    resolution: row.resolution_notes ?? undefined,
    time: clock(row.opened_at),
  };
}
export function operatorActivity(row: Schemas["ActivityOut"]): Activity {
  return {
    id: row.operation_id,
    actor: row.actor_id,
    action: row.action.toLowerCase().replaceAll("_", "-"),
    at: clock(row.at),
    result:
      row.outcome.charAt(0).toUpperCase() + row.outcome.slice(1).toLowerCase(),
    resource: row.resource_id,
    reason: row.reason ?? "",
    link: activityLink(row, "operator") ?? "",
  };
}
export function operatorCharge(
  row: Schemas["ChargingSessionOut"],
  vehicles: Vehicle[],
): Charge {
  const status = mapStatus("charging", row.status);
  if (!status)
    throw new ApiError(
      502,
      "INVALID_RESPONSE",
      "Unexpected charging status.",
      true,
    );
  const vehicle = vehicles.find((item) => item.id === row.vehicle_id);
  return {
    id: row.session_id,
    owner: vehicle ? "operator" : "",
    vehicle: row.vehicle_id,
    hub: row.hub_id,
    booking: row.parking_reservation_id,
    status,
    battery: vehicle?.battery ?? null,
    target: row.target_battery_pct,
    schedule: chargeSchedule(row),
    reason: row.reason ?? "",
    point: row.charging_point_id ?? undefined,
  };
}
export function operatorState(
  snapshot: Schemas["OperationsOut"],
  s: State,
): State {
  const counts = serverAvailableCounts(snapshot.vehicles);
  const hubs = snapshot.hubs.map((dto) => {
    const hub = mapHub(dto);
    return hubState(hub, counts.get(hub.id) ?? 0);
  });
  const vehicles = snapshot.vehicles.map((row) => {
    const v = mapVehicle(row);
    return {
      id: v.id,
      type: v.type ?? "Shared vehicle",
      battery: v.battery,
      status: v.status ?? ("unknown" as const),
      hub: v.hubId,
      observedClock:
        v.batteryObservedAt == null ? null : apiClock(v.batteryObservedAt),
    };
  });
  return {
    ...s,
    clock: clock(snapshot.as_of),
    hubs,
    vehicles,
    incidents: snapshot.incidents.map((row) => incidentRecord(row, hubs)),
    dispatches: snapshot.dispatches.map(dispatchRecord),
    charges: snapshot.charging.map((row) => operatorCharge(row, vehicles)),
  };
}
