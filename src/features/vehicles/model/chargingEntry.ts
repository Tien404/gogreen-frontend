import type { Schemas } from "@/shared/api/contract.generated";

type ChargingEntry =
  | { available: true; parkingId: string }
  | {
      available: false;
      reason: "PARKING_REQUIRED" | "CHARGE_EXISTS";
      message: string;
    };

export function chargingEntry(
  vehicleId: string,
  bookings: Schemas["ParkingReservationOut"][],
  charges: Schemas["ChargingSessionOut"][],
): ChargingEntry {
  if (
    charges.some(
      (charge) =>
        charge.vehicle_id === vehicleId &&
        ["PENDING", "SCHEDULED", "ACTIVE"].includes(charge.status),
    )
  ) {
    return {
      available: false,
      reason: "CHARGE_EXISTS",
      message:
        "This vehicle already has a charging request. Open Charging to view it.",
    };
  }
  const booking =
    bookings.find(
      (item) => item.vehicle_id === vehicleId && item.status === "CHECKED_IN",
    ) ??
    bookings.find(
      (item) => item.vehicle_id === vehicleId && item.status === "RESERVED",
    );
  if (!booking)
    return {
      available: false,
      reason: "PARKING_REQUIRED",
      message: "Book parking for this vehicle before requesting charging.",
    };
  return { available: true, parkingId: booking.reservation_id };
}
