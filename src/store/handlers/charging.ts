import { config } from "@/config/app";
import { pointFree, pointId } from "@/domain/selectors";
import { type Charge } from "@/domain/types";
import type { TransitionContext } from "../context";
import type { TransitionResult } from "../types";

export function handleCharging({
  s,
  a,
  id,
  fail,
  ok,
}: TransitionContext): TransitionResult | undefined {
  if (a.type === "request-charge") {
    const v = s.vehicles.find((v) => v.id === a.vehicle),
      p = s.privateVehicles.find(
        (v) => v.id === a.vehicle && v.owner === s.persona,
      );

    const b = s.bookings.find(
      (b) =>
        b.id === a.booking &&
        b.owner === s.persona &&
        b.vehicle === a.vehicle &&
        ["confirmed", "checked-in", "overstaying"].includes(b.status),
    );

    if (
      s.role === "operator" &&
      (!v || v.status !== "available" || v.battery === null)
    )
      return fail("Select an available shared vehicle with known battery.");

    if (s.role === "student" && (!p || !b))
      return fail("Choose an owned vehicle with a valid parking booking.");

    if (
      !Number.isFinite(Number(a.target)) ||
      Number(a.target) < 0 ||
      Number(a.target) > 100 ||
      Number(a.target) <= (v?.battery ?? p?.battery ?? 100)
    )
      return fail("Target must be above current battery and at most 100%.");

    if (
      s.charges.some(
        (c) =>
          c.vehicle === a.vehicle &&
          ["pending", "scheduled", "active"].includes(c.status),
      )
    )
      return fail("This vehicle already has an open charging request.");

    const c: Charge = {
      id: id("CH"),
      owner: s.role === "operator" ? "operator" : s.persona,
      vehicle: String(a.vehicle),
      hub: b?.hub ?? v!.hub!,
      booking: b?.id,
      status: "pending",
      battery: v?.battery ?? p!.battery,
      target: Number(a.target),
      reason:
        "Queue position 1 · No confirmed slot. Waiting for fixture allocation.",
    };

    s.charges.unshift(c);

    return ok(
      "Charging request added to queue",
      c.id,
      `/${s.role}/charging/${c.id}`,
    );
  }

  if (["cancel-charge", "stop-charge", "advance-charge"].includes(a.type)) {
    const c = s.charges.find((c) => c.id === a.id);

    if (!c || c.owner !== (s.role === "operator" ? "operator" : s.persona))
      return fail("Charging record not available in this workspace.");

    if (a.type === "cancel-charge") {
      if (!["pending", "scheduled"].includes(c.status))
        return fail("Only a pending or scheduled request can be cancelled.");

      c.status = "cancelled";
    }

    if (a.type === "stop-charge") {
      if (c.status !== "active")
        return fail("Only an active session can be stopped.");

      c.status = "stopped";
      c.reason =
        "Stopped by user. Target may not be reached. Parking remains occupied.";
    }

    if (a.type === "advance-charge") {
      const shared = s.vehicles.find((v) => v.id === c.vehicle);

      if (
        shared &&
        (!shared.hub || !["available", "charging"].includes(shared.status))
      )
        return fail("Shared vehicle is no longer eligible for charging.");

      if (c.status === "pending") {
        if (pointFree(s, c.hub) < 1)
          return fail(
            "Insufficient resources. Request remains pending with no confirmed slot.",
          );

        c.status = "scheduled";
        c.point = Array.from(
          { length: s.hubs.find((h) => h.id === c.hub)!.points },
          (_, i) => pointId(c.hub, i),
        ).find(
          (p) =>
            !s.charges.some(
              (x) =>
                x.point === p && ["active", "scheduled"].includes(x.status),
            ) &&
            !s.incidents.some(
              (i) => i.status === "open" && i.resource.includes(p),
            ),
        );

        if (!c.point) {
          c.status = "pending";

          return fail("Fixture points unavailable. Request remains pending.");
        }

        c.reason = "Fixture allocation · 09:30–10:30";
      } else if (c.status === "scheduled") {
        const b = s.bookings.find((b) => b.id === c.booking);

        if (b && !["checked-in", "overstaying"].includes(b.status))
          return fail("Check in the parking booking before starting charging.");

        c.status = "active";
      } else if (c.status === "active") {
        if (s.preset === "charging") {
          c.status = "interrupted";
          c.reason = "Point fault. Target not reached. Parking stays occupied.";
        } else {
          c.battery = Math.min(c.target, c.battery + config.chargeStep);

          if (c.battery === c.target) c.status = "completed";
        }
      } else return fail("This session has ended.");
    }

    const v = s.vehicles.find((v) => v.id === c.vehicle);

    if (v) {
      v.battery = c.battery;
      v.status = ["active", "scheduled"].includes(c.status)
        ? "charging"
        : "available";
    }

    const p = s.privateVehicles.find((v) => v.id === c.vehicle);

    if (p) p.battery = c.battery;

    return ok(
      "Charging state updated. Parking is unchanged.",
      c.id,
      `/${s.role}/charging/${c.id}`,
    );
  }
}
