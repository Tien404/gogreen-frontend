import { useApp } from "@/app/providers/AppContext";
import { readPages } from "@/features/hubs/hubResources";
import { useOptionalOperatorFeed } from "@/integration/operatorFeed";
import { simulationTypes, simulationUrl } from "@/integration/operatorRecords";
import type { Operations, Schemas } from "@/shared/api/contract.generated";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { useCallback, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
type ScenarioType = Schemas["SimulationRunOut"]["scenario_type"];
type FleetDirection = Schemas["FleetImbalance"]["direction"];
export const scenarioKinds = Object.keys(simulationTypes) as ScenarioType[];
export function useWhatIf(id?: string, newScenario = false) {
  const { s, go, api, notify } = useApp();
  const feed = useOptionalOperatorFeed();
  const network =
    feed?.result.status === "ready" ? feed.result.data : undefined;
  const [params] = useSearchParams();
  const activeHubs =
    network?.data.hubs.filter((hub) => hub.status === "ACTIVE") ?? [];
  const [type, selectType] = useState<ScenarioType>(
    () =>
      scenarioKinds.find(
        (kind) => simulationTypes[kind].query === params.get("scenario"),
      ) ?? "RENTAL_DEMAND_SURGE",
  );
  const [selectedHub, selectHub] = useState("");
  const [point, setPoint] = useState("");
  const [horizon, setHorizon] = useState("60");
  const [amount, setAmount] = useState("3");
  const [direction, setDirection] = useState<FleetDirection>("SHORTAGE");
  const command = useApiAction();
  const load = useCallback(
    async (signal: AbortSignal) =>
      id
        ? [
            await api.request("GET /simulations/{run_id}", {
              signal,
              params: { run_id: id },
            }),
          ]
        : readPages((offset, limit) =>
            api.request("GET /simulations", {
              signal,
              query: { offset, limit },
            }),
          ),
    [api, id],
  );
  const query = useApiQuery(load, {
    enabled: !newScenario,
    retain: true,
  });
  const liveRuns = query.result.status === "ready" ? query.result.data : [];
  const liveRun = id ? liveRuns[0] : undefined;
  const fault = type === "CHARGER_FAULT";
  const liveHubs = fault
    ? activeHubs.filter((item) =>
        item.charging_points.some((entry) => entry.status !== "UNAVAILABLE"),
      )
    : activeHubs;
  const defaultHub =
    type === "RENTAL_DEMAND_SURGE"
      ? (liveHubs.find((item) => item.hub_id === "metro") ?? liveHubs[0])
      : liveHubs[0];
  const hub = selectedHub || defaultHub?.hub_id || "";
  const currentHub = liveHubs.find((item) => item.hub_id === hub);
  const points = fault
    ? (currentHub?.charging_points.filter(
        (item) => item.status !== "UNAVAILABLE",
      ) ?? [])
    : [];
  const valid =
    Boolean(currentHub) &&
    (!fault || points.some((item) => item.resource_id === point));

  function setType(next: string) {
    const kind = scenarioKinds.find((item) => item === next);
    if (!kind) return;
    selectType(kind);
    selectHub("");
    setPoint("");
    command.setError(null);
  }
  function setHub(next: string) {
    selectHub(next);
    setPoint("");
    command.setError(null);
  }
  function changeDirection(next: string) {
    if (next === "SHORTAGE" || next === "CONCENTRATION") setDirection(next);
  }
  const runScenario = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid) return;
    const base = { hub_id: hub, horizon_minutes: Number(horizon) };
    const body: Operations["POST /simulations"]["body"] =
      type === "CHARGER_FAULT"
        ? { ...base, scenario_type: type, charging_point_id: point }
        : type === "FLEET_IMBALANCE"
          ? {
              ...base,
              scenario_type: type,
              direction,
              vehicle_count: Number(amount),
            }
          : { ...base, scenario_type: type, demand_count: Number(amount) };
    const result = await command.run(() =>
      api.request("POST /simulations", { body }),
    );
    if (result.ok) {
      notify("Scenario simulation completed.", "success");
      go(simulationUrl(result.data.run_id));
    }
    return;
  };
  return {
    s,
    go,
    type,
    setType,
    hub,
    setHub,
    horizon,
    setHorizon,
    amount,
    setAmount,
    direction,
    changeDirection,
    busy: command.busy,
    error: command.error ? apiErrorMessage(command.error) : "",
    runScenario,

    liveRuns,
    liveRun,
    query,
    revision: network?.revision ?? null,
    liveHubs,
    points,
    point,
    setPoint,
    valid,
  };
}
export type WhatIfModel = ReturnType<typeof useWhatIf>;
