import { Panel, Select, Input, Alert, Button, Field } from "@/shared/ui";
import { Icon } from "@/shared/components/Icon";

import { simulationTypes } from "@/integration/operatorRecords";
import { scenarioKinds, type WhatIfModel } from "../hooks/useWhatIf";

const amountLabels = {
  RENTAL_DEMAND_SURGE: "Additional rental requests",
  PARKING_CAPACITY: "Additional parking arrivals",
  CHARGING_DEMAND_SURGE: "Additional charging requests",
  FLEET_IMBALANCE: "Number of rental vehicles",
};
type ScenarioFormProps = Pick<
  WhatIfModel,
  | "runScenario"
  | "type"
  | "setType"
  | "hub"
  | "setHub"
  | "horizon"
  | "setHorizon"
  | "amount"
  | "setAmount"
  | "direction"
  | "changeDirection"
  | "error"
  | "busy"
  | "liveHubs"
  | "points"
  | "point"
  | "setPoint"
  | "valid"
>;
export function ScenarioForm({
  runScenario,
  type,
  setType,
  hub,
  setHub,
  horizon,
  setHorizon,
  amount,
  setAmount,
  direction,
  changeDirection,
  error,
  busy,
  liveHubs,
  points,
  point,
  setPoint,
  valid,
}: ScenarioFormProps) {
  return (
    <Panel data-slot="panel" className="min-w-0 max-w-2xl">
      <form onSubmit={runScenario}>
        <Field label="Scenario category">
          <Select
            className="border-divider bg-surface-inset shadow-none hover:bg-surface-muted"
            value={type}
            onValueChange={(value) => setType(value)}
            wrapperClassName="max-w-full cursor-pointer"
          >
            {scenarioKinds.map((kind) => (
              <option key={kind} value={kind}>
                {simulationTypes[kind].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Affected hub">
          <Select
            className="border-divider bg-surface-inset shadow-none hover:bg-surface-muted"
            required
            value={hub}
            onValueChange={(value) => setHub(value)}
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
          </Select>
        </Field>
        <Field label="Horizon (minutes)">
          {
            <Input
              className="border-divider bg-surface-inset shadow-none focus-visible:bg-panel"
              type="number"
              required
              min="1"
              max="240"
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
            />
          }
        </Field>
        {type === "FLEET_IMBALANCE" && (
          <Field label="Fleet condition">
            <Select
              className="border-divider bg-surface-inset shadow-none hover:bg-surface-muted"
              value={direction}
              onValueChange={changeDirection}
            >
              <option value="SHORTAGE">Shortage</option>
              <option value="CONCENTRATION">Excessive concentration</option>
            </Select>
          </Field>
        )}
        {type === "CHARGER_FAULT" ? (
          <Field label="Charging point">
            <Select
              className="border-divider bg-surface-inset shadow-none hover:bg-surface-muted"
              required
              value={point}
              onValueChange={(value) => setPoint(value)}
            >
              <option value="">Choose a working point</option>
              {point && !points.some((item) => item.resource_id === point) && (
                <option value={point} disabled>
                  {point} · unavailable
                </option>
              )}
              {points.map((item) => (
                <option key={item.resource_id} value={item.resource_id}>
                  {item.resource_id}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <Field label={amountLabels[type]}>
            <Input
              className="border-divider bg-surface-inset shadow-none focus-visible:bg-panel"
              type="number"
              min="1"
              max="1000"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
        )}
        {!liveHubs.length && (
          <Alert>No eligible hub is available for this scenario.</Alert>
        )}
        {error && <Alert tone="error">{error}</Alert>}
        <Button
          className="max-[600px]:w-full"
          disabled={busy || !valid}
          type="submit"
        >
          {busy ? "Running…" : "Run"}
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
  );
}
