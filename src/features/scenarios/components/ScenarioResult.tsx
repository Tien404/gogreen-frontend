import type { State } from "@/domain/types";
import { metricLabel, simulationLabel } from "@/integration/operatorRecords";
import { campusTime } from "@/integration/studentRecords";
import type { Schemas } from "@/shared/api/contract.generated";
import { Icon } from "@/shared/components/Icon";
import { Alert, Badge, Link, PageTitle } from "@/shared/ui";
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
        className="inline-flex items-center gap-2 text-xs text-content-muted mb-5"
        to="/operator/what-if"
      >
        <Icon name="arrow-left" size={16} /> What-if scenarios
      </Link>
      <PageTitle
        title={simulationLabel(run.scenario_type)}
        description={`${run.horizon_minutes}-minute horizon · Snapshot at ${campusTime(run.snapshot_at)}`}
        action={<Badge>completed</Badge>}
      />
      <Alert>
        Baseline and scenario values are calculated from the same snapshot.
      </Alert>
      <div className="grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[600px]:gap-2">
        {run.metrics.map((metric) => (
          <div
            key={metric.name}
            data-slot="panel"
            className="bg-panel rounded-sm min-w-0 p-5 max-[600px]:rounded-xs max-[600px]:p-4"
          >
            <span className="text-xs text-content-muted">
              {metricLabel(metric.name)}
            </span>
            <strong className="text-lg leading-[1.4] block tracking-[-1px] mt-3 mb-1 max-[600px]:tracking-[-0.5px]">
              {metric.scenario}
            </strong>
            <small className="leading-[1.6] block max-[600px]:text-xs">
              Baseline: {metric.baseline} · {metric.unit}
            </small>
          </div>
        ))}
      </div>
      <ScenarioComparison run={run} s={s} revision={revision} />
      <ScenarioRecommendations recommendations={run.recommendations} />
    </>
  );
}
