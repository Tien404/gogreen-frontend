import type { State } from "@/domain/types";
import { metricLabel } from "@/integration/operatorRecords";
import { campusTime } from "@/integration/studentRecords";
import type { Schemas } from "@/shared/api/contract.generated";
import { Alert, Empty, SectionHead } from "@/shared/ui";
type LiveProps = {
  run: Schemas["SimulationRunOut"];
  s: State;
  revision: string | null;
};
export function ScenarioComparison({ run, s, revision }: LiveProps) {
  const details = [
    ["Hub", s.hubs.find((hub) => hub.id === run.hub_id)?.name ?? run.hub_id],
    ["Captured · Vietnam time", campusTime(run.snapshot_at)],
    ["Operational revision", run.snapshot_revision],
    ["Model", run.model_version],
    ["Horizon", `${run.horizon_minutes} minutes`],
  ];
  return (
    <div
      data-slot="two-col"
      className="mt-5 grid grid-cols-2 gap-5 max-[900px]:gap-4 max-[600px]:grid-cols-1"
    >
      <section
        data-slot="panel"
        className="min-w-0 rounded-sm bg-panel p-5 max-[600px]:rounded-xs"
      >
        <SectionHead
          title="KPI comparison"
          subtitle="Baseline vs scenario over the selected horizon"
        />
        {run.metrics.length ? (
          <div
            role="region"
            aria-label="Scrollable KPI comparison"
            tabIndex={0}
            className="max-w-full overflow-x-auto"
          >
            <table className="w-full min-w-68 border-collapse text-left text-sm">
              <caption className="sr-only">
                Baseline and scenario KPI values
              </caption>
              <thead className="bg-surface-muted">
                <tr>
                  <th scope="col" className="p-2">
                    Metric
                  </th>
                  <th scope="col" className="p-2">
                    Unit
                  </th>
                  <th scope="col" className="p-2">
                    Baseline
                  </th>
                  <th scope="col" className="p-2">
                    Scenario
                  </th>
                </tr>
              </thead>
              <tbody>
                {run.metrics.map((metric) => (
                  <tr key={metric.name} className="border-b border-divider">
                    <th scope="row" className="p-2 font-medium">
                      {metricLabel(metric.name)}
                    </th>
                    <td className="p-2">{metric.unit}</td>
                    <td className="p-2 tabular-nums">{metric.baseline}</td>
                    <td className="p-2 tabular-nums">{metric.scenario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No KPIs reported"
            text="This run has no comparison metrics."
          />
        )}
      </section>
      <section
        data-slot="panel"
        className="min-w-0 rounded-sm bg-panel p-5 max-[600px]:rounded-xs"
      >
        <SectionHead title="Snapshot" />
        <dl className="grid grid-cols-[minmax(100px,0.8fr)_1.2fr] gap-4 text-sm my-5">
          {details.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-content-muted">{label}</dt>
              <dd className="m-0 wrap-anywhere">{value}</dd>
            </div>
          ))}
        </dl>
        {revision !== null && revision !== run.snapshot_revision && (
          <Alert>
            Live operations have changed since this snapshot. Dispatch checks
            current eligibility and capacity.
          </Alert>
        )}
      </section>
    </div>
  );
}
