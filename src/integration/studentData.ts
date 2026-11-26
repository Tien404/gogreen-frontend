import { config } from "@/config/app";
import type {
  Activity,
  Booking,
  Charge,
  Hold,
  PrivateVehicle,
  Ride,
  State,
} from "@/domain/types";
import {
  apiClock,
  hubState,
  readPages,
  serverAvailableCounts,
} from "@/features/hubs/hubResources";
import type { ApiClient } from "@/shared/api/client";
import type { Schemas } from "@/shared/api/contract.generated";
import { ApiError } from "@/shared/api/errors";
import { apiId, apiTime, mapHub, mapStatus } from "./apiMappers";
import {
  activityLink,
  chargeSchedule,
  mapOwnedVehicle,
} from "./studentRecords";
type Resource =
  | "hubs"
  | "hold"
  | "holds"
  | "ride"
  | "rides"
  | "privateVehicles"
  | "booking"
  | "bookings"
  | "charge"
  | "charges"
  | "activity"
  | "availability";
export const studentScreens = {
  dashboard: [
    "hubs",
    "availability",
    "holds",
    "rides",
    "bookings",
    "charges",
    "privateVehicles",
  ],
  findRide: ["hubs", "availability", "holds", "rides"],
  hold: ["hubs", "hold"],
  ride: ["hubs", "ride"],
  privateVehicles: ["privateVehicles"],
  parkingList: ["hubs", "bookings", "privateVehicles", "charges"],
  newParking: ["hubs", "availability", "privateVehicles"],
  parking: ["hubs", "availability", "privateVehicles", "booking", "charges"],
  charging: ["hubs", "availability", "charges", "privateVehicles"],
  newCharging: ["hubs", "availability", "bookings", "privateVehicles"],
  charge: ["hubs", "availability", "charge", "privateVehicles"],
  activity: ["activity"],
} as const satisfies Record<string, readonly Resource[]>;
export type StudentScreen = keyof typeof studentScreens;
const clock = (value: string) => apiClock(apiTime(value));
const timestamp = (value: string | null) =>
  value === null ? undefined : clock(value);
