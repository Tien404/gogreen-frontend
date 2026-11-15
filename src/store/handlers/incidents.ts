import { type Incident } from "@/domain/types";
import type { TransitionContext } from "../context";
import type { TransitionResult } from "../types";

export function handleIncidents({
  s,
  a,
  id,
  fail,
  ok,
}: TransitionContext): TransitionResult | undefined {
  if (a.type === "incident") {
    if (
      s.role !== "operator" ||
      !a.resource ||
      !String(a.description ?? "").trim()
    )
      return fail("Choose a resource and describe the incident.");

    const incident: Incident = {
      id: id("IN"),
      resource: String(a.resource),
      severity: String(a.severity),
      type: String(a.incidentType),
      description: String(a.description),
      status: "open",
      time: s.clock,
    };

    s.incidents.unshift(incident);

    const v = s.vehicles.find((v) => v.id === a.resource);

    if (v && v.status === "available") v.status = "maintenance";

    return ok("Incident recorded", incident.id, "/operator/incidents");
  }

  if (a.type === "resolve") {
    const i = s.incidents.find((i) => i.id === a.id);

    if (
      s.role !== "operator" ||
      !i ||
      i.status !== "open" ||
      !String(a.reason ?? "").trim()
    )
      return fail("Provide a resolution explanation.");

    i.status = "resolved";
    i.resolution = String(a.reason);

    return ok(
      "Incident resolved. Inspect affected resources separately.",
      i.id,
      "/operator/incidents",
    );
  }
}
