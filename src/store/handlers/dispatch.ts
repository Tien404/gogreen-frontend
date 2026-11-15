import { available, freeSpaces } from "@/domain/selectors";
import { type Dispatch } from "@/domain/types";
import type { TransitionContext } from "../context";
import type { TransitionResult } from "../types";

export function handleDispatch({
  s,
  a,
  id,
  fail,
  ok,
}: TransitionContext): TransitionResult | undefined {
  if (a.type === "dispatch") {
    if (s.role !== "operator") return fail("Use the operator workspace.");

    const ids = a.vehicles as string[];

    if (!ids?.length || a.source === a.destination)
      return fail("Select vehicles and different source and destination hubs.");

    if (
      ids.some((id) => !available(s, String(a.source)).some((v) => v.id === id))
    )
      return fail("A selected shared vehicle is no longer eligible.");

    const committed = s.dispatches
      .filter(
        (d) =>
          d.destination === a.destination &&
          ["planned", "in-transit", "failed"].includes(d.status),
      )
      .reduce((n, d) => n + d.vehicles.length, 0);

    if (freeSpaces(s, String(a.destination)) - committed < ids.length)
      return fail("Insufficient destination space after dispatch commitments.");

    const d: Dispatch = {
      id: id("DS"),
      source: String(a.source),
      destination: String(a.destination),
      vehicles: ids,
      status: "planned",
    };

    s.dispatches.unshift(d);
    ids.forEach(
      (id) => (s.vehicles.find((v) => v.id === id)!.status = "committed"),
    );

    return ok(
      "Dispatch planned. Source occupancy is unchanged.",
      d.id,
      `/operator/dispatch/${d.id}`,
    );
  }

  if (
    [
      "start-dispatch",
      "complete-dispatch",
      "cancel-dispatch",
      "recover",
    ].includes(a.type)
  ) {
    const d = s.dispatches.find((d) => d.id === a.id);

    if (s.role !== "operator" || !d) return fail("Dispatch not found.");

    if (a.type === "cancel-dispatch") {
      if (d.status !== "planned")
        return fail("Only a planned dispatch can be cancelled.");

      d.status = "cancelled";
      d.vehicles.forEach(
        (id) => (s.vehicles.find((v) => v.id === id)!.status = "available"),
      );
    }

    if (a.type === "start-dispatch") {
      if (d.status !== "planned") return fail("Dispatch is no longer planned.");

      d.status = "in-transit";
      d.vehicles.forEach((id) => {
        const v = s.vehicles.find((v) => v.id === id)!;

        v.status = "in-transit";
        v.hub = null;
      });
    }

    if (a.type === "complete-dispatch") {
      if (!["in-transit", "failed"].includes(d.status))
        return fail("Start the dispatch first.");

      if (
        (s.preset === "dispatch" && d.destination === "library") ||
        freeSpaces(s, d.destination) < d.vehicles.length
      ) {
        d.status = "failed";
        d.reason =
          "Destination unavailable. Vehicles remain in transit; choose a recovery hub.";

        return fail(d.reason);
      }

      d.status = "completed";
      d.vehicles.forEach((id) => {
        const v = s.vehicles.find((v) => v.id === id)!;

        v.status = "available";
        v.hub = d.destination;
      });
    }

    if (a.type === "recover") {
      if (
        !["failed", "in-transit"].includes(d.status) ||
        a.destination === d.destination ||
        freeSpaces(s, String(a.destination)) < d.vehicles.length
      )
        return fail("Choose a different recovery hub with capacity.");

      d.destination = String(a.destination);
      d.status = "in-transit";
      d.reason = "Recovery destination confirmed.";
    }

    return ok("Dispatch updated", d.id, `/operator/dispatch/${d.id}`);
  }
}
