import { scenarioFixtures, scenarioTypes } from "@/mocks/scenarios";
import { Icon } from "@/shared/components/Icon";
import { Alert, Button, Field } from "@/shared/ui";
import type { WhatIfModel } from "../hooks/useWhatIf";

type ScenarioFormProps = Pick<
  WhatIfModel,
  | "runScenario"
  | "s"
  | "type"
  | "setType"
  | "hub"
  | "setHub"
  | "horizon"
  | "setHorizon"
  | "demand"
  | "setDemand"
  | "error"
  | "busy"
>;

export function ScenarioForm({
  s,
  runScenario,
  type,
  setType,
  hub,
  setHub,
  horizon,
  setHorizon,
  demand,
  setDemand,
  error,
  busy,
}: ScenarioFormProps) {
  return (
    <div
      data-slot="two-col"
      className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 max-[900px]:gap-4 max-[600px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1"
    >
      <section
        data-slot="panel"
        className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <form onSubmit={runScenario}>
          <Field label="Scenario category">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setHub(scenarioFixtures[e.target.value].hub);
              }}
              className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
            >
              {scenarioTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Affected hub">
            <select
              value={hub}
              onChange={(e) => setHub(e.target.value)}
              className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
            >
              <option value={scenarioFixtures[type].hub}>
                {
                  s.hubs.find((hub) => hub.id === scenarioFixtures[type].hub)
                    ?.name
                }{" "}
                · supported fixture
              </option>
            </select>
          </Field>
          <Field label="Horizon">
            <select
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
              className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
            >
              <option value="60">60 minutes · supported fixture</option>
            </select>
          </Field>
          <Field label="Demand / fault preset">
            <select
              value={demand}
              onChange={(e) => setDemand(e.target.value)}
              className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
            >
              <option value="standard">Standard supported preset</option>
              <option value="custom">
                Custom configuration · no result fixture
              </option>
            </select>
          </Field>
          {error && <Alert tone="error">{error}</Alert>}
          <Button disabled={busy} type="submit">
            {busy ? "Loading mock result…" : "Run mock scenario"}
            <Icon name="flask" />
          </Button>
          {busy && (
            <div
              className="bg-linear-to-r from-surface-muted via-soft to-surface-muted rounded-xs mt-5 text-xs text-content-muted animate-pulse p-5"
              role="status"
            >
              Loading bundled scenario fixture…
            </div>
          )}
        </form>
      </section>
      <section
        data-slot="panel"
        className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <div
          data-slot="icon-box"
          className="inline-flex items-center justify-center bg-soft text-accent w-11 h-11 rounded-xs shrink-0"
        >
          <Icon name="flask" size={32} />
        </div>
        <h2 className="leading-[1.4]">A safe space to explore.</h2>
        <p className="leading-[1.65] mt-3 mb-5 mx-0">
          View a separate result snapshot before deciding whether to apply a
          recommendation.
        </p>
        <Alert>
          Running a scenario never changes hub occupancy, charging or vehicle
          state. Applying a recommendation requires a separate confirmation.
        </Alert>
        <p className="leading-[1.65] text-content-muted mt-3 mb-5 mx-0">
          All inputs, outcomes and recommendations are fictional.
        </p>
      </section>
    </div>
  );
}
