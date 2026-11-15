import { LIVE_POLL_MS } from "@/integration/operatorFeed";
import { useApp } from "@/app/providers/AppContext";
import { campusInputToIso, campusTime, chargeSchedule, mapOwnedVehicle, recordUrl, statusLabel } from "@/integration/studentRecords";
import { ApiErrorNotice } from "@/shared/api/ApiFeedback";
import { inputClass, panelClass, recordRowClass, RecordFeedback } from "@/shared/api/ApiRecordUi";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { Badge, Button, Empty, Field, Link, PageTitle, SectionHead } from "@/shared/ui";
import { useCallback, type FormEvent } from "react";
import { useSearchParams } from "react-router";

export function ApiCharging() {
  const { api, auth } = useApp();
  const operator = auth.user?.role === "operator";
  const load = useCallback((signal: AbortSignal) => api!.request("GET /charging/sessions", { signal }), [api]);
  const query = useApiQuery(load, { retain: true, pollMs: LIVE_POLL_MS });
  return (
    <>
      <PageTitle title="Charging" description="Check your requests and scheduled charging sessions." action={operator ? undefined : <Link to="/student/charging/new">Request charging</Link>} />
      <section data-slot="panel" className={panelClass}>
        <SectionHead title={operator ? "Network charging requests" : "Your charging requests"} />
        <RecordFeedback query={query} item="charging requests" />
        {query.result.status === "ready" && (query.result.data.length ? (
          <ul>
            {query.result.data.map((charge) => (
              <li key={charge.session_id} className={recordRowClass}>
                <div>
                  <Link to={operator ? `/operator/charging/${encodeURIComponent(charge.session_id)}` : recordUrl("charging", charge.session_id)}>{charge.vehicle_id} · {charge.hub_id}</Link>
                  <p className="text-sm text-content-muted">{chargeSchedule(charge)}</p>
                </div>
                <Badge>{statusLabel("charging", charge.status)}</Badge>
              </li>
            ))}
          </ul>
        ) : <Empty title="No charging requests" text={operator ? "Charging requests will appear here when students submit them." : "Book parking before requesting a charge."} />)}
      </section>
    </>
  );
}

export function ApiChargingNew() {
  const { api, go } = useApp();
  const [params] = useSearchParams();
  const action = useApiAction();
  const load = useCallback(async (signal: AbortSignal) => {
    const [bookings, owned] = await Promise.all([
      api!.request("GET /parking/reservations", { signal }),
      api!.request("GET /fleet/vehicles/private", { signal }),
    ]);
    return {
      bookings: bookings.filter((booking) => booking.status === "RESERVED" || booking.status === "CHECKED_IN"),
      vehicles: owned.map(mapOwnedVehicle),
    };
  }, [api]);
  const query = useApiQuery(load, { retain: true });
  const options = query.result.status === "ready" ? query.result.data.bookings : [];
  const vehicles = query.result.status === "ready" ? query.result.data.vehicles : [];
  const selected = params.get("parking") ?? "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const booking = options.find((item) => item.reservation_id === fields.get("parking"));
    if (!booking) return;
    const needBy = String(fields.get("needBy") ?? "");
    const target = String(fields.get("target") ?? "");
    const result = await action.run(async () => api!.request("POST /charging/sessions", {
      body: {
        vehicle_id: booking.vehicle_id,
        parking_reservation_id: booking.reservation_id,
        need_by: needBy ? campusInputToIso(needBy) : null,
        target_battery_pct: target ? Number(target) : null,
      },
    }));
    if (result.ok) go(recordUrl("charging", result.data.session_id));
  }

  return (
    <>
      <Link to="/student/charging">All charging requests</Link>
      <PageTitle title="Request charging" description="Choose a parking booking and the server will schedule charging when it can allocate a point." />
      <section data-slot="panel" className={panelClass}>
        <RecordFeedback query={query} item="parking bookings" />
        {query.result.status === "ready" && (options.length ? (
          <form onSubmit={submit} className="max-w-150">
            <fieldset disabled={action.busy || !!query.refreshError} className="border-0 p-0">
              <Field label="Parking booking">
                <select className={inputClass} name="parking" required defaultValue={options.some((booking) => booking.reservation_id === selected) ? selected : ""}>
                  <option value="">Choose a booking</option>
                  {options.map((booking) => (
                    <option key={booking.reservation_id} value={booking.reservation_id}>
                      {vehicles.find((vehicle) => vehicle.id === booking.vehicle_id)?.label ?? booking.vehicle_id} · {booking.hub_id} · {campusTime(booking.starts_at)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Target battery (%)" hint="Leave blank to use the server default.">
                <input className={inputClass} type="number" name="target" min="1" max="100" />
              </Field>
              <Field label="Need by · Vietnam time">
                <input className={inputClass} type="datetime-local" name="needBy" />
              </Field>
              <ApiErrorNotice error={action.error} />
              <Button type="submit">{action.busy ? "Submitting…" : "Request charging"}</Button>
            </fieldset>
          </form>
        ) : <Empty title="No eligible parking bookings" text="Create a parking booking to request charging." action={<Link to="/student/parking/new">Book parking</Link>} />)}
      </section>
    </>
  );
}
