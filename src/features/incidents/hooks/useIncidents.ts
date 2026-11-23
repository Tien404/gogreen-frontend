import { useApp } from "@/app/providers/AppContext";
import { useOptionalOperatorFeed } from "@/integration/operatorFeed";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
const incidentTypes: Record<string, string> = {
  "Vehicle fault": "VEHICLE_FAULT",
  "Point fault": "CHARGER_FAULT",
  "Hub capacity": "PARKING_FAULT",
};
export function useIncidents() {
  const { s, api, refreshOperations, notify } = useApp();
  const [params] = useSearchParams();
  const focus = params.get("incident");
  const feed = useOptionalOperatorFeed();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState(focus ? "all" : "open");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [resolve, setResolve] = useState("");
  const [resource, setResource] = useState("");
  const command = useApiAction();
  const network =
    feed?.result.status === "ready" ? feed.result.data.data : undefined;
  const targets = s.hubs
    .flatMap((hub) => {
      const faultVehicles = new Set([
        ...s.vehicles.filter((v) => v.hub === hub.id).map((v) => v.id),
        ...(network?.dispatches
          .filter(
            (task) =>
              task.started_at &&
              ["IN_TRANSIT", "FAILED"].includes(task.status) &&
              [task.from_hub_id, task.to_hub_id].includes(hub.id),
          )
          .map((task) => task.vehicle_id) ?? []),
        ...(network?.charging
          .filter(
            (charge) => charge.hub_id === hub.id && charge.status === "ACTIVE",
          )
          .map((charge) => charge.vehicle_id) ?? []),
      ]);
      return [
        ...(hub.live?.pointIds ?? []).map((id) => ({
          id,
          hub: hub.id,
          label: `${hub.name} · ${id}`,
          kind: "point" as const,
        })),
        ...[...faultVehicles].map((id) => ({
          id,
          hub: hub.id,
          label: `${hub.name} · ${id}`,
          kind: "vehicle" as const,
        })),
      ];
    })
    .map((target) => ({
      ...target,
      key: JSON.stringify([target.hub, target.kind, target.id]),
    }));
  const items = s.incidents.filter(
    (i) =>
      (filter === "all" || i.status === filter) &&
      `${i.id} ${i.resource} ${i.description} ${i.resolution ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const reportIncident = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const target = targets.find((item) => item.key === resource);
    const parking = resource === "parking";
    if (!parking && !target) {
      setError(
        "That resource is no longer listed. Choose an affected resource.",
      );
      return;
    }
    setError("");
    const result = await command.run(() =>
      api.request("POST /incidents", {
        body: {
          hub_id: parking ? String(f.get("hub")) : target!.hub,
          ...(parking
            ? { resource_id: String(f.get("parking")).trim() }
            : target!.kind === "vehicle"
              ? { vehicle_id: target!.id }
              : { resource_id: target!.id }),
          severity: String(f.get("severity")),
          incident_type: incidentTypes[String(f.get("type"))],
          description: String(f.get("description") ?? "").trim(),
        },
      }),
    );
    if (result.ok) {
      setOpen(false);
      setResource("");
      setFilter("open");
      setSearch("");
      refreshOperations?.();
      notify("Incident reported successfully.", "warning");
    }
    return;
  };
  const resolveIncident = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const reason = String(new FormData(e.currentTarget).get("reason") ?? "");
    const result = await command.run(() =>
      api.request("POST /incidents/{incident_id}/resolve", {
        params: { incident_id: resolve },
        body: { resolution_notes: reason.trim() },
      }),
    );
    if (result.ok) {
      setResolve("");
      refreshOperations?.();
      notify("Incident resolved successfully.", "success");
    }
    return;
  };
  function clearError() {
    setError("");
    command.setError(null);
  }
  return {
    s,
    open,
    setOpen: (next: boolean) => {
      clearError();
      setOpen(next);
      if (!next) setResource("");
    },
    filter,
    setFilter,
    search,
    setSearch,
    error: command.error ? apiErrorMessage(command.error) : error,
    resolve,
    setResolve: (id: string) => {
      clearError();
      setResolve(id);
    },
    items,

    busy: command.busy,
    resource,
    setResource,
    targets,
    reportIncident,
    resolveIncident,
  };
}
export type IncidentsModel = ReturnType<typeof useIncidents>;
