import { Missing } from "@/app/pages/Missing";
import { scenarioFixtures, scenarioTypes } from "@/mocks/scenarios";
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

export function WhatIf({ id, newScenario = false }: WhatIfProps) {
  const {
    s,
    act,
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
    setError,
    r,
    result,
    runScenario,
  } = useWhatIf(id);

  if (id && !r) return <Missing />;

  if (r)
    return (
      <ScenarioResult
        s={s}
        act={act}
        r={r}
        result={result}
        setError={setError}
        error={error}
      />
    );

  if (newScenario)
    return (
      <>
        <PageTitle
          title="Explore a What-if"
          description="Choose supported inputs to inspect an illustrative campus scenario."
        />
        <ScenarioForm
          s={s}
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
        {scenarioTypes.map((t, i) => (
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
                name={["activity", "parking", "bolt", "alert", "dispatch"][i]}
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
              {s.hubs.find((hub) => hub.id === scenarioFixtures[t].hub)?.name} ·
              60-minute illustrative result
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                const result = act({
                  type: "run",
                  scenarioType: t,
                  hub: scenarioFixtures[t].hub,
                  horizon: "60",
                  demand: "standard",
                });

                go(`/operator/what-if/runs/${result.id}`);
              }}
            >
              Open mock result <Icon name="arrow" size={16} />
            </Button>
          </section>
        ))}
      </div>
      <section
        data-slot="panel"
        className="mt-5 bg-panel rounded-sm min-w-0 max-[600px]:mt-5 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <SectionHead title="Recent runs" />
        {s.runs.length ? (
          s.runs.map((r) => (
            <Link
              key={r.id}
              to={`/operator/what-if/runs/${r.id}`}
              className="flex items-center justify-between gap-3 border-t border-solid border-t-divider text-sm py-4 px-0"
            >
              <span>
                <strong>{r.type}</strong>
                <small className="leading-[1.6] block">
                  {r.id} · {r.horizon} minutes
                </small>
              </span>
              <Badge>{r.status}</Badge>
            </Link>
          ))
        ) : (
          <Empty
            title="No runs yet"
            text="Choose a supported preset to explore a mock result."
          />
        )}
      </section>
    </>
  );
}
