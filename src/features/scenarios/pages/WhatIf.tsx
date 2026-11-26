import { campusTime } from "@/integration/studentRecords";
import {
  Panel,
  Button,
  Empty,
  Link,
  PageTitle,
  SectionHead,
} from "@/shared/ui";
import { OperatorScreenData } from "@/integration/OperatorScreenData";
import {
  simulationLabel,
  simulationTypes,
  simulationUrl,
} from "@/integration/operatorRecords";
import { RecordFeedback } from "@/shared/api/ApiRecordUi";
import { Icon } from "@/shared/components/Icon";

import { ScenarioForm } from "../components/ScenarioForm";
import { ScenarioResult } from "../components/ScenarioResult";
import { scenarioKinds, useWhatIf } from "../hooks/useWhatIf";
type WhatIfProps = {
  id?: string;
  newScenario?: boolean;
};
export function WhatIf(props: WhatIfProps) {
  return (
    <OperatorScreenData>
      <WhatIfView {...props} />
    </OperatorScreenData>
  );
}
function WhatIfView({ id, newScenario = false }: WhatIfProps) {
  const model = useWhatIf(id, newScenario);
  const { s, liveRun, liveRuns, revision, query, go } = model;
  if (id && !liveRun)
    return (
      <RecordFeedback
        query={query}
        item="simulation"
        back="/operator/what-if"
      />
    );
  if (liveRun)
    return <ScenarioResult s={s} run={liveRun} revision={revision} />;
  if (newScenario)
    return (
      <>
        <PageTitle title="Explore a What-if" />
        <ScenarioForm {...model} />
      </>
    );
  return (
    <>
      <PageTitle
        title="What-if scenarios"
        action={
          <Button onClick={() => go("/operator/what-if/new")}>
            <Icon name="plus" />
            New scenario
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-5 max-[1200px]:grid-cols-2 max-[600px]:grid-cols-1">
        {scenarioKinds.map((kind) => {
          const scenario = simulationTypes[kind];
          return (
            <Link
              to={`/operator/what-if/new?scenario=${scenario.query}`}
              className="flex min-w-0 items-start gap-3 rounded-xl bg-panel p-4 hover:bg-surface-muted"
              key={kind}
            >
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-green-muted text-primary">
                <Icon name={scenario.icon} size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block text-base">{scenario.label}</strong>
                <span className="mt-1 block text-sm text-content-muted">
                  {scenario.description}
                </span>
              </span>
              <Icon name="chevron" size={18} />
            </Link>
          );
        })}
      </div>
      <Panel data-slot="panel" className="mt-5 min-w-0 max-[600px]:mt-5">
        <SectionHead title="Recent runs" />
        {
          <>
            <RecordFeedback query={query} item="simulation runs" />
            {liveRuns.map((run) => (
              <Link
                key={run.run_id}
                to={simulationUrl(run.run_id)}
                className="flex items-center justify-between gap-3 border-t border-divider py-4 text-sm"
              >
                <span className="min-w-0 wrap-anywhere">
                  <strong>{simulationLabel(run.scenario_type)}</strong>
                  <small className="block">
                    {run.horizon_minutes} minutes ·{" "}
                    {campusTime(run.snapshot_at)}
                  </small>
                </span>
                <Icon name="chevron" size={18} />
              </Link>
            ))}
            {query.result.status === "ready" && !liveRuns.length && (
              <Empty
                title="No runs yet"
                text="Choose a scenario to run from a snapshot."
              />
            )}
          </>
        }
      </Panel>
    </>
  );
}
