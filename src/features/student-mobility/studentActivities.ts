import type { State } from "@/domain/types";
import { vehicleLabel } from "@/integration/recordLabels";
import { studentDate } from "@/integration/studentData";
import { time } from "@/shared/lib/time";

export type StudentActivity = {
  id: string;
  kind: "hold" | "rental" | "parking" | "charging";
  title: string;
  icon: string;
  location: string;
  detail: string;
  action: string;
  hub: string;
  destination?: string;
};

export function currentStudentActivities(s: State): StudentActivity[] {
  const activities: StudentActivity[] = [];
  const hubName = (id: string) => s.hubs.find((hub) => hub.id === id)?.name;
  const ride = s.rides.find(
    (item) => item.owner === s.persona && item.status === "active",
  );
  const hold = s.holds.find(
    (item) => item.owner === s.persona && item.status === "held",
  );

  if (ride) {
    const origin = hubName(ride.origin) ?? "Pickup hub";
    const destination = hubName(ride.destination);
    activities.push({
      id: ride.id,
      kind: "rental",
      icon: "bike",
      title: "Ride in progress",
      hub: ride.origin,
      destination: ride.destination,
      location:
        destination && destination !== origin
          ? `${origin} → ${destination}`
          : origin,
      detail: `Picked up at ${time(ride.start)}`,
      action: "Manage ride",
    });
  } else if (hold) {
    const minutes = Math.ceil(hold.expires - s.clock);
    activities.push({
      id: hold.id,
      kind: "hold",
      icon: "bike",
      title: "Vehicle on hold",
      hub: hold.origin,
      location: hubName(hold.origin) ?? "Pickup hub",
      detail:
        minutes > 0
          ? `Pick up by ${time(hold.expires)} · ${minutes} min left`
          : `Pickup deadline: ${time(hold.expires)}`,
      action: "View pickup",
    });
  }

  const addCharge = (charge: State["charges"][number]) => {
    const title = {
      active: "Charging in progress",
      scheduled: "Charging scheduled",
      pending: "Charging requested",
    };
    if (
      charge.status !== "active" &&
      charge.status !== "scheduled" &&
      charge.status !== "pending"
    )
      return;
    activities.push({
      id: charge.id,
      kind: "charging",
      icon: "bolt",
      title: title[charge.status],
      hub: charge.hub,
      location: hubName(charge.hub) ?? "Charging hub",
      detail:
        charge.status === "pending"
          ? `${vehicleLabel(s, charge.vehicle)} · Waiting for a charging point`
          : [
              vehicleLabel(s, charge.vehicle),
              charge.status === "active" && charge.battery != null
                ? `${charge.battery}% battery`
                : null,
              `Target ${charge.target}%`,
              charge.schedule,
            ]
              .filter(Boolean)
              .join(" · "),
      action: "View charging",
    });
  };

  const addParking = (booking: State["bookings"][number]) => {
    const title = {
      confirmed: "Parking reserved",
      "checked-in": "Parking checked in",
      overstaying: "Parking time exceeded",
    };
    if (
      booking.status !== "confirmed" &&
      booking.status !== "checked-in" &&
      booking.status !== "overstaying"
    )
      return;
    activities.push({
      id: booking.id,
      kind: "parking",
      icon: "parking",
      title: title[booking.status],
      hub: booking.hub,
      location: hubName(booking.hub) ?? "Parking hub",
      detail: `${vehicleLabel(s, booking.vehicle)} · ${booking.status === "confirmed" ? studentDate(booking.start) + " – " + time(booking.end) : "Booked until " + studentDate(booking.end)}`,
      action: "View parking",
    });
  };

  const charges = s.charges.filter((item) => item.owner === s.persona);
  const bookings = s.bookings.filter((item) => item.owner === s.persona);
  charges.filter((item) => item.status === "active").forEach(addCharge);
  bookings.filter((item) => item.status !== "confirmed").forEach(addParking);
  charges.filter((item) => item.status === "scheduled").forEach(addCharge);
  bookings.filter((item) => item.status === "confirmed").forEach(addParking);
  charges.filter((item) => item.status === "pending").forEach(addCharge);
  return activities;
}
