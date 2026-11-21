import { useApp } from "@/app/providers/AppContext";
import { readPages } from "@/features/hubs/hubResources";
import { useOptionalOperatorFeed } from "@/integration/operatorFeed";
import { simulationUrl } from "@/integration/operatorRecords";
import type { Schemas } from "@/shared/api/contract.generated";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { useCallback, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
const demandType = "Demand surge";
const faultType = "Charging-point failure";
const liveTypes = [demandType, faultType];
export function useWhatIf(id?: string, newScenario = false) {
  const { s, go, api } = useApp();
  const feed = useOptionalOperatorFeed();
  const network =
    feed?.result.status === "ready" ? feed.result.data : undefined;
  const [params] = useSearchParams();
  const faultHubs =
    network?.data.hubs.filter(
      (hub) =>
        hub.status === "ACTIVE" &&
        hub.charging_points.some((point) => point.status !== "UNAVAILABLE"),
    ) ?? [];
  const metro = network?.data.hubs.find(
    (hub) => hub.hub_id === "metro" && hub.status === "ACTIVE",
  );
  const [type, selectType] = useState(
    params.get("scenario") === "charger" ? faultType : demandType,
  );
  const [hub, selectHub] = useState(
    type === faultType ? (faultHubs[0]?.hub_id ?? "") : "metro",
  );
  const [point, setPoint] = useState("");
  const [horizon, setHorizon] = useState("60");
  const [demand, setDemand] = useState("3");
  const command = useApiAction();
  const load = useCallback(
    async (signal: AbortSignal) =>
      id
        ? [
            await api!.request("GET /simulations/{run_id}", {
              signal,
              params: { run_id: id },
            }),
          ]
        : readPages((offset, limit) =>
            api!.request("GET /simulations", {
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
  const liveHubs = type === faultType ? faultHubs : metro ? [metro] : [];
  const points =
    type === faultType
      ? (faultHubs
          .find((item) => item.hub_id === hub)
          ?.charging_points.filter((item) => item.status !== "UNAVAILABLE") ??
        [])
      : [];
  const valid =
    type === faultType
      ? points.some((item) => item.resource_id === point)
      : Boolean(metro);
  function setType(next: string) {
    selectType(next);
    selectHub(next === faultType ? (faultHubs[0]?.hub_id ?? "") : "metro");
    setPoint("");
    command.setError(null);
  }
  function setHub(next: string) {
    selectHub(next);
    setPoint("");
  }
  const runScenario = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid) return;
    const body: Schemas["RentalDemandSurge"] | Schemas["ChargerFault"] =
      type === faultType
        ? {
            scenario_type: "CHARGER_FAULT",
            charging_point_id: point,
            hub_id: hub,
            horizon_minutes: Number(horizon),
          }
        : {
            scenario_type: "RENTAL_DEMAND_SURGE",
            hub_id: "metro",
            horizon_minutes: Number(horizon),
            demand_count: Number(demand),
          };
    const result = await command.run(() =>
      api.request("POST /simulations", { body }),
    );
    if (result.ok) go(simulationUrl(result.data.run_id));
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
    demand,
    setDemand,
    busy: command.busy,
    error: command.error ? apiErrorMessage(command.error) : "",
    runScenario,

    liveRuns,
    liveRun,
    query,
    revision: network?.revision ?? null,
    types: liveTypes,
    liveHubs,
    points,
    point,
    setPoint,
    valid,
    fault: type === faultType,
  };
}
export type WhatIfModel = ReturnType<typeof useWhatIf>;
