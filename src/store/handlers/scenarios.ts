import { available, freeSpaces } from "@/domain/selectors";
import { type Dispatch, type Run } from "@/domain/types";
import { scenarioFixtures } from "@/mocks/scenarios";
import type { TransitionContext } from "../context";
import type { TransitionResult } from "../types";

export function handleScenarios({
  state,
  s,
  a,
  id,
  fail,
  ok,
}: TransitionContext): TransitionResult | undefined {
  if (a.type === "run") {
    const result = scenarioFixtures[String(a.scenarioType)];

    if (
      !result ||
      a.hub !== result.hub ||
      a.horizon !== "60" ||
      a.demand !== "standard"
    )
      return fail("No mock result for this configuration.");

    const r: Run = {
      id: id("RUN"),
      type: String(a.scenarioType),
      hub: String(a.hub),
      horizon: String(a.horizon),
      demand: String(a.demand),
      snapshot: s.revision,
      captured: s.clock,
      status: s.preset === "what-if" ? "failed" : "completed",
      applied: false,
      vehicle: available(s, result.source)[0]?.id ?? "",
      baseline: result.baseline,
      scenario: result.scenario,
    };

    s.runs.unshift(r);

    return {
      state: s,
      message:
        r.status === "failed"
          ? "Mock run failed. Retry from the result screen."
          : "Illustrative mock result ready",
      id: r.id,
    };
  }

  if (a.type === "retry-run") {
    const r = s.runs.find((r) => r.id === a.id);

    if (!r) return fail("Run not found.");

    r.status = "completed";

    return { state: s, message: "Mock run completed" };
  }

  if (a.type === "apply") {
    const r = s.runs.find((r) => r.id === a.id);

    if (s.role !== "operator" || !r || r.status !== "completed")
      return fail("Open a completed result.");

    if (r.applied) return { state, message: "Recommendation already applied" };

    if (s.preset === "what-if" || r.snapshot !== s.revision)
      return fail(
        "Recommendation is stale. Run a new scenario from the current snapshot.",
      );

    const v = s.vehicles.find((v) => v.id === r.vehicle);
    const recommendation = scenarioFixtures[r.type];

    if (
      !v ||
      !recommendation ||
      v.status !== "available" ||
      v.hub !== recommendation.source ||
      freeSpaces(s, recommendation.destination) < 1
    )
      return fail("Prerequisites changed. Run a new scenario.");

    const d: Dispatch = {
      id: id("DS"),
      source: recommendation.source,
      destination: recommendation.destination,
      vehicles: [v.id],
      status: "planned",
    };

    s.dispatches.unshift(d);
    v.status = "committed";
    r.applied = true;

    return ok(
      "One planned dispatch created. No vehicle has moved.",
      d.id,
      `/operator/dispatch/${d.id}`,
    );
  }
}
