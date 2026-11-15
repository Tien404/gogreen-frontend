import { mapHub, mapVehicle } from "@/integration/apiMappers";
import { useOperatorFeed } from "@/integration/operatorFeed";
import { alertLabel, readableCode } from "@/integration/operatorRecords";
import { campusTime } from "@/integration/studentRecords";
import { DataRows, inputClass, panelClass, recordRowClass, RecordFeedback } from "@/shared/api/ApiRecordUi";
import { Badge, Button, Empty, Field, Link, PageTitle, SectionHead } from "@/shared/ui";
import { useState } from "react";

export function ApiOperatorOverview() {
  const feed = useOperatorFeed();
  const snapshot = feed.result.status === "ready" ? feed.result.data : null;
  const data = snapshot?.data;
  const hubs = data?.hubs.map(mapHub) ?? [];
  const hubName = (id: string) => hubs.find((hub) => hub.id === id)?.name ?? id;
  const open = data?.incidents.filter((incident) => incident.status === "OPEN" || incident.status === "IN_PROGRESS").length ?? 0;
  const moving = data?.dispatches.filter((dispatch) => dispatch.status === "IN_TRANSIT" || (dispatch.status === "FAILED" && dispatch.started_at)).length ?? 0;

  return (
    <>
      <PageTitle title="Operations overview" description={data ? `Updated ${campusTime(data.as_of)} · Vietnam time` : "Monitor campus mobility resources."}
        action={<Button variant="secondary" onClick={feed.retry}>Refresh overview</Button>} />
      <RecordFeedback query={feed} item="operations" />
      {data && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 min-[1000px]:grid-cols-4">
            {([
              ["Hubs", hubs.length],
              ["Shared vehicles", data.vehicles.length],
              ["Open incidents", open, "/operator/incidents"],
              ["Vehicles in transit", moving, "/operator/dispatch"],
            ] as const).map(([name, value, link]) => (
              <section key={name} data-slot="panel" className="min-w-0 rounded-sm bg-panel p-4">
                {link ? <Link to={link}>{name}</Link> : <span>{name}</span>}
                <p className="mt-2 text-lg font-semibold">{value}</p>
              </section>
            ))}
          </div>
          <section data-slot="panel" className={panelClass}>
            <SectionHead title="Operational alerts" />
            {data.alerts.length ? (
              <ul>{data.alerts.map((alert) => (
                <li key={`${alert.hub_id}-${alert.code}`} className={recordRowClass}>
                  <span>{alertLabel(alert.code)}</span>
                  <Link to={`/operator/hubs/${encodeURIComponent(alert.hub_id)}`}>{hubName(alert.hub_id)}</Link>
                </li>
              ))}</ul>
            ) : <p className="text-content-muted">No active alerts.</p>}
          </section>
          <section data-slot="panel" className={panelClass}>
            <SectionHead title="Hub monitoring" />
            {hubs.length ? (
              <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-2">
                {hubs.map((hub) => (
                  <section key={hub.id} className="min-w-0 rounded-xs border border-divider p-4">
                    <h3 className="mb-3 font-medium"><Link to={`/operator/hubs/${encodeURIComponent(hub.id)}`}>{hub.name}</Link></h3>
                    <DataRows rows={[
                      ["Parking occupied", `${hub.capacity - hub.physicalFree} / ${hub.capacity}`],
                      ["Bookable spaces", hub.bookable],
                      ["Available charging points", `${hub.points.filter((point) => point.status === "available").length} / ${hub.points.length}`],
                    ]} />
                  </section>
                ))}
              </div>
            ) : <Empty title="No hubs to monitor" text="No hubs are available in the current network." />}
          </section>
        </>
      )}
    </>
  );
}

export function ApiOperatorFleet() {
  const feed = useOperatorFeed();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const snapshot = feed.result.status === "ready" ? feed.result.data : null;
  const vehicles = snapshot?.data.vehicles.map(mapVehicle) ?? [];
  const statuses = [...new Set(vehicles.flatMap((vehicle) => vehicle.status ? [vehicle.status] : []))].sort();
  const shown = vehicles.filter((vehicle) =>
    vehicle.id.toLowerCase().includes(search.trim().toLowerCase()) && (!status || vehicle.status === status));
  return (
    <>
      <PageTitle title="Shared fleet" description="Monitor location, battery readings and current vehicle status." />
      <section data-slot="panel" className={panelClass}>
        {snapshot && <div className="grid grid-cols-1 gap-x-4 min-[640px]:grid-cols-2">
          <Field label="Search vehicle ID"><input className={inputClass} value={search} onChange={(event) => setSearch(event.target.value)} /></Field>
          <Field label="Status">
            <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All states</option>
              {statuses.map((item) => <option key={item} value={item}>{readableCode(item.replaceAll("-", "_"))}</option>)}
            </select>
          </Field>
        </div>}
        <RecordFeedback query={feed} item="fleet" />
        {snapshot && (shown.length ? <ul>
          {shown.map((vehicle) => (
            <li key={vehicle.id} className={recordRowClass}>
              <div className="min-w-0 break-words">
                <strong>{vehicle.id}</strong>
                <p className="text-sm text-content-muted">{vehicle.type ?? "Shared vehicle"} · {vehicle.hubId
                  ? snapshot.data.hubs.find((hub) => hub.hub_id === vehicle.hubId)?.name ?? vehicle.hubId
                  : "Outside a hub"}</p>
                <p className="text-sm">{vehicle.battery == null ? "Battery unknown" : `${vehicle.battery}% battery`}
                  {vehicle.batteryObservedAt != null && ` · Observed ${campusTime(new Date(vehicle.batteryObservedAt).toISOString())}`}</p>
              </div>
              <Badge>{vehicle.status?.replaceAll("-", " ") ?? "Unknown status"}</Badge>
            </li>
          ))}
        </ul> : <Empty title="No vehicles found" text="There are no shared vehicles matching these filters." />)}
      </section>
    </>
  );
}
