import { OperatorScreenData } from "@/integration/OperatorScreenData";
import { simulationLabel, simulationUrl } from "@/integration/operatorRecords";
import { RecordFeedback } from "@/shared/api/ApiRecordUi";
import { Icon } from "@/shared/components/Icon";
import {
  Badge,
  Button,
  Empty,
  Link,
  PageTitle,
  SectionHead,
} from "@/shared/ui";
import { ScenarioForm } from "../components/ScenarioForm";
import { ScenarioResult } from "../components/ScenarioResult";
import { useWhatIf } from "../hooks/useWhatIf";
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
  const {
    s,
    liveRun,
    liveRuns,
    revision,
    query,
    types,
    liveHubs,
    points,
    point,
    setPoint,
    valid,
    fault,
    go,
    type,
    setType,
    hub,
    setHub,
    horizon,
    setHorizon,
    demand,
    setDemand,
    busy,
    error,
    runScenario,
  } = useWhatIf(id, newScenario);
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
        <PageTitle
          title="Explore a What-if"
          description={
            "Choose inputs and compare outcomes from an operational snapshot."
          }
        />
        <ScenarioForm
          runScenario={runScenario}
          type={type}
          setType={setType}
          hub={hub}
          setHub={setHub}
          horizon={horizon}
          setHorizon={setHorizon}
          demand={demand}
          setDemand={setDemand}
          error={error}
          busy={busy}
          types={types}
          liveHubs={liveHubs}
          points={points}
          point={point}
          setPoint={setPoint}
          valid={valid}
          fault={fault}
        />
      </>
    );
  return (
    <>
      <PageTitle
        title="What-if scenarios"
        description="Explore illustrative outcomes before making a change to the network."
        action={
          <Button onClick={() => go("/operator/what-if/new")}>
            <Icon name="plus" />
            New scenario
          </Button>
        }
      />
      <div className="grid grid-cols-3 gap-5 max-[1200px]:grid-cols-2 max-[600px]:grid-cols-1">
        {types.map((t, i) => (
          <section
            data-slot="panel"
            className="bg-panel rounded-sm min-w-0 **:data-[slot~=button]:text-xs max-[600px]:rounded-xs p-5 max-[600px]:p-5"
            key={t}
          >
            <span
              data-slot="icon-box"
              className="inline-flex items-center justify-center bg-soft text-accent w-11 h-11 rounded-xs shrink-0 mb-5"
            >
              <Icon
                name={
                  i === 1
                    ? "bolt"
                    : ["activity", "parking", "bolt", "alert", "dispatch"][i]
                }
                size={24}
              />
            </span>
            <span
              data-slot="eyebrow"
              className="text-xs font-semibold tracking-[1.7px] text-accent mb-3 block"
            >
              SUPPORTED PRESET 0{i + 1}
            </span>
            <h3>{t}</h3>
            <p className="leading-[1.65] mt-2 mb-5 mx-0">
              {i === 0
                ? "Model additional arrivals at Metro Interchange Hub."
                : "Model the loss of a working charging point."}
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                go(
                  `/operator/what-if/new?scenario=${i === 0 ? "rental" : "charger"}`,
                );
                return;
              }}
            >
              {"Configure scenario"} <Icon name="arrow" size={16} />
            </Button>
          </section>
        ))}
      </div>
      <section
        data-slot="panel"
        className="mt-5 bg-panel rounded-sm min-w-0 max-[600px]:mt-5 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
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
                    {run.run_id} · {run.horizon_minutes} minutes
                  </small>
                </span>
                <Badge>completed</Badge>
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
      </section>
    </>
  );
}
