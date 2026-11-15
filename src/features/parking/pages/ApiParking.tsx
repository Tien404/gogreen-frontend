import { useApp } from "@/app/providers/AppContext";
import { mapHub } from "@/integration/apiMappers";
import { campusInputToIso, campusTime, mapOwnedVehicle, recordUrl, statusLabel } from "@/integration/studentRecords";
import { ApiErrorNotice } from "@/shared/api/ApiFeedback";
import { inputClass, panelClass, recordRowClass, RecordFeedback } from "@/shared/api/ApiRecordUi";
import { ApiError } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { Badge, Button, Empty, Field, Link, PageTitle, SectionHead } from "@/shared/ui";
import { useCallback, type FormEvent } from "react";

export function ApiParking() {
  const { api, go } = useApp();
  const action = useApiAction();
  const load = useCallback(async (signal: AbortSignal) => {
    const [hubs, vehicles, bookings] = await Promise.all([
      api!.request("GET /mobility/hubs", { signal }),
      api!.request("GET /fleet/vehicles/private", { signal }),
      api!.request("GET /parking/reservations", { signal }),
    ]);
    return { hubs: hubs.map(mapHub), vehicles: vehicles.map(mapOwnedVehicle), bookings };
  }, [api]);
  const query = useApiQuery(load, { retain: true });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const result = await action.run(async () => {
      const starts_at = campusInputToIso(String(fields.get("start") ?? ""));
      const ends_at = campusInputToIso(String(fields.get("end") ?? ""));
      if (starts_at >= ends_at) throw new ApiError(422, "INVALID_INPUT", "The end must be later than the start.");
      return api!.request("POST /parking/reservations", {
        body: {
          vehicle_id: String(fields.get("vehicle") ?? ""),
          hub_id: String(fields.get("hub") ?? ""),
          starts_at, ends_at,
        },
      });
    });
    if (result.ok) go(recordUrl("parking", result.data.reservation_id));
  }

  return (
    <>
      <PageTitle title="Campus parking" description="Reserve a space for your private vehicle and manage your bookings." />
      <RecordFeedback query={query} item="parking" />
      {query.result.status === "ready" && (
        <>
          <section data-slot="panel" className={panelClass}>
            <SectionHead title="Book parking" />
            {query.result.data.vehicles.length ? (
              <form onSubmit={submit} className="max-w-150">
                <fieldset disabled={action.busy || !!query.refreshError} className="border-0 p-0">
                  <Field label="Your private vehicle">
                    <select className={inputClass} name="vehicle" required defaultValue="">
                      <option value="">Choose a vehicle</option>
                      {query.result.data.vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Hub">
                    <select className={inputClass} name="hub" required defaultValue="">
                      <option value="">Choose a hub</option>
                      {query.result.data.hubs.filter((hub) => hub.status === "active").map((hub) => <option key={hub.id} value={hub.id}>{hub.name}</option>)}
                    </select>
                  </Field>
                  <div className="grid gap-x-3 min-[700px]:grid-cols-2">
                    <Field label="Start · Vietnam time"><input className={inputClass} type="datetime-local" name="start" required /></Field>
                    <Field label="End · Vietnam time"><input className={inputClass} type="datetime-local" name="end" required /></Field>
                  </div>
                  <ApiErrorNotice error={action.error} />
                  <Button type="submit">{action.busy ? "Booking…" : "Book parking"}</Button>
                </fieldset>
              </form>
            ) : <Empty title="Add a private vehicle first" text="You need a registered vehicle to book a space." action={<Link to="/student/vehicles">Your vehicles</Link>} />}
          </section>
          <section data-slot="panel" className={panelClass}>
            <SectionHead title="Your parking bookings" />
            {query.result.data.bookings.length ? (
              <ul>
                {query.result.data.bookings.map((booking) => (
                  <li key={booking.reservation_id} className={recordRowClass}>
                    <div>
                      <Link to={recordUrl("parking", booking.reservation_id)}>
                        {query.result.status === "ready" && query.result.data.hubs.find((hub) => hub.id === booking.hub_id)?.name || booking.hub_id}
                      </Link>
                      <p className="text-sm text-content-muted">{campusTime(booking.starts_at)} – {campusTime(booking.ends_at)}</p>
                    </div>
                    <Badge>{statusLabel("parking", booking.status)}</Badge>
                  </li>
                ))}
              </ul>
            ) : <Empty title="No parking bookings" text="Your bookings will appear here." />}
          </section>
        </>
      )}
    </>
  );
}
