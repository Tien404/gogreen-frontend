import { useApp } from "@/app/providers/AppContext";
import { LIVE_POLL_MS, useOperatorFeed } from "@/integration/operatorFeed";
import { dispatchUrl } from "@/integration/operatorRecords";
import { campusTime, statusLabel } from "@/integration/studentRecords";
import { ApiErrorNotice } from "@/shared/api/ApiFeedback";
import { DataRows, inputClass, panelClass, recordRowClass, RecordFeedback } from "@/shared/api/ApiRecordUi";
import type { Schemas } from "@/shared/api/contract.generated";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { Alert, Badge, Button, Empty, Field, Link, PageTitle, SectionHead } from "@/shared/ui";
import { useCallback, useState, type FormEvent } from "react";
import { useParams, useSearchParams } from "react-router";

export function ApiDispatch() {
  const feed = useOperatorFeed();
  const data = feed.result.status === "ready" ? feed.result.data.data : undefined;
  return (
    <>
      <PageTitle title="Dispatch" description="Plan a move for one shared vehicle at a time." />
      <RecordFeedback query={feed} item="dispatches" />
      {data && <div className="grid gap-4 min-[1200px]:grid-cols-2">
        <DispatchForm data={data} unavailable={!!feed.refreshError} />
        <section data-slot="panel" className={panelClass}>
          <SectionHead title="Dispatch records" />
          {data.dispatches.length ? <ul>{data.dispatches.map((task) => (
            <li key={task.task_id} className={recordRowClass}>
              <div className="min-w-0 break-words">
                <Link to={dispatchUrl(task.task_id)}>{task.vehicle_id}</Link>
                <p className="text-sm text-content-muted">{task.from_hub_id} → {task.to_hub_id}</p>
              </div>
              <Badge>{statusLabel("dispatch", task.status)}</Badge>
            </li>
          ))}</ul> : <Empty title="No dispatches yet" text="Planned moves will appear here." />}
        </section>
      </div>}
    </>
  );
}

function DispatchForm({ data, unavailable }: { data: Schemas["OperationsOut"]; unavailable: boolean }) {
  const { api, go, notify } = useApp();
  const feed = useOperatorFeed();
  const action = useApiAction();
  const [params] = useSearchParams();
  const [from, setFrom] = useState(params.get("from_hub_id") ?? "");
  const [to, setTo] = useState(params.get("to_hub_id") ?? "");
  const [vehicleId, setVehicleId] = useState(params.get("vehicle_id") ?? "");
  const activeHubs = data.hubs.filter((hub) => hub.status === "ACTIVE");
  const candidates = data.vehicles.filter((vehicle) => vehicle.current_hub_id === from && vehicle.status === "AVAILABLE");
  const sourceValid = activeHubs.some((hub) => hub.hub_id === from);
  const destinationValid = activeHubs.some((hub) => hub.hub_id === to) && from !== to;
  const vehicleValid = candidates.some((vehicle) => vehicle.vehicle_id === vehicleId);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sourceValid || !destinationValid || !vehicleValid || unavailable) return;
    const result = await action.run(() => api!.request("POST /redistribution-tasks", {
      body: { vehicle_id: vehicleId, from_hub_id: from, to_hub_id: to },
    }));
    feed.retry();
    if (result.ok) {
      notify("Dispatch planned.");
      go(dispatchUrl(result.data.task_id));
    }
  }

  return (
    <section id="plan-dispatch" data-slot="panel" className={panelClass}>
      <SectionHead title="Plan a dispatch" />
      {activeHubs.length < 2 ? <Empty title="Two active hubs are required" text="There is no eligible route for a dispatch." /> : (
        <form onSubmit={submit}>
          <fieldset disabled={action.busy || unavailable} className="border-0 p-0">
            <Field label="Source hub">
              <select className={inputClass} required value={from} onChange={(event) => { setFrom(event.target.value); setVehicleId(""); }}>
                <option value="">Choose the source</option>
                {from && !sourceValid && <option value={from}>{from} · unavailable</option>}
                {activeHubs.map((hub) => <option key={hub.hub_id} value={hub.hub_id}>{hub.name}</option>)}
              </select>
            </Field>
            <Field label="Destination hub">
              <select className={inputClass} required value={to} onChange={(event) => setTo(event.target.value)}>
                <option value="">Choose the destination</option>
                {to && !destinationValid && <option value={to}>{to} · unavailable</option>}
                {activeHubs.filter((hub) => hub.hub_id !== from).map((hub) => <option key={hub.hub_id} value={hub.hub_id}>{hub.name} · {hub.bookable_now} bookable</option>)}
              </select>
            </Field>
            <Field label="Vehicle">
              <select className={inputClass} required value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}>
                <option value="">Choose one vehicle</option>
                {vehicleId && !vehicleValid && <option value={vehicleId}>{vehicleId} · unavailable</option>}
                {candidates.map((vehicle) => <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>{vehicle.vehicle_id}</option>)}
              </select>
            </Field>
            {vehicleId && !vehicleValid && <Alert>The selected vehicle is no longer available. Choose another vehicle to continue.</Alert>}
            <ApiErrorNotice error={action.error} />
            <Button type="submit" disabled={!sourceValid || !destinationValid || !vehicleValid}>{action.busy ? "Planning…" : "Plan dispatch"}</Button>
          </fieldset>
        </form>
      )}
    </section>
  );
}

