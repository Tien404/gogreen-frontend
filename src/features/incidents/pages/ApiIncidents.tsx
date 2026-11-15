import { useApp } from "@/app/providers/AppContext";
import { LIVE_POLL_MS, useOperatorFeed } from "@/integration/operatorFeed";
import { readableCode } from "@/integration/operatorRecords";
import { campusTime, statusLabel } from "@/integration/studentRecords";
import { ApiErrorNotice } from "@/shared/api/ApiFeedback";
import { DataRows, inputClass, panelClass, recordRowClass, RecordFeedback } from "@/shared/api/ApiRecordUi";
import type { Schemas } from "@/shared/api/contract.generated";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { Badge, Button, Empty, Field, Link, PageTitle, SectionHead } from "@/shared/ui";
import { useCallback, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";

export function ApiIncidents() {
  const feed = useOperatorFeed();
  const [params] = useSearchParams();
  const data = feed.result.status === "ready" ? feed.result.data.data : undefined;
  const id = params.get("incident");
  return (
    <>
      <PageTitle title="Incidents" description="Report a vehicle or resource fault and record how it was resolved." />
      <RecordFeedback query={feed} item="incidents" />
      {id && <IncidentDetails id={id} />}
      {data && (
        <div className="grid gap-4 min-[1200px]:grid-cols-2">
          <section data-slot="panel" className={panelClass}>
            <SectionHead title="Recorded incidents" />
            {data.incidents.length ? <ul>{data.incidents.map((incident) => (
              <li key={incident.incident_id} className={recordRowClass}>
                <div className="min-w-0 break-words">
                  <Link to={`/operator/incidents?${new URLSearchParams({ incident: incident.incident_id })}`}>{readableCode(incident.incident_type)}</Link>
                  <p className="text-sm text-content-muted">{incident.hub_id} · {incident.vehicle_id ?? incident.resource_id}</p>
                </div>
                <Badge>{statusLabel("incident", incident.status)}</Badge>
              </li>
            ))}</ul> : <Empty title="No incidents recorded" text="Reported incidents will appear here." />}
          </section>
          <IncidentForm data={data} blocked={!!feed.refreshError} />
        </div>
      )}
    </>
  );
}

function IncidentForm({ data, blocked }: { data: Schemas["OperationsOut"]; blocked: boolean }) {
  const { api, go, notify } = useApp();
  const feed = useOperatorFeed();
  const action = useApiAction();
  const [hub, setHub] = useState("");
  const [kind, setKind] = useState("charging");
  const hubInfo = data.hubs.find((item) => item.hub_id === hub);
  const vehicleIds = [...new Set([
    ...data.vehicles.filter((vehicle) => vehicle.current_hub_id === hub).map((vehicle) => vehicle.vehicle_id),
    ...data.dispatches.filter((task) => task.started_at && ["IN_TRANSIT", "FAILED"].includes(task.status)
      && (task.to_hub_id === hub || task.from_hub_id === hub)).map((task) => task.vehicle_id),
    ...data.charging.filter((charge) => charge.hub_id === hub && charge.status === "ACTIVE").map((charge) => charge.vehicle_id),
  ])];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const target = String(fields.get("target") ?? "").trim();
    if (!hub || !target) return;
    const result = await action.run(() => api!.request("POST /incidents", {
      body: {
        hub_id: hub,
        ...(kind === "vehicle" ? { vehicle_id: target } : { resource_id: target }),
        severity: String(fields.get("severity")),
        incident_type: String(fields.get("type")),
        description: String(fields.get("description") ?? "").trim() || null,
      },
    }));
    if (result.ok) {
      feed.retry();
      notify("Incident reported.");
      go(`/operator/incidents?${new URLSearchParams({ incident: result.data.incident_id })}`);
    }
  }

  return (
    <section data-slot="panel" className={panelClass}>
      <SectionHead title="Report an incident" />
      {data.hubs.length ? <form onSubmit={submit}>
        <fieldset disabled={blocked || action.busy} className="border-0 p-0">
          <Field label="Hub">
            <select className={inputClass} required value={hub} onChange={(event) => setHub(event.target.value)}>
              <option value="">Choose a hub</option>
              {data.hubs.map((item) => <option key={item.hub_id} value={item.hub_id}>{item.name}</option>)}
            </select>
          </Field>
          <Field label="Affected resource">
            <select className={inputClass} value={kind} onChange={(event) => setKind(event.target.value)}>
              <option value="charging">Charging point</option>
              <option value="vehicle">Vehicle</option>
              <option value="parking">Parking space</option>
            </select>
          </Field>
          {kind === "parking" ? (
            <Field label="Parking-space ID"><input className={inputClass} name="target" required maxLength={100} key={hub} /></Field>
          ) : (
            <Field label={kind === "vehicle" ? "Vehicle" : "Charging point"}>
              <select className={inputClass} name="target" required defaultValue="" key={`${hub}-${kind}`}>
                <option value="">Choose a resource</option>
                {(kind === "vehicle" ? vehicleIds : hubInfo?.charging_points.map((point) => point.resource_id) ?? [])
                  .map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
          )}
          <input type="hidden" name="type" value={kind === "vehicle" ? "VEHICLE_FAULT" : kind === "parking" ? "PARKING_SPACE_FAULT" : "CHARGER_FAULT"} />
          <Field label="Severity">
            <select className={inputClass} name="severity" defaultValue="MEDIUM">
              <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
            </select>
          </Field>
          <Field label="Description"><textarea className={`${inputClass} py-2`} name="description" maxLength={1000} rows={3} /></Field>
          <ApiErrorNotice error={action.error} />
          <Button type="submit">{action.busy ? "Reporting…" : "Report incident"}</Button>
        </fieldset>
      </form> : <Empty title="No hubs available" text="Add a hub before reporting faults." />}
    </section>
  );
}

function IncidentDetails({ id }: { id: string }) {
  const { api, notify } = useApp();
  const feed = useOperatorFeed();
  const action = useApiAction();
  const load = useCallback((signal: AbortSignal) => api!.request("GET /incidents/{incident_id}", { params: { incident_id: id }, signal }), [api, id]);
  const query = useApiQuery(load, { retain: true, pollMs: LIVE_POLL_MS });

  async function resolve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const notes = String(new FormData(event.currentTarget).get("notes") ?? "").trim();
    if (!notes) return;
    const result = await action.run(() => api!.request("POST /incidents/{incident_id}/resolve", {
      params: { incident_id: id }, body: { resolution_notes: notes },
    }));
    if (result.ok) notify("Incident resolved.");
    query.retry();
    feed.retry();
  }

  return (
    <section data-slot="panel" className={panelClass}>
      <SectionHead title="Incident details" action={<Link to="/operator/incidents">Close details</Link>} />
      <RecordFeedback query={query} item="incident" back="/operator/incidents" />
      {query.result.status === "ready" && (() => {
        const incident = query.result.data;
        return <>
          <DataRows rows={[
            ["Resource", incident.vehicle_id ?? incident.resource_id ?? "Unknown"],
            ["Status", statusLabel("incident", incident.status)],
            ["Severity", readableCode(incident.severity)],
            ["Reported", campusTime(incident.opened_at)],
            ["Description", incident.description ?? "—"],
            ["Resolution", incident.resolution_notes ?? "—"],
          ]} />
          {["OPEN", "IN_PROGRESS"].includes(incident.status) && <form onSubmit={resolve} className="mt-5 max-w-140">
            <fieldset disabled={action.busy || query.refreshing || !!query.refreshError} className="border-0 p-0">
              <Field label="Resolution notes"><textarea className={`${inputClass} py-2`} name="notes" required maxLength={1000} rows={3} /></Field>
              <ApiErrorNotice error={action.error} />
              <Button type="submit">Resolve incident</Button>
            </fieldset>
          </form>}
        </>;
      })()}
    </section>
  );
}
