import { useApp } from "@/app/providers/AppContext";
import { mapHub, mapVehicle } from "@/integration/apiMappers";
import {
  LIVE_POLL_MS,
  useOptionalOperatorFeed,
} from "@/integration/operatorFeed";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { useCallback } from "react";
import {
  apiClock,
  liveHub,
  readPages,
  serverAvailableCounts,
} from "../hubResources";
export function useLiveHub(id: string) {
  const { api, s } = useApp();
  const operator = s.role === "operator";
  const feed = useOptionalOperatorFeed();
  const load = useCallback(
    async (signal: AbortSignal) => {
      const hub = mapHub(
        await api!.request("GET /mobility/hubs/{hub_id}", {
          params: { hub_id: id },
          signal,
        }),
      );
      const vehicles = operator
        ? []
        : await readPages((offset, limit) =>
            api!.request("GET /mobility/vehicles", {
              signal,
              query: { hub_id: id, offset, limit },
            }),
          );
      return { hub, vehicles };
    },
    [api, id, operator],
  );
  const { result, retry } = useApiQuery(load, {
    pollMs: LIVE_POLL_MS,
  });
  if (result.status !== "ready") return { result, retry };
  if (feed?.result.status === "loading")
    return { result: feed.result, retry: feed.retry };
  if (feed?.result.status === "error")
    return { result: feed.result, retry: feed.retry };
  const operations = feed?.result.data.data;
  const { hub } = result.data;
  const vehicles = operations
    ? operations.vehicles.filter((vehicle) => vehicle.current_hub_id === id)
    : result.data.vehicles;
  return {
    retry,
    refreshError: feed?.refreshError,
    retryOperations: feed?.retry,
    result: {
      status: "ready" as const,
      data: {
        hub: liveHub(hub, serverAvailableCounts(vehicles).get(id) ?? 0),
        clock: apiClock(hub.updatedAt),
        commitments: operations?.dispatches.filter(
          (dispatch) =>
            dispatch.to_hub_id === id &&
            (dispatch.status === "PLANNED" ||
              dispatch.status === "IN_TRANSIT" ||
              (dispatch.status === "FAILED" && dispatch.started_at !== null)),
        ).length,
        alerts:
          operations?.incidents
            .filter(
              (incident) =>
                incident.hub_id === id &&
                ["OPEN", "IN_PROGRESS"].includes(incident.status),
            )
            .map((incident) => ({
              id: incident.incident_id,
              description: incident.description || incident.incident_type,
            })) ?? [],
        vehicles: vehicles.map((dto) => {
          const vehicle = mapVehicle(dto);
          return {
            id: vehicle.id,
            type: vehicle.type ?? "Shared vehicle",
            status: vehicle.status ?? "unknown",
            hub: vehicle.hubId,
            battery: vehicle.battery,
            observedClock:
              vehicle.batteryObservedAt === null
                ? null
                : apiClock(vehicle.batteryObservedAt),
          };
        }),
      },
    },
  };
}
