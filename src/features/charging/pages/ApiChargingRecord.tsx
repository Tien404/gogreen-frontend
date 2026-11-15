import { useApp } from "@/app/providers/AppContext";
import { LIVE_POLL_MS, useOptionalOperatorFeed } from "@/integration/operatorFeed";
import { chargeSchedule, recordUrl, statusLabel } from "@/integration/studentRecords";
import { ApiErrorNotice } from "@/shared/api/ApiFeedback";
import { DataRows, panelClass, RecordFeedback } from "@/shared/api/ApiRecordUi";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { Badge, Button, Link, PageTitle } from "@/shared/ui";
import { useCallback } from "react";
import { useParams } from "react-router";

export function ApiChargingRecord() {
  const { sessionId } = useParams();
  const { api, notify, auth } = useApp();
  const feed = useOptionalOperatorFeed();
  const role = auth.user?.role ?? "student";
  const back = `/${role}/charging`;
  const action = useApiAction();
  const load = useCallback((signal: AbortSignal) =>
    api!.request("GET /charging/sessions/{session_id}", { params: { session_id: sessionId! }, signal }), [api, sessionId]);
  const query = useApiQuery(load, { retain: true, pollMs: LIVE_POLL_MS });
  if (query.result.status !== "ready") return <RecordFeedback query={query} item="charging request" back={back} />;

  const charge = query.result.data;
  const canCancel = charge.status === "PENDING" || charge.status === "SCHEDULED";
  const canStop = charge.status === "ACTIVE";
  const disabled = action.busy || query.refreshing || !!query.refreshError;
  const canStart = role === "operator" && charge.status === "SCHEDULED";
  async function update(kind: "start" | "stop" | "cancel") {
    const params = { session_id: charge.session_id };
    const result = await action.run(() => {
      if (kind === "start") return api!.request("POST /charging/sessions/{session_id}/start", { params });
      if (kind === "stop") return api!.request("POST /charging/sessions/{session_id}/stop", { params });
      return api!.request("POST /charging/sessions/{session_id}/cancel", { params });
    });
    if (result.ok) notify(kind === "start" ? "Charging started." : kind === "stop" ? "Charging stopped." : "Request canceled.");
    query.retry();
    feed?.retry();
  }

  return (
    <>
      <Link to={back}>All charging requests</Link>
      <PageTitle title="Charging details" description="View the schedule and status assigned by the server." action={<Badge>{statusLabel("charging", charge.status)}</Badge>} />
      <section data-slot="panel" className={panelClass}>
        <DataRows rows={[
          ["Hub", <Link to={`/${role}/hubs/${encodeURIComponent(charge.hub_id)}`}>{charge.hub_id}</Link>],
          ["Vehicle", charge.vehicle_id],
          ["Parking", role === "student" ? <Link to={recordUrl("parking", charge.parking_reservation_id)}>View booking</Link> : charge.parking_reservation_id],
          ["Charging point", charge.charging_point_id ?? "Not assigned"],
          ["Schedule · Vietnam time", chargeSchedule(charge)],
          ["Target battery", `${charge.target_battery_pct}%`],
        ]} />
        {charge.reason && <p className="mt-4 text-sm text-content-muted">{charge.reason}</p>}
        <ApiErrorNotice error={action.error} />
        <RecordFeedback query={query} item="charging request" back={back} />
        <div className="mt-5 flex flex-wrap gap-2">
          {canStart && <Button disabled={disabled} onClick={() => void update("start")}>Start charging</Button>}
          {(canCancel || canStop) && <Button variant="secondary" disabled={disabled} onClick={() => void update(canStop ? "stop" : "cancel")}>
            {canStop ? "Stop charging" : "Cancel request"}
          </Button>}
        </div>
      </section>
    </>
  );
}
