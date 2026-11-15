import { config } from "@/config/app";
import { freeSpaces, pointFree, pointId } from "@/domain/selectors";
import { type Booking } from "@/domain/types";
import type { TransitionContext } from "../context";
import type { TransitionResult } from "../types";

export function handleParking({
  s,
  a,
  id,
  fail,
  ok,
}: TransitionContext): TransitionResult | undefined {
  if (a.type === "book") {
    if (
      s.role !== "student" ||
      !s.privateVehicles.some(
        (v) => v.id === a.vehicle && v.owner === s.persona,
      )
    )
      return fail("Choose one of your private vehicles.");

    if (
      !Number.isFinite(a.start) ||
      !Number.isFinite(a.end) ||
      Number(a.end) <= Number(a.start) ||
      Number(a.start) < s.clock
    )
      return fail("Choose a future interval with the end after the start.");

    if (!s.hubs.some((h) => h.id === a.hub) || freeSpaces(s, String(a.hub)) < 1)
      return fail("No parking available for this interval.");

    if (
      s.bookings.some(
        (b) =>
          b.vehicle === a.vehicle &&
          ["confirmed", "checked-in", "overstaying"].includes(b.status) &&
          Number(a.start) < b.end &&
          Number(a.end) > b.start,
      )
    )
      return fail("Your vehicle already has a booking during this interval.");

    if (
      a.service === "Parking + charging" &&
      (pointFree(s, String(a.hub)) === 0 ||
        s.preset === "combined" ||
        s.charges.some((c) => c.hub === a.hub && c.status === "pending"))
    )
      return fail(
        "Combined package unavailable. No booking was created. Choose Parking only to try again.",
      );

    const b: Booking = {
      id: id("PK"),
      owner: s.persona,
      vehicle: String(a.vehicle),
      hub: String(a.hub),
      start: Number(a.start),
      end: Number(a.end),
      service: String(a.service),
      status: "confirmed",
    };

    s.bookings.unshift(b);

    if (b.service === "Parking + charging")
      s.charges.unshift({
        id: id("CH"),
        owner: s.persona,
        vehicle: b.vehicle,
        hub: b.hub,
        booking: b.id,
        status: "scheduled",
        battery: s.privateVehicles.find((v) => v.id === b.vehicle)!.battery,
        target: config.packageTarget,
        reason: "Confirmed with parking package",
        point: Array.from(
          { length: s.hubs.find((h) => h.id === b.hub)!.points },
          (_, i) => pointId(b.hub, i),
        ).find(
          (p) =>
            !s.charges.some(
              (c) =>
                c.point === p && ["scheduled", "active"].includes(c.status),
            ) &&
            !s.incidents.some(
              (i) => i.status === "open" && i.resource.includes(p),
            ),
        ),
      });

    return ok(
      "Parking confirmed for the selected interval",
      b.id,
      `/student/parking/${b.id}`,
    );
  }

  if (["cancel-booking", "check-in", "extend", "checkout"].includes(a.type)) {
    const b = s.bookings.find((b) => b.id === a.id);

    if (!b || b.owner !== s.persona || s.role !== "student")
      return fail("Booking not available for this persona.");

    if (a.type === "cancel-booking") {
      if (b.status !== "confirmed")
        return fail("Only a confirmed booking can be cancelled.");

      b.status = "cancelled";
      s.charges
        .filter(
          (c) =>
            c.booking === b.id && ["pending", "scheduled"].includes(c.status),
        )
        .forEach((c) => (c.status = "cancelled"));
    }

    if (a.type === "check-in") {
      if (
        b.status !== "confirmed" ||
        s.clock < b.start ||
        s.clock > b.start + config.checkInGrace
      )
        return fail(
          "Check-in is available from the start until 15 minutes afterward.",
        );

      if (freeSpaces(s, b.hub) < 1)
        return fail("Hub is full. Your booking remains confirmed.");

      b.status = "checked-in";
      s.charges
        .filter((c) => c.booking === b.id && c.status === "scheduled")
        .forEach((c) => (c.status = "active"));
    }

    if (a.type === "extend") {
      if (!["checked-in", "overstaying"].includes(b.status))
        return fail("Check in before extending.");

      if (s.preset === "overstay")
        return fail(
          "Extension conflict. Original end time and physical occupancy are preserved.",
        );

      b.end += config.extensionMinutes;
      b.status = "checked-in";
    }

    if (a.type === "checkout") {
      if (!["checked-in", "overstaying"].includes(b.status))
        return fail("This vehicle is not checked in.");

      b.status = "completed";
      s.charges
        .filter((c) => c.booking === b.id && c.status === "active")
        .forEach((c) => {
          c.status = "stopped";
          c.reason = "Stopped at checkout; target may not be reached.";
        });
    }

    return ok("Booking updated", b.id, `/student/parking/${b.id}`);
  }
}
