import { Panel, NativeSelect, Input, Alert, Button, Field } from "@/shared/ui";
import { Icon } from "@/shared/components/Icon";

import type { WhatIfModel } from "../hooks/useWhatIf";
type ScenarioFormProps = Pick<
  WhatIfModel,
  | "runScenario"
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
  | "types"
  | "liveHubs"
  | "points"
  | "point"
  | "setPoint"
  | "valid"
  | "fault"
>;
export function ScenarioForm({
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
  types,
  liveHubs,
  points,
  point,
  setPoint,
  valid,
  fault,
}: ScenarioFormProps) {
  return (
    <div
      data-slot="two-col"
      className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 max-[900px]:gap-4 max-[900px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1"
    >
      <Panel data-slot="panel" className="min-w-0">
        <form onSubmit={runScenario}>
          <Field label="Scenario category">
            <NativeSelect
              value={type}
              onChange={(e) => setType(e.target.value)}
              wrapperClassName="max-w-full cursor-pointer"
            >
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Affected hub">
            <NativeSelect
              value={hub}
              onChange={(e) => setHub(e.target.value)}
              wrapperClassName="max-w-full cursor-pointer"
            >
              {
                <>
                  <option value="">Choose a hub</option>
                  {liveHubs.map((item) => (
                    <option key={item.hub_id} value={item.hub_id}>
                      {item.name}
                    </option>
                  ))}
                </>
              }
            </NativeSelect>
          </Field>
          <Field label="Horizon (minutes)">
            {
              <Input
                type="number"
                required
                min="1"
                max="240"
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
              />
            }
          </Field>
          {fault ? (
            <Field label="Charging point">
              <NativeSelect
                required
                value={point}
                onChange={(e) => setPoint(e.target.value)}
                wrapperClassName=""
              >
                <option value="">Choose a working point</option>
                {point &&
                  !points.some((item) => item.resource_id === point) && (
                    <option value={point} disabled>
                      {point} · unavailable
                    </option>
                  )}
                {points.map((item) => (
                  <option key={item.resource_id} value={item.resource_id}>
                    {item.resource_id}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          ) : (
            <Field label="Additional rental requests">
              <Input
                type="number"
                min="1"
                max="1000"
                required
                value={demand}
                onChange={(e) => setDemand(e.target.value)}
              />
            </Field>
          )}
          {!liveHubs.length && (
            <Alert>No eligible hub is available for this scenario.</Alert>
          )}
          {error && <Alert tone="error">{error}</Alert>}
          <Button disabled={busy || !valid} type="submit">
            {busy ? "Running…" : "Run simulation"}
            <Icon name="flask" />
          </Button>
          {busy && (
            <div
              className="bg-green-muted text-green-ink rounded-lg mt-5 text-sm animate-pulse p-5"
              role="status"
            >
              {"Running from an operational snapshot…"}
            </div>
          )}
        </form>
      </Panel>
      <Panel data-slot="panel" className="min-w-0">
        <div
          data-slot="icon-box"
          className="inline-flex items-center justify-center bg-green-muted text-green-ink w-11 h-11 rounded-lg shrink-0"
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
      </Panel>
    </div>
  );
}
