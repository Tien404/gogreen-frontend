import type { AccountProfile, VehicleType } from "@/domain/types";
import type { Schemas } from "@/shared/api/contract.generated";
import { ApiError } from "@/shared/api/errors";

function invalidResponse(): never {
  throw new ApiError(
    502,
    "INVALID_RESPONSE",
    "Unexpected data from the API.",
    true,
  );
}

export function apiId(value: string): string {
  if (typeof value !== "string" || !value.trim()) return invalidResponse();
  return value;
}

export function apiTime(value: string): number {
  const time = Date.parse(value);
  if (!Number.isFinite(time) || !/(?:Z|[+-]\d{2}:\d{2})$/i.test(value))
    return invalidResponse();
  return time;
}

export function mapSession(
  dto: Schemas["SessionView"],
  email = "",
): AccountProfile {
  if (
    !dto ||
    typeof dto.display_name !== "string" ||
    !["student", "operator"].includes(dto.role)
  ) {
    return invalidResponse();
  }
  apiTime(dto.expires_at);
  return {
    name: dto.display_name,
    email,
    role: dto.role,
    persona: apiId(dto.account_id),
  };
}

const statuses = {
  vehicle: {
    AVAILABLE: "available",
    RESERVED: "held",
    IN_USE: "riding",
    CHARGING: "charging",
    MAINTENANCE: "maintenance",
    IN_TRANSIT: "in-transit",
    COMMITTED: "committed",
  },
  hold: {
    CONFIRMED: "held",
    CANCELLED: "cancelled",
    EXPIRED: "expired",
    COMPLETED: "picked-up",
  },
  rental: { ACTIVE: "active", COMPLETED: "completed", DISPUTED: "disputed" },
  parking: {
    RESERVED: "confirmed",
    CANCELLED: "cancelled",
    CHECKED_IN: "checked-in",
    COMPLETED: "completed",
    EXPIRED: "expired",
    OVERSTAYING: "overstaying",
  },
  charging: {
    PENDING: "pending",
    SCHEDULED: "scheduled",
    ACTIVE: "active",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    STOPPED: "stopped",
    INTERRUPTED: "interrupted",
  },
  incident: {
    OPEN: "open",
    IN_PROGRESS: "open",
    RESOLVED: "resolved",
    CLOSED: "resolved",
  },
  dispatch: {
    PLANNED: "planned",
    IN_TRANSIT: "in-transit",
    COMPLETED: "completed",
    FAILED: "failed",
  },
  simulation: { COMPLETED: "completed" },
} as const;

type ApiStatus<K extends keyof typeof statuses> =
  K extends keyof typeof statuses
    ? (typeof statuses)[K][keyof (typeof statuses)[K]]
    : never;

export function mapStatus<K extends keyof typeof statuses>(
  kind: K,
  value?: string | null,
): ApiStatus<K> | null {
  const table: Partial<Record<string, string>> = statuses[kind];
  return value && Object.hasOwn(table, value)
    ? (table[value] as ApiStatus<K>)
    : null;
}

const vehicleTypes = new Map<string, VehicleType>([
  ["e-bike", "Electric bicycle"],
  ["e-motorcycle", "Electric motorcycle"],
]);

export function mapVehicle(dto: Schemas["VehicleOut"]) {
  return {
    id: apiId(dto.vehicle_id),
    hubId: dto.current_hub_id == null ? null : apiId(dto.current_hub_id),
    type: vehicleTypes.get(dto.vehicle_type ?? "") ?? null,
    status: mapStatus("vehicle", dto.status),
    battery: dto.battery_pct ?? null,
    batteryObservedAt:
      dto.battery_observed_at == null ? null : apiTime(dto.battery_observed_at),
  };
}

export function mapHub(dto: Schemas["HubOut"]) {
  if (
    !dto ||
    typeof dto.name !== "string" ||
    !Array.isArray(dto.charging_points) ||
    ![dto.parking_capacity, dto.physical_free_now, dto.bookable_now].every(
      (value) => Number.isInteger(value) && value >= 0,
    )
  ) {
    return invalidResponse();
  }
  if (
    dto.physical_free_now > dto.parking_capacity ||
    dto.bookable_now > dto.physical_free_now
  ) {
    return invalidResponse();
  }
  return {
    id: apiId(dto.hub_id),
    name: dto.name,
    type: dto.hub_type ?? null,
    status:
      dto.status === "ACTIVE"
        ? ("active" as const)
        : dto.status == null
          ? ("unknown" as const)
          : ("closed" as const),
    capacity: dto.parking_capacity,
    physicalFree: dto.physical_free_now,
    bookable: dto.bookable_now,
    updatedAt: apiTime(dto.as_of),
    points: dto.charging_points.map((point) => ({
      id: apiId(point.resource_id),
      status:
        point.status === "AVAILABLE"
          ? ("available" as const)
          : point.status === "IN_USE"
            ? ("in-use" as const)
            : ("unavailable" as const),
    })),
  };
}

export type ApiHub = ReturnType<typeof mapHub>;
