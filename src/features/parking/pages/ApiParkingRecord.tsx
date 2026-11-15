import { useApp } from "@/app/providers/AppContext";
import { campusTime, statusLabel } from "@/integration/studentRecords";
import { ApiErrorNotice } from "@/shared/api/ApiFeedback";
import { DataRows, panelClass, RecordFeedback } from "@/shared/api/ApiRecordUi";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { Alert, Badge, Button, Link, PageTitle } from "@/shared/ui";
import { useCallback } from "react";
import { useParams } from "react-router";

const back = "/student/parking/new";

export function ApiParkingRecord() {
  const { bookingId } = useParams();
  const { api, notify } = useApp();
  const action = useApiAction();
  const load = useCallback((signal: AbortSignal) =>
    api!.request("GET /parking/reservations/{reservation_id}", { params: { reservation_id: bookingId! }, signal }), [api, bookingId]);
  const query = useApiQuery(load, { retain: true, pollMs: 5000 });

  if (query.result.status !== "ready") return <RecordFeedback query={query} item="booking" back={back} />;
  const booking = query.result.data;
  const ready = !action.busy && !query.refreshing && !query.refreshError;
  const parked = booking.status === "CHECKED_IN" || booking.status === "OVERSTAYING";
  async function update(kind: "cancel" | "check-in" | "check-out") {
    const params = { reservation_id: booking.reservation_id };
    const result = await action.run(() => {
      if (kind === "cancel") return api!.request("POST /parking/reservations/{reservation_id}/cancel", { params });
      if (kind === "check-in") return api!.request("POST /parking/reservations/{reservation_id}/check-in", { params });
      return api!.request("POST /parking/sessions/{session_id}/check-out", { params: { session_id: booking.session_id! } });
    });
    if (result.ok) notify(kind === "cancel" ? "Booking canceled." : kind === "check-in" ? "Checked in." : "Checked out.");
    query.retry();
  }

  return (
    <>
      <Link to={back}>All parking bookings</Link>
      <PageTitle title="Parking booking" description="View your reserved space and manage your visit." action={<Badge>{statusLabel("parking", booking.status)}</Badge>} />
      <section data-slot="panel" className={panelClass}>
        <DataRows rows={[
          ["Hub", <Link to={`/student/hubs/${encodeURIComponent(booking.hub_id)}`}>{booking.hub_id}</Link>],
          ["Parking space", booking.parking_space_id], ["Vehicle", booking.vehicle_id],
          ["Starts", campusTime(booking.starts_at)], ["Ends", campusTime(booking.ends_at)],
        ]} />
        {booking.status === "OVERSTAYING" && <Alert>Your vehicle still occupies this space. Check out when you leave.</Alert>}
        <ApiErrorNotice error={action.error} />
        <RecordFeedback query={query} item="booking" back={back} />
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {booking.status === "RESERVED" && (
            <>
              <Button disabled={!ready} onClick={() => void update("check-in")}>Check in</Button>
              <Button variant="secondary" disabled={!ready} onClick={() => void update("cancel")}>Cancel booking</Button>
            </>
          )}
          {parked && booking.session_id && <Button disabled={!ready} onClick={() => void update("check-out")}>Check out</Button>}
          {(booking.status === "RESERVED" || booking.status === "CHECKED_IN") && (
            <Link to={`/student/charging/new?${new URLSearchParams({ parking: booking.reservation_id })}`}>Request charging</Link>
          )}
        </div>
      </section>
    </>
  );
}
