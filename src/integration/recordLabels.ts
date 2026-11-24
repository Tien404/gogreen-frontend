import type { State, Booking, Charge, Activity } from "@/domain/types";
import { studentDate } from "@/integration/studentData";

const uuid = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
export function vehicleLabel(s: State, id: string) {
  const owned = s.privateVehicles.find((vehicle) => vehicle.id === id);
  if (owned) return uuid.test(owned.identifier) ? owned.type : owned.identifier;
  if (!uuid.test(id)) return id;
  return (
    s.vehicles.find((vehicle) => vehicle.id === id)?.type ?? "Private vehicle"
  );
}
export function parkingLabel(s: State, booking: Booking) {
  return `${s.hubs.find((hub) => hub.id === booking.hub)?.name ?? "Parking booking"} · ${studentDate(booking.start)} – ${studentDate(booking.end)}`;
}
export function chargingLabel(s: State, charge: Charge) {
  return `${vehicleLabel(s, charge.vehicle)} · ${s.hubs.find((hub) => hub.id === charge.hub)?.name ?? "Charging session"}`;
}
export function activityResourceLabel(s: State, activity: Activity) {
  if (activity.link?.includes("/parking/")) {
    const booking = s.bookings.find(
      (booking) => booking.id === activity.resource,
    );
    return booking ? parkingLabel(s, booking) : "View parking booking";
  }
  if (activity.link?.includes("/charging/")) {
    const charge = s.charges.find((charge) => charge.id === activity.resource);
    return charge ? chargingLabel(s, charge) : "View charging session";
  }
  if (uuid.test(activity.resource) && activity.link?.includes("/holds/"))
    return "View vehicle hold";
  if (uuid.test(activity.resource) && activity.link?.includes("/rides/"))
    return "View ride";
  if (uuid.test(activity.resource) && activity.link?.includes("/dispatch/"))
    return "View dispatch";
  if (uuid.test(activity.resource) && activity.link?.includes("/incidents"))
    return "View incident";
  if (uuid.test(activity.resource) && activity.link?.includes("/what-if/"))
    return "View simulation";
  // Audit rows may not carry a navigable link for the current role.
  if (uuid.test(activity.resource) && /parking|charg/i.test(activity.action))
    return /charg/i.test(activity.action)
      ? "Charging session"
      : "Parking booking";
  return uuid.test(activity.resource) ? "Related record" : activity.resource;
}

export function assetLabel(s: State, resource: string) {
  return resource.replace(
    /[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}/gi,
    (id) =>
      s.vehicles.some((vehicle) => vehicle.id === id) ||
      s.privateVehicles.some((vehicle) => vehicle.id === id)
        ? vehicleLabel(s, id)
        : "Related asset",
  );
}
