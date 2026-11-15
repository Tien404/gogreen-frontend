import { useApp } from "@/app/providers/AppContext";
import { mapHub, mapVehicle } from "@/integration/apiMappers";
import { recordUrl } from "@/integration/studentRecords";
import { ApiErrorNotice } from "@/shared/api/ApiFeedback";
import { inputClass, panelClass, recordRowClass, RecordFeedback } from "@/shared/api/ApiRecordUi";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { Button, Empty, Field, PageTitle, SectionHead } from "@/shared/ui";
import { useCallback, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { ApiTripHistory } from "./ApiTripHistory";

export function ApiFindRide() {
  const { api, go } = useApp();
  const [params, setParams] = useSearchParams();
  const origin = params.get("origin") ?? "";
  const destination = params.get("destination") ?? "";
  const type = params.get("type") ?? "";
  const action = useApiAction();

  const loadHubs = useCallback(async (signal: AbortSignal) =>
    (await api!.request("GET /mobility/hubs", { signal })).map(mapHub), [api]);
  const hubQuery = useApiQuery(loadHubs, { retain: true });
  const loadVehicles = useCallback(async (signal: AbortSignal) =>
    (await api!.request("GET /mobility/vehicles", {
      query: { hub_id: origin || undefined, destination_hub_id: destination || undefined, vehicle_type: type || undefined },
      signal,
    })).map(mapVehicle), [api, origin, destination, type]);
  const vehicleQuery = useApiQuery(loadVehicles, { retain: true });
  const hubs = hubQuery.result.status === "ready" ? hubQuery.result.data : [];
  const hubName = (id: string | null) => hubs.find((hub) => hub.id === id)?.name ?? id ?? "Unknown hub";

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget)) {
      if (typeof value === "string" && value) query.set(key, value);
    }
    if (query.toString() === params.toString()) vehicleQuery.retry();
    else setParams(query);
  }

  async function hold(vehicleId: string) {
    const result = await action.run(() => api!.request("POST /rentals/reservations", {
      body: { vehicle_id: vehicleId, intended_hub_id: destination || null },
    }));
    if (result.ok) go(recordUrl("hold", result.data.reservation_id));
    else vehicleQuery.retry();
  }

  return (
    <>
      <PageTitle title="Find your next ride" description="Search for shared vehicles available for an immediate hold." />
      <section data-slot="panel" className={panelClass}>
        <RecordFeedback query={hubQuery} item="hubs" />
        <form onSubmit={search}>
          <fieldset disabled={action.busy || hubQuery.result.status !== "ready"} className="grid gap-x-4 border-0 p-0 min-[700px]:grid-cols-3">
            <Field label="Starting hub">
              <select className={inputClass} name="origin" defaultValue={origin} key={String(hubs.length)}>
                <option value="">Any hub</option>
                {hubs.map((hub) => <option key={hub.id} value={hub.id}>{hub.name}</option>)}
              </select>
            </Field>
            <Field label="Intended return hub" hint="Availability is checked when you return.">
              <select className={inputClass} name="destination" defaultValue={destination} key={String(hubs.length)}>
                <option value="">Choose later</option>
                {hubs.map((hub) => <option key={hub.id} value={hub.id}>{hub.name}</option>)}
              </select>
            </Field>
            <Field label="Vehicle type">
              <select className={inputClass} name="type" defaultValue={type}>
                <option value="">Any type</option>
                <option value="e-bike">Electric bicycle</option>
                <option value="e-motorcycle">Electric motorcycle</option>
              </select>
            </Field>
            <Button type="submit" variant="secondary">Search vehicles</Button>
          </fieldset>
        </form>
      </section>
      <section data-slot="panel" className={panelClass}>
        <SectionHead title="Available shared vehicles" subtitle="Availability and battery eligibility come from the server." />
        <ApiErrorNotice error={action.error} />
        <RecordFeedback query={vehicleQuery} item="vehicles" />
        {vehicleQuery.result.status === "ready" && (vehicleQuery.result.data.length ? (
          <ul>
            {vehicleQuery.result.data.map((vehicle) => (
              <li key={vehicle.id} className={recordRowClass}>
                <div>
                  <strong>{vehicle.id}</strong>
                  <p className="text-sm text-content-muted">{vehicle.type ?? "Shared vehicle"} · {hubName(vehicle.hubId)} · {vehicle.battery == null ? "Battery unknown" : `${vehicle.battery}% battery`}</p>
                </div>
                <Button disabled={action.busy || vehicleQuery.refreshing || !!vehicleQuery.refreshError || hubQuery.result.status !== "ready" || vehicle.status !== "available"} onClick={() => void hold(vehicle.id)}>
                  Hold for 15 minutes
                </Button>
              </li>
            ))}
          </ul>
        ) : <Empty title="No available vehicles" text="Choose another hub or change the filters." />)}
      </section>
      <ApiTripHistory />
    </>
  );
}
