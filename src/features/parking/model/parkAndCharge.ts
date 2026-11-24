import type { ApiClient } from "@/shared/api/client";
import type { Schemas } from "@/shared/api/contract.generated";
import { readPages } from "@/features/hubs/hubResources";

export type ParkAndChargeInput = {
  parking: Schemas["ParkingReservationCreate"];
  charging?: { target_battery_pct: number; need_by?: string };
};

/** Two existing commands, not an atomic reservation of parking and a charger. */
export async function parkAndCharge(
  api: Pick<ApiClient, "request">,
  input: ParkAndChargeInput,
  onParked: (parking: Schemas["ParkingReservationOut"]) => void,
  existingParking?: Schemas["ParkingReservationOut"],
) {
  const parking =
    existingParking ??
    (await api.request("POST /parking/reservations", { body: input.parking }));
  onParked(parking);
  if (!input.charging) return { status: "complete", parking } as const;
  try {
    // Reconcile a previous response loss before retrying the charging command.
    const charges = await readPages((offset, limit) =>
      api.request("GET /charging/sessions", { query: { offset, limit } }),
    );
    const existing = charges.find(
      (charge) =>
        charge.parking_reservation_id === parking.reservation_id &&
        ["PENDING", "SCHEDULED", "ACTIVE", "COMPLETED"].includes(charge.status),
    );
    const charge =
      existing ??
      (await api.request("POST /charging/sessions", {
        body: {
          vehicle_id: parking.vehicle_id,
          parking_reservation_id: parking.reservation_id,
          ...input.charging,
        },
      }));
    return { status: "complete", parking, charge } as const;
  } catch (error) {
    return { status: "partial", parking, error } as const;
  }
}
