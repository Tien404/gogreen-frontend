import { Badge, Link, PageTitle } from "@/shared/ui";
import type { State } from "@/domain/types";
import { simulationLabel } from "@/integration/operatorRecords";
import type { Schemas } from "@/shared/api/contract.generated";
import { Icon } from "@/shared/components/Icon";

import { ScenarioMap } from "./ScenarioMap";
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
        action={<Badge>completed</Badge>}
      />
      <ScenarioMap key={run.run_id} run={run} s={s} />
      <ScenarioComparison run={run} s={s} revision={revision} />
      <ScenarioRecommendations recommendations={run.recommendations} />
    </>
  );
}
