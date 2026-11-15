import { useApp } from "@/app/providers/AppContext";
import { useOperatorFeed } from "@/integration/operatorFeed";
import { dispatchAdviceUrl, metricLabel, simulationLabel, simulationUrl } from "@/integration/operatorRecords";
import { campusTime } from "@/integration/studentRecords";
import { ApiErrorNotice } from "@/shared/api/ApiFeedback";
import { DataRows, inputClass, panelClass, recordRowClass, RecordFeedback } from "@/shared/api/ApiRecordUi";
import type { Schemas } from "@/shared/api/contract.generated";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { Alert, Badge, Button, Empty, Field, Link, PageTitle, SectionHead } from "@/shared/ui";
import { useCallback, useState, type FormEvent } from "react";
import { useParams } from "react-router";

const back = "/operator/what-if";
type ScenarioType = Schemas["SimulationRunOut"]["scenario_type"];

export function ApiWhatIf() {
  const { api } = useApp();
  const load = useCallback((signal: AbortSignal) => api!.request("GET /simulations", { signal }), [api]);
  const query = useApiQuery(load, { retain: true });

  return (
    <>
      <PageTitle title="What-if scenarios" description="Compare a scenario against the same snapshot of campus operations." action={<Link to={`${back}/new`}>New simulation</Link>} />
      <section data-slot="panel" className={panelClass}>
        <SectionHead title="Previous runs" action={<Button variant="secondary" onClick={query.retry}>Refresh</Button>} />
        <RecordFeedback query={query} item="simulation history" />
        {query.result.status === "ready" && (query.result.data.length ? <ul>
          {query.result.data.map((run) => (
            <li key={run.run_id} className={recordRowClass}>
              <div>
                <Link to={simulationUrl(run.run_id)}>{simulationLabel(run.scenario_type)}</Link>
                <p className="text-sm text-content-muted">{run.hub_id} · {campusTime(run.snapshot_at)}</p>
              </div>
              <Badge>Completed</Badge>
            </li>
          ))}
        </ul> : <Empty title="No simulation runs yet" text="Start a scenario to compare its outcomes." />)}
      </section>
    </>
  );
}

