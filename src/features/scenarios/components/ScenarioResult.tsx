import {
  Panel,
  Alert,
  Badge,
  Link,
  PageTitle,
  RecordReference,
} from "@/shared/ui";
import type { State } from "@/domain/types";
import { metricLabel, simulationLabel } from "@/integration/operatorRecords";
import { campusTime } from "@/integration/studentRecords";
import type { Schemas } from "@/shared/api/contract.generated";
import { Icon } from "@/shared/components/Icon";

import { ScenarioComparison } from "./ScenarioComparison";
import { ScenarioRecommendations } from "./ScenarioRecommendation";
type ScenarioResultProps = {
  s: State;
  run: Schemas["SimulationRunOut"];
  revision: string | null;
};
export function ScenarioResult({ s, run, revision }: ScenarioResultProps) {
  return (
    <>
      <Link
        className="inline-flex items-center gap-2 text-sm text-content-muted mb-5"
        to="/operator/what-if"
      >
        <Icon name="arrow-left" size={16} /> What-if scenarios
      </Link>
      <PageTitle
        title={simulationLabel(run.scenario_type)}
        description={`${run.horizon_minutes}-minute horizon · Snapshot at ${campusTime(run.snapshot_at)}`}
        action={<Badge>completed</Badge>}
      />
      <RecordReference value={run.run_id} label="Simulation reference" />
      <Alert>
        Baseline and scenario values are calculated from the same snapshot.
      </Alert>
      <div className="grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[600px]:gap-2">
        {run.metrics.map((metric) => (
          <Panel key={metric.name} data-slot="panel" className="min-w-0">
            <span className="text-sm text-content-muted">
              {metricLabel(metric.name)}
            </span>
            <strong className="metric-value">{metric.scenario}</strong>
            <small className="leading-[1.6] block max-[600px]:text-sm">
              Baseline: {metric.baseline} · {metric.unit}
            </small>
          </Panel>
        ))}
      </div>
      <ScenarioComparison run={run} s={s} revision={revision} />
      <ScenarioRecommendations recommendations={run.recommendations} />
    </>
  );
}
