import { useApp } from "@/app/providers/AppContext";
import { mapHub } from "@/integration/apiMappers";
import { campusTime, hubAlternatives, recordUrl, statusLabel } from "@/integration/studentRecords";
import { ApiErrorNotice } from "@/shared/api/ApiFeedback";
import { DataRows, inputClass, panelClass, RecordFeedback } from "@/shared/api/ApiRecordUi";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { Alert, Badge, Button, Field, Link, PageTitle } from "@/shared/ui";
import { useCallback, useState, type FormEvent } from "react";
import { useParams } from "react-router";

const back = "/student/find-ride";

export function ApiHoldRecord() {
  const { holdId } = useParams();
  const { api, go, notify } = useApp();
  const action = useApiAction();
  const load = useCallback((signal: AbortSignal) =>
    api!.request("GET /rentals/reservations/{reservation_id}", { params: { reservation_id: holdId! }, signal }), [api, holdId]);
  const query = useApiQuery(load, { retain: true, pollMs: 5000 });

  async function update(kind: "pickup" | "cancel") {
    const params = { reservation_id: holdId! };
    if (kind === "pickup") {
      const result = await action.run(() => api!.request("POST /rentals/reservations/{reservation_id}/pickup", { params }));
      if (result.ok) {
        go(recordUrl("rental", result.data.rental_id));
        return;
      }
    } else {
      const result = await action.run(() => api!.request("POST /rentals/reservations/{reservation_id}/cancel", { params }));
      if (result.ok) notify("Hold canceled.");
    }
    query.retry();
  }

  if (query.result.status !== "ready") return <RecordFeedback query={query} item="hold" back={back} />;
  const hold = query.result.data;
  const enabled = hold.status === "CONFIRMED" && !query.refreshError && !query.refreshing;
  return (
    <>
      <Link to={back}>Back to your rides</Link>
      <PageTitle title={`Hold · ${hold.vehicle_id}`} description="Pick up the vehicle before the server’s hold deadline." action={<Badge>{statusLabel("hold", hold.status)}</Badge>} />
      <section data-slot="panel" className={panelClass}>
        <DataRows rows={[
          ["Starting hub", hold.origin_hub_id ?? "Unknown"],
          ["Intended return hub", hold.intended_hub_id ?? "Choose when returning"],
          ["Expires at · Vietnam time", <time dateTime={hold.expires_at}>{campusTime(hold.expires_at)}</time>],
        ]} />
        {hold.status === "EXPIRED" && <Alert>This hold has expired. Find another vehicle to continue.</Alert>}
        <ApiErrorNotice error={action.error} />
        <RecordFeedback query={query} item="hold" back={back} />
        {enabled && (
          <div className="mt-5 flex flex-wrap gap-2">
            <Button disabled={action.busy} onClick={() => void update("pickup")}>Confirm pickup</Button>
            <Button variant="secondary" disabled={action.busy} onClick={() => void update("cancel")}>Cancel hold</Button>
          </div>
        )}
      </section>
    </>
  );
}

export function ApiRideRecord() {
  const { rideId } = useParams();
  const { api, notify } = useApp();
  const [destination, setDestination] = useState("");
  const action = useApiAction();
  const load = useCallback(async (signal: AbortSignal) => {
    const [ride, hubs] = await Promise.all([
      api!.request("GET /rentals/rentals/{rental_id}", { params: { rental_id: rideId! }, signal }),
      api!.request("GET /mobility/hubs", { signal }),
    ]);
    return { ride, hubs: hubs.map(mapHub) };
  }, [api, rideId]);
  const query = useApiQuery(load, { retain: true });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!destination) return;
    const result = await action.run(() => api!.request("POST /rentals/rentals/{rental_id}/return", {
      params: { rental_id: rideId! }, body: { return_hub_id: destination },
    }));
    if (result.ok) notify("Vehicle returned.");
    query.retry();
  }

  if (query.result.status !== "ready") return <RecordFeedback query={query} item="ride" back={back} />;
  const { ride, hubs } = query.result.data;
  const alternatives = hubAlternatives(action.error);
  const name = (id: string) => hubs.find((hub) => hub.id === id)?.name ?? id;
  return (
    <>
      <Link to={back}>Back to your rides</Link>
      <PageTitle title={`Ride · ${ride.vehicle_id}`} description="Return your vehicle to a hub with an available space." action={<Badge>{statusLabel("rental", ride.status)}</Badge>} />
      <section data-slot="panel" className={panelClass}>
        <DataRows rows={[
          ["Picked up", campusTime(ride.picked_up_at)],
          ["Starting hub", name(ride.origin_hub_id)],
          ["Returned to", ride.return_hub_id ? name(ride.return_hub_id) : "—"],
        ]} />
        {alternatives === null
          ? <ApiErrorNotice error={action.error} />
          : <Alert tone="error">This hub can’t accept the return. Your ride is still active.</Alert>}
        <RecordFeedback query={query} item="ride" back={back} />
        {ride.status === "ACTIVE" && (
          <form onSubmit={submit} className="mt-5 max-w-120">
            <Field label="Return hub">
              <select className={inputClass} required value={destination} onChange={(event) => setDestination(event.target.value)} disabled={action.busy}>
                <option value="">Choose a hub</option>
                {hubs.map((hub) => <option key={hub.id} value={hub.id}>{hub.name}</option>)}
                {destination && !hubs.some((hub) => hub.id === destination) && <option value={destination}>{destination}</option>}
              </select>
            </Field>
            <Button type="submit" disabled={!destination || action.busy || query.refreshing || !!query.refreshError}>Confirm return</Button>
            {alternatives && (alternatives.length ? (
              <div className="mt-5 space-y-2">
                <p>Available alternatives at the time of the request:</p>
                {alternatives.map((hub) => (
                  <Button key={hub.id} type="button" variant="secondary" className="mr-2" disabled={action.busy} onClick={() => setDestination(hub.id)}>
                    Choose {name(hub.id)} · {hub.spaces} {hub.spaces === 1 ? "space" : "spaces"}
                  </Button>
                ))}
              </div>
            ) : <p className="mt-4 text-content-muted">No alternative hub is available right now.</p>)}
          </form>
        )}
      </section>
    </>
  );
}
