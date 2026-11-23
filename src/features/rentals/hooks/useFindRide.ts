import { useApp } from "@/app/providers/AppContext";
import { useRefreshStudentData } from "@/integration/studentRefresh";
import { readPages } from "@/features/hubs/hubResources";
import { mapVehicle } from "@/integration/apiMappers";
import { LIVE_POLL_MS } from "@/integration/operatorFeed";
import { recordUrl, vehicleTypeCode } from "@/integration/studentRecords";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
type Candidate = {
  id: string;
  type: string;
  battery: number | null;
};
export function useFindRide() {
  const { s, go, api, notify } = useApp();
  const refresh = useRefreshStudentData();
  const [searchParams] = useSearchParams();
  const requestedOrigin = searchParams.get("origin");
  const [origin, setOrigin] = useState(
    s.hubs.find((hub) => hub.id === requestedOrigin)?.id ??
      (s.hubs.some((hub) => hub.id === "north")
        ? "north"
        : (s.hubs[0]?.id ?? "")),
  );
  const [destination, setDestination] = useState(
    s.hubs.some((hub) => hub.id === "library")
      ? "library"
      : (s.hubs[0]?.id ?? ""),
  );
  const [type, setType] = useState("all");
  const [v, selectVehicle] = useState<Candidate | null>(null);
  const command = useApiAction();
  const load = useCallback(
    async (signal: AbortSignal) => {
      if (!origin) return [];
      const rows = await readPages((offset, limit) =>
        api.request("GET /mobility/vehicles", {
          signal,
          query: {
            hub_id: origin,
            destination_hub_id: destination || undefined,
            vehicle_type: vehicleTypeCode(type),
            offset,
            limit,
          },
        }),
      );
      return rows.map((row) => {
        const vehicle = mapVehicle(row);
        return {
          id: vehicle.id,
          type: vehicle.type ?? "Shared vehicle",
          battery: vehicle.battery,
        };
      });
    },
    [api, origin, destination, type],
  );
  const query = useApiQuery(load, {
    retain: true,
    pollMs: LIVE_POLL_MS,
  });
  const vehicles = query.result.status === "ready" ? query.result.data : [];
  const hold = s.holds.find(
    (h) => h.owner === s.persona && h.status === "held",
  );
  const ride = s.rides.find(
    (r) => r.owner === s.persona && r.status === "active",
  );
  const reserveVehicle = async () => {
    if (!v) return;
    const result = await command.run(() =>
      api.request("POST /rentals/reservations", {
        body: { vehicle_id: v.id, intended_hub_id: destination || null },
      }),
    );
    if (result.ok) {
      notify("Vehicle reserved! Head to the hub for pickup.", "success");
      go(recordUrl("hold", result.data.reservation_id));
    } else {
      refresh?.();
      query.retry();
    }
    return;
  };
  function setSelected(vehicle: Candidate | null) {
    command.setError(null);
    selectVehicle(vehicle);
  }
  return {
    s,

    origin,
    setOrigin,
    destination,
    setDestination,
    type,
    setType,
    error: command.error ? apiErrorMessage(command.error) : "",
    busy: command.busy,
    setSelected,
    vehicles,
    v,
    hold,
    ride,
    reserveVehicle,
    query,
  };
}
