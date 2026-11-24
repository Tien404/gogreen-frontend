import { useApp } from "@/app/providers/AppContext";
import { LIVE_POLL_MS } from "@/integration/operatorFeed";
import { mapHub } from "@/integration/apiMappers";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { useCallback, useState } from "react";
import {
  apiClock,
  liveHub,
  readPages,
  serverAvailableCounts,
} from "../hubResources";
export function useHubs() {
  const { s, api } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState("");
  const load = useCallback(
    async (signal: AbortSignal) => {
      const hubs = await readPages((offset, limit) =>
        api.request("GET /mobility/hubs", {
          signal,
          query: { offset, limit },
        }),
      );
      if (hubs.length === 0) return { hubs: [], clock: null };
      const vehicles = await readPages((offset, limit) =>
        api.request("GET /mobility/vehicles", {
          signal,
          query: { offset, limit },
        }),
      );
      const counts = serverAvailableCounts(vehicles);
      const mapped = hubs.map(mapHub);
      return {
        hubs: mapped.map((hub) => liveHub(hub, counts.get(hub.id) ?? 0)),
        clock: apiClock(mapped[0].updatedAt),
      };
    },
    [api],
  );
  const { result, retry } = useApiQuery(load, {
    pollMs: LIVE_POLL_MS,
  });
  const source = result;
  const hubs =
    source.status === "ready"
      ? source.data.hubs.filter(
          (hub) =>
            hub.name.toLowerCase().includes(search.toLowerCase()) &&
            (filter === "all" ||
              (filter === "vehicles"
                ? hub.availableVehicles > 0
                : filter === "parking"
                  ? hub.parkingAvailable > 0
                  : hub.availablePoints > 0)),
        )
      : [];
  return {
    role: s.role,
    source,
    retry,
    search,
    setSearch,
    filter,
    setFilter,
    selected,
    setSelected,
    hubs,
  };
}
