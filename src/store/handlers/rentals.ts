import { config } from "@/config/app";
import { available, freeSpaces } from "@/domain/selectors";
import type { TransitionContext } from "../context";
import type { TransitionResult } from "../types";

export function handleRentals({
  s,
  a,
  id,
  fail,
  ok,
}: TransitionContext): TransitionResult | undefined {
  if (a.type === "reserve") {
    if (s.role !== "student") return fail("Use the student workspace.");

    const v = s.vehicles.find((v) => v.id === a.vehicle);

    if (!v || !available(s).some((x) => x.id === v.id))
      return fail("Vehicle unavailable. Choose another vehicle.");

    if (
      s.holds.some((h) => h.owner === s.persona && h.status === "held") ||
      s.rides.some((r) => r.owner === s.persona && r.status === "active")
    )
      return fail("Finish your active hold or ride first.");

    if (s.preset === "unavailable") {
      v.status = "maintenance";

      return fail("This vehicle became unavailable. Choose another vehicle.");
    }

    const hold = {
      id: id("HD"),
      owner: s.persona,
      vehicle: v.id,
      origin: v.hub!,
      destination: String(a.destination),
      expires: s.clock + config.holdMinutes,
      status: "held" as const,
    };

    s.holds.unshift(hold);
    v.status = "held";

    return ok(
      "Vehicle held for 10 minutes",
      hold.id,
      `/student/holds/${hold.id}`,
    );
  }

  if (a.type === "cancel-hold" || a.type === "pickup") {
    const h = s.holds.find((h) => h.id === a.id);

    if (
      !h ||
      h.owner !== s.persona ||
      s.role !== "student" ||
      h.status !== "held"
    )
      return fail("This hold is no longer active.");

    const v = s.vehicles.find((v) => v.id === h.vehicle)!;

    if (s.clock >= h.expires) {
      h.status = "expired";
      v.status = "available";

      return fail("Hold expired. Find another ride.");
    }

    if (a.type === "cancel-hold") {
      h.status = "cancelled";
      v.status = "available";

      return ok("Hold cancelled. Vehicle is available.", h.id);
    }

    h.status = "picked-up";
    v.status = "riding";
    v.hub = null;

    const ride = {
      id: id("RD"),
      owner: s.persona,
      vehicle: v.id,
      origin: h.origin,
      destination: h.destination,
      start: s.clock,
      status: "active" as const,
    };

    s.rides.unshift(ride);

    return ok(
      "Pickup confirmed. Your ride is active.",
      ride.id,
      `/student/rides/${ride.id}`,
    );
  }

  if (a.type === "return") {
    const r = s.rides.find((r) => r.id === a.id);

    if (
      !r ||
      r.owner !== s.persona ||
      s.role !== "student" ||
      r.status !== "active"
    )
      return fail("Ride is not active.");

    const destination = String(a.destination);

    if (
      !s.hubs.some((h) => h.id === destination) ||
      freeSpaces(s, destination) < 1
    )
      return fail(
        "This hub is full. Your ride remains active. Choose an alternative hub.",
      );

    const v = s.vehicles.find((v) => v.id === r.vehicle)!;

    r.status = "completed";
    r.destination = destination;
    r.end = s.clock;
    v.hub = destination;
    v.status = "available";

    return ok(
      "Return confirmed. Ride completed.",
      r.id,
      `/student/rides/${r.id}`,
    );
  }
}
