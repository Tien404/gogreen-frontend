import type { Hub } from "@/domain/types";
import type { ApiHub } from "@/integration/apiMappers";
import { config } from "@/config/app";
import type { Schemas } from "@/shared/api/contract.generated";
import { hubPresentation } from "./hubPresentation";
export type HubResources = {
  id: string;
  name: string;
  area: string;
  capacity: number;
  occupied: number;
  parkingAvailable: number;
  availableVehicles: number;
  availablePoints: number;
  points: {
    id: string;
    status: string;
  }[];
};
export function liveHub(hub: ApiHub, availableVehicles: number): HubResources {
  return {
    id: hub.id,
    name: hub.name,
    area: hubPresentation[hub.id]?.area ?? "Campus hub",
    capacity: hub.capacity,
    occupied: hub.capacity - hub.physicalFree,
    parkingAvailable: hub.bookable,
    availableVehicles,
    availablePoints: hub.points.filter((point) => point.status === "available")
      .length,
    points: hub.points.map((point) => ({
      id: point.id,
      status:
        point.status === "available"
          ? "Available"
          : point.status === "in-use"
            ? "In use"
            : "Unavailable",
    })),
  };
}
export function apiClock(instant: number) {
  return (instant - Date.parse(config.snapshot)) / 60000;
}
export function serverAvailableCounts(vehicles: Schemas["VehicleOut"][]) {
  const counts = new Map<string, number>();
  for (const vehicle of vehicles) {
    const hub = vehicle.current_hub_id;
    if (hub != null && vehicle.status === "AVAILABLE") {
      counts.set(hub, (counts.get(hub) ?? 0) + 1);
    }
  }
  return counts;
}
export async function readPages<T>(
  read: (offset: number, limit: number) => Promise<T[]>,
) {
  const limit = 200;
  const rows: T[] = [];
  for (let offset = 0; ; offset += limit) {
    const page = await read(offset, limit);
    rows.push(...page);
    if (page.length < limit) return rows;
  }
}
export function hubState(hub: ApiHub, availableVehicles: number): Hub {
  return {
    id: hub.id,
    name: hub.name,
    capacity: hub.capacity,
    points: hub.points.length,
    ...(hubPresentation[hub.id] ?? { area: "Campus hub", x: 0, y: 0 }),
    live: {
      active: hub.status === "active",
      pointIds: hub.points.map((point) => point.id),
      occupied: hub.capacity - hub.physicalFree,
      bookable: hub.bookable,
      availablePoints: hub.points.filter(
        (point) => point.status === "available",
      ).length,
      availableVehicles,
    },
  };
}