function recordStatus<K extends "hold" | "rental" | "parking" | "charging">(
  kind: K,
  value: string,
) {
  const status = mapStatus(kind, value);
  if (status === null)
    throw new ApiError(
      502,
      "INVALID_RESPONSE",
      "Unexpected record status.",
      true,
    );
  return status;
}
export function studentHold(
  dto: Schemas["VehicleReservationOut"],
  owner: string,
): Hold {
  return {
    id: apiId(dto.reservation_id),
    owner,
    vehicle: apiId(dto.vehicle_id),
    origin: dto.origin_hub_id ?? "",
    destination: dto.intended_hub_id ?? "",
    expires: clock(dto.expires_at),
    status: recordStatus("hold", dto.status),
  };
}
export function studentRide(
  dto: Schemas["RentalOut"],
  owner: string,
  intendedHub?: string | null,
): Ride {
  return {
    id: apiId(dto.rental_id),
    owner,
    vehicle: apiId(dto.vehicle_id),
    origin: apiId(dto.origin_hub_id),
    destination: dto.return_hub_id ?? intendedHub ?? "",
    start: clock(dto.picked_up_at),
    end: timestamp(dto.returned_at),
    status: recordStatus("rental", dto.status),
  };
}
export function studentBooking(
  dto: Schemas["ParkingReservationOut"],
  owner: string,
): Booking {
  return {
    id: apiId(dto.reservation_id),
    owner,
    vehicle: apiId(dto.vehicle_id),
    hub: apiId(dto.hub_id),
    sessionId: dto.session_id ?? undefined,
    space: dto.parking_space_id,
    start: clock(dto.starts_at),
    end: clock(dto.ends_at),
    status: recordStatus("parking", dto.status),
    service: "Parking only",
  };
}
function studentVehicle(
  dto: Schemas["OwnedVehicleOut"],
  owner: string,
): PrivateVehicle {
  const vehicle = mapOwnedVehicle(dto);
  return {
    id: vehicle.id,
    owner,
    identifier: vehicle.label,
    type: vehicle.type ?? "Vehicle",
    battery: vehicle.battery,
  };
}
export function studentCharge(
  dto: Schemas["ChargingSessionOut"],
  owner: string,
  vehicles: PrivateVehicle[],
): Charge {
  return {
    id: apiId(dto.session_id),
    owner,
    vehicle: apiId(dto.vehicle_id),
    hub: apiId(dto.hub_id),
    booking: dto.parking_reservation_id,
    status: recordStatus("charging", dto.status),
    battery:
      vehicles.find((vehicle) => vehicle.id === dto.vehicle_id)?.battery ??
      null,
    target: dto.target_battery_pct,
    reason: dto.reason ?? "",
    point: dto.charging_point_id ?? undefined,
    schedule: chargeSchedule(dto),
  };
}
function studentActivity(
  dto: Schemas["ActivityOut"],
  owner: string,
  name?: string,
): Activity {
  return {
    id: apiId(dto.operation_id),
    persona: owner,
    actor: dto.actor_id === owner ? (name ?? owner) : dto.actor_id,
    action: dto.action.toLowerCase().replaceAll("_", "-"),
    resource: dto.resource_id,
    result:
      dto.outcome.charAt(0).toUpperCase() + dto.outcome.slice(1).toLowerCase(),
    reason: dto.reason ?? "",
    link: activityLink(dto) ?? "",
    at: clock(dto.at),
  };
}
export async function loadStudentData(
  api: ApiClient,
  screen: StudentScreen,
  id: string | undefined,
  owner: string,
  name: string | undefined,
  signal: AbortSignal,
): Promise<Partial<State>> {
  const resources: readonly Resource[] = studentScreens[screen];
  const needs = (resource: Resource) => resources.includes(resource);
  const [
    hubRows,
    availableVehicles,
    holdRows,
    rideRows,
    ownedRows,
    bookingRows,
    chargeRows,
    activityRows,
  ] = await Promise.all([
    needs("hubs")
      ? readPages((offset, limit) =>
          api.request("GET /mobility/hubs", {
            signal,
            query: { offset, limit },
          }),
        )
      : [],
    needs("availability")
      ? readPages((offset, limit) =>
          api.request("GET /mobility/vehicles", {
            signal,
            query: { offset, limit },
          }),
        )
      : [],
    needs("hold")
      ? api
          .request("GET /rentals/reservations/{reservation_id}", {
            signal,
            params: { reservation_id: id! },
          })
          .then((row) => [row])
      : needs("holds")
        ? readPages((offset, limit) =>
            api.request("GET /rentals/reservations", {
              signal,
              query: { offset, limit },
            }),
          )
        : [],
    needs("ride")
      ? api
          .request("GET /rentals/rentals/{rental_id}", {
            signal,
            params: { rental_id: id! },
          })
          .then((row) => [row])
      : needs("rides")
        ? readPages((offset, limit) =>
            api.request("GET /rentals/rentals", {
              signal,
              query: { offset, limit },
            }),
          )
        : [],
    needs("privateVehicles")
      ? readPages((offset, limit) =>
          api.request("GET /fleet/vehicles/private", {
            signal,
            query: { offset, limit },
          }),
        )
      : [],
    needs("booking")
      ? api
          .request("GET /parking/reservations/{reservation_id}", {
            signal,
            params: { reservation_id: id! },
          })
          .then((row) => [row])
      : needs("bookings")
        ? readPages((offset, limit) =>
            api.request("GET /parking/reservations", {
              signal,
              query: { offset, limit },
            }),
          )
        : [],
    needs("charge")
      ? api
          .request("GET /charging/sessions/{session_id}", {
            signal,
            params: { session_id: id! },
          })
          .then((row) => [row])
      : needs("charges")
        ? readPages((offset, limit) =>
            api.request("GET /charging/sessions", {
              signal,
              query: { offset, limit },
            }),
          )
        : [],
    needs("activity")
      ? readPages((offset, limit) =>
          api.request("GET /activity", { signal, query: { offset, limit } }),
        )
      : [],
  ]);
  const ride = needs("ride") ? rideRows[0] : undefined;
  const linkedHold =
    ride && !ride.return_hub_id
      ? await api.request("GET /rentals/reservations/{reservation_id}", {
          signal,
          params: { reservation_id: ride.reservation_id },
        })
      : undefined;
  const privateVehicles = ownedRows.map((row) => studentVehicle(row, owner));
  const counts = serverAvailableCounts(availableVehicles);
  const hubs = hubRows.map(mapHub);
  return {
    clock: hubs.length
      ? apiClock(Math.max(...hubs.map((hub) => hub.updatedAt)))
      : apiClock(Date.now()),
    hubs: hubs.map((hub) => hubState(hub, counts.get(hub.id) ?? 0)),
    privateVehicles,
    holds: holdRows.map((row) => studentHold(row, owner)),
    rides: rideRows.map((row) =>
      studentRide(
        row,
        owner,
        (
          linkedHold ??
          holdRows.find((hold) => hold.reservation_id === row.reservation_id)
        )?.intended_hub_id,
      ),
    ),
    bookings: bookingRows.map((row) => studentBooking(row, owner)),
    charges: chargeRows.map((row) =>
      studentCharge(row, owner, privateVehicles),
    ),
    activity: activityRows.map((row) => studentActivity(row, owner, name)),
  };
}
const calendar = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: config.timezone,
});
export function studentDate(minutes: number) {
  return calendar.format(Date.parse(config.snapshot) + minutes * 60000);
}