export function ApiDispatchRecord() {
  const { dispatchId } = useParams();
  const { api, notify } = useApp();
  const feed = useOperatorFeed();
  const action = useApiAction();
  const load = useCallback((signal: AbortSignal) => api!.request("GET /redistribution-tasks/{task_id}", { params: { task_id: dispatchId! }, signal }), [api, dispatchId]);
  const query = useApiQuery(load, { retain: true, pollMs: LIVE_POLL_MS });
  const task = query.result.status === "ready" ? query.result.data : null;
  if (!task) return <RecordFeedback query={query} item="dispatch" back="/operator/dispatch" />;

  const canStart = task.status === "PLANNED";
  const canComplete = !!task.started_at && ["IN_TRANSIT", "FAILED"].includes(task.status);
  async function update(start: boolean) {
    const params = { task_id: task!.task_id };
    const result = await action.run(() => start
      ? api!.request("POST /redistribution-tasks/{task_id}/start", { params })
      : api!.request("POST /redistribution-tasks/{task_id}/complete", { params }));
    if (result.ok) notify(start ? "Dispatch started." : "Arrival confirmed.");
    query.retry();
    feed.retry();
  }

  return (
    <>
      <Link to="/operator/dispatch">All dispatches</Link>
      <PageTitle title={`Dispatch · ${task.vehicle_id}`} description="Track the move and confirm arrival after the vehicle reaches its destination." action={<Badge>{statusLabel("dispatch", task.status)}</Badge>} />
      <section data-slot="panel" className={panelClass}>
        <DataRows rows={[
          ["Source", task.from_hub_id], ["Destination", task.to_hub_id],
          ["Departure", task.started_at ? campusTime(task.started_at) : "—"],
          ["Arrival", task.completed_at ? campusTime(task.completed_at) : "—"],
          ["Reason", task.reason ?? "—"],
        ]} />
        {task.status === "FAILED" && task.started_at && <Alert>The vehicle remains in transit. Resolve its fault before confirming arrival.</Alert>}
        <ApiErrorNotice error={action.error} />
        <RecordFeedback query={query} item="dispatch" back="/operator/dispatch" />
        {(canStart || canComplete) && (
          <Button className="mt-5" disabled={action.busy || query.refreshing || !!query.refreshError || !!feed.refreshError} onClick={() => void update(canStart)}>
            {canStart ? "Start dispatch" : "Confirm arrival"}
          </Button>
        )}
      </section>
    </>
  );
}
