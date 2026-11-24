import {
  Panel,
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Alert,
  Empty,
  SectionHead,
} from "@/shared/ui";
import type { State } from "@/domain/types";
import { metricLabel } from "@/integration/operatorRecords";
import { campusTime } from "@/integration/studentRecords";
import type { Schemas } from "@/shared/api/contract.generated";

type LiveProps = {
  run: Schemas["SimulationRunOut"];
  s: State;
  revision: string | null;
};
export function ScenarioComparison({ run, s, revision }: LiveProps) {
  const details = [
    ["Hub", s.hubs.find((hub) => hub.id === run.hub_id)?.name ?? run.hub_id],
    ["Captured", campusTime(run.snapshot_at)],
    ["Operational revision", run.snapshot_revision],
    ["Model", run.model_version],
    ["Horizon", `${run.horizon_minutes} minutes`],
  ];
  return (
    <div
      data-slot="two-col"
      className="mt-5 grid grid-cols-2 gap-5 max-[900px]:gap-4 max-[900px]:grid-cols-1"
    >
      <Panel data-slot="panel" className="min-w-0">
        <SectionHead
          title="KPI comparison"
          subtitle="Baseline vs scenario over the selected horizon"
        />
        {run.metrics.length ? (
          <div className="min-w-0">
            <Table
              aria-label="Baseline and scenario KPI comparison"
              className="w-full min-w-130 border-collapse text-left text-sm"
            >
              <TableCaption className="sr-only">
                Baseline and scenario KPI values
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Metric</TableHead>
                  <TableHead scope="col">Unit</TableHead>
                  <TableHead scope="col">Baseline</TableHead>
                  <TableHead scope="col">Scenario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {run.metrics.map((metric) => (
                  <TableRow
                    key={metric.name}
                    className="border-b border-divider"
                  >
                    <TableHead scope="row">
                      {metricLabel(metric.name)}
                    </TableHead>
                    <TableCell className="whitespace-nowrap">
                      {metric.unit}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {metric.baseline}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {metric.scenario}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-2 text-sm sm:hidden">
              Scroll to compare baseline and scenario.
            </p>
          </div>
        ) : (
          <Empty
            title="No KPIs reported"
            text="This run has no comparison metrics."
          />
        )}
      </Panel>
      <Panel data-slot="panel" className="min-w-0">
        <SectionHead title="Snapshot" />
        <dl className="record-details">
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
      </Panel>
    </div>
  );
}