export function ApiWhatIfNew() {
  const { api, go } = useApp();
  const feed = useOperatorFeed();
  const action = useApiAction();
  const [scenario, setScenario] = useState<ScenarioType>("RENTAL_DEMAND_SURGE");
  const [hubId, setHubId] = useState("");
  const [pointId, setPointId] = useState("");
  const hubs = feed.result.status === "ready" ? feed.result.data.data.hubs.filter((hub) => hub.status === "ACTIVE") : [];
  const metro = hubs.find((hub) => hub.hub_id === "metro");
  const faultHubs = hubs.filter((hub) => hub.charging_points.some((point) => point.status !== "UNAVAILABLE"));
  const points = faultHubs.find((hub) => hub.hub_id === hubId)?.charging_points.filter((point) => point.status !== "UNAVAILABLE") ?? [];
  const valid = scenario === "RENTAL_DEMAND_SURGE" ? !!metro : points.some((point) => point.resource_id === pointId);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || feed.refreshError) return;
    const fields = new FormData(event.currentTarget);
    const horizon_minutes = Number(fields.get("horizon"));
    const result = await action.run(() => api!.request("POST /simulations", { body: scenario === "RENTAL_DEMAND_SURGE"
      ? { scenario_type: scenario, hub_id: "metro", horizon_minutes, demand_count: Number(fields.get("demand")) }
      : { scenario_type: scenario, hub_id: hubId, horizon_minutes, charging_point_id: pointId },
    }));
    if (result.ok) go(simulationUrl(result.data.run_id));
  }

  return (
    <>
      <Link to={back}>All simulations</Link>
      <PageTitle title="Run a simulation" description="Choose a scenario and compare projected outcomes without changing operations." />
      <section data-slot="panel" className={panelClass}>
        <RecordFeedback query={feed} item="simulation inputs" />
        {feed.result.status === "ready" && (
          <form onSubmit={submit} className="max-w-150">
            <fieldset disabled={action.busy || !!feed.refreshError} className="border-0 p-0">
              <Field label="Scenario type">
                <select className={inputClass} value={scenario} onChange={(event) => setScenario(event.target.value as ScenarioType)}>
                  <option value="RENTAL_DEMAND_SURGE">Metro rental demand surge</option>
                  <option value="CHARGER_FAULT">Charging-point fault</option>
                </select>
              </Field>
              <Field label="Horizon (minutes)">
                <input className={inputClass} name="horizon" type="number" min="1" max="240" defaultValue="30" required />
              </Field>
              {scenario === "RENTAL_DEMAND_SURGE" ? (
                <>
                  <p className="mb-4 text-sm">{metro?.name ?? "Metro is not available in the current network."}</p>
                  <Field label="Additional rental requests">
                    <input className={inputClass} name="demand" type="number" min="1" max="1000" defaultValue="3" required />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Hub">
                    <select className={inputClass} value={hubId} required onChange={(event) => { setHubId(event.target.value); setPointId(""); }}>
                      <option value="">Choose a hub</option>
                      {faultHubs.map((hub) => <option value={hub.hub_id} key={hub.hub_id}>{hub.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Charging point">
                    <select className={inputClass} value={pointId} required onChange={(event) => setPointId(event.target.value)}>
                      <option value="">Choose a working point</option>
                      {pointId && !points.some((point) => point.resource_id === pointId) && <option value={pointId}>{pointId} · unavailable</option>}
                      {points.map((point) => <option value={point.resource_id} key={point.resource_id}>{point.resource_id}</option>)}
                    </select>
                  </Field>
                  {!faultHubs.length && <Alert>No working charging points are available for this scenario.</Alert>}
                </>
              )}
              <ApiErrorNotice error={action.error} />
              <Button type="submit" disabled={!valid}>{action.busy ? "Running…" : "Run simulation"}</Button>
            </fieldset>
          </form>
        )}
      </section>
    </>
  );
}

export function ApiWhatIfResult() {
  const { runId } = useParams();
  const { api } = useApp();
  const feed = useOperatorFeed();
  const load = useCallback((signal: AbortSignal) => api!.request("GET /simulations/{run_id}", { params: { run_id: runId! }, signal }), [api, runId]);
  const query = useApiQuery(load);
  if (query.result.status !== "ready") return <RecordFeedback query={query} item="simulation" back={back} />;
  const run = query.result.data;
  const revision = feed.result.status === "ready" && !feed.refreshError ? feed.result.data.revision : null;

  return (
    <>
      <Link to={back}>All simulations</Link>
      <PageTitle title={simulationLabel(run.scenario_type)} description="Baseline and scenario values are calculated from the same snapshot." action={<Link to={`${back}/new`}>Run another scenario</Link>} />
      <section data-slot="panel" className={panelClass}>
        <SectionHead title="Snapshot" />
        <DataRows rows={[
          ["Hub", run.hub_id],
          ["Captured · Vietnam time", campusTime(run.snapshot_at)],
          ["Operational revision", run.snapshot_revision],
          ["Model", run.model_version],
          ["Horizon", `${run.horizon_minutes} minutes`],
        ]} />
        {revision !== null && revision !== run.snapshot_revision &&
          <Alert>Live operations have changed since this snapshot. Dispatch checks current eligibility and capacity.</Alert>}
      </section>
      <section data-slot="panel" className={panelClass}>
        <SectionHead title="KPI comparison" />
        {run.metrics.length ? (
          <div role="region" aria-label="Scrollable KPI comparison" tabIndex={0} className="max-w-full overflow-x-auto rounded-xs focus-visible:outline-2 focus-visible:outline-accent">
            <table className="w-full min-w-70 border-collapse text-left text-sm">
              <caption className="sr-only">Baseline and scenario KPI values</caption>
              <thead><tr className="bg-surface-muted">
                <th scope="col" className="p-2 max-[480px]:p-1">Metric</th><th scope="col" className="p-2 max-[480px]:p-1">Unit</th>
                <th scope="col" className="p-2 max-[480px]:p-1">Baseline</th><th scope="col" className="p-2 max-[480px]:p-1">Scenario</th>
              </tr></thead>
              <tbody>{run.metrics.map((metric) => <tr key={metric.name} className="border-b border-divider">
                <th scope="row" className="p-2 max-[480px]:p-1 font-medium">{metricLabel(metric.name)}</th>
                <td className="p-2 max-[480px]:p-1">{metric.unit}</td><td className="p-2 max-[480px]:p-1 tabular-nums">{metric.baseline}</td>
                <td className="p-2 max-[480px]:p-1 tabular-nums">{metric.scenario}</td>
              </tr>)}</tbody>
            </table>
          </div>
        ) : <Empty title="No KPIs reported" text="This run has no comparison metrics." />}
      </section>
      <section data-slot="panel" className={panelClass}>
        <SectionHead title="Recommendations" />
        {run.recommendations.length ? <ul>{run.recommendations.map((advice) => {
          const url = dispatchAdviceUrl(advice);
          return <li key={`${advice.type}-${advice.vehicle_id ?? advice.reason}`} className={recordRowClass}>
            <div className="min-w-0 break-words">
              <p>{advice.reason}</p>
              {url && <Link to={url}>Review suggested dispatch</Link>}
            </div>
          </li>;
        })}</ul> : <p className="text-content-muted">No coordination action was recommended.</p>}
      </section>
    </>
  );
}
