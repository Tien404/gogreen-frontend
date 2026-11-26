import { parkingLabel, vehicleLabel } from "@/integration/recordLabels";
import { Panel, Alert, Button, Confirm, Link, SectionHead } from "@/shared/ui";
import { useApp } from "@/app/providers/AppContext";
import { useRefreshStudentData } from "@/integration/studentRefresh";
import { recordUrl } from "@/integration/studentRecords";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";

import type { ChargingModel } from "../hooks/useCharging";
type ChargingSessionDetailsProps = Pick<ChargingModel, "c" | "canAct" | "s">;
export function ChargingSessionDetails({
  c,
  canAct,
  s,
}: ChargingSessionDetailsProps) {
  const { api, refreshOperations, notify } = useApp();
  const refresh = useRefreshStudentData();
  const command = useApiAction();
  async function update(action: "cancel" | "stop" | "start") {
    const params = { session_id: c.id };
    const result = await command.run(() => {
      if (action === "start")
        return api.request("POST /charging/sessions/{session_id}/start", {
          params,
        });
      return action === "cancel"
        ? api.request("POST /charging/sessions/{session_id}/cancel", {
            params,
          })
        : api.request("POST /charging/sessions/{session_id}/stop", {
            params,
          });
    });
    if (result.ok) {
      if (action === "start") notify("Charging session started.", "success");
      else if (action === "stop") notify("Charging session stopped.", "info");
      else if (action === "cancel")
        notify("Charging session cancelled.", "info");
    }
    refresh?.();
    refreshOperations?.();
  }
  const student = s.role === "student";
  return (
    <div
      data-slot="two-col"
      className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 [&_>_[data-slot~=panel]_>_p]:mt-3 [&_>_[data-slot~=panel]_>_p]:mb-5 max-[900px]:gap-4 max-[900px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1 [&_>_[data-slot~=panel]_>_p]:mx-0"
    >
      <Panel data-slot="panel" className="min-w-0">
        <SectionHead title="Battery progress" />
        {!student && (
          <ol
            aria-label="Charging progress"
            className="mb-4 grid grid-cols-3 gap-2"
          >
            {[
              {
                label: "1. Requested",
                done: ["scheduled", "active", "completed"].includes(c.status),
                current: c.status === "pending",
              },
              {
                label: "2. Scheduled",
                done: ["active", "completed"].includes(c.status),
                current: c.status === "scheduled",
              },
              {
                label: "3. Charging",
                done: c.status === "completed",
                current: c.status === "active",
              },
            ].map((step) => (
              <li key={step.label} className="min-w-0">
                <div
                  className={
                    step.done
                      ? "h-1.5 rounded-full bg-primary"
                      : step.current
                        ? "h-1.5 rounded-full bg-primary/70"
                        : "h-1.5 rounded-full bg-surface-inset"
                  }
                />
                <span
                  className={
                    step.done || step.current
                      ? "mt-1.5 block truncate text-xs font-semibold text-primary"
                      : "mt-1.5 block truncate text-xs text-content-muted"
                  }
                >
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        )}
        <div className="my-3 text-4xl leading-none font-semibold tracking-tight text-primary tabular-nums">
          {c.battery ?? "—"}
          {c.battery !== null && <span className="text-4xl">%</span>}
        </div>
        {c.battery !== null && (
          <progress
            aria-label="Battery percentage"
            max="100"
            value={c.battery}
            className="h-3 w-full border-0 border-solid rounded-full overflow-hidden bg-surface-inset [&::-webkit-progress-bar]:bg-surface-inset [&::-webkit-progress-value]:bg-brand [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:bg-brand"
          />
        )}
        <div className="flex justify-between items-center gap-3 border-b border-solid border-b-divider text-sm last:border-b-0 last:border-solid [&_>_span:first-child_>_svg]:inline [&_>_span:first-child_>_svg]:align-middle [&_>_span:first-child_>_svg]:mr-2 [&_small]:block max-[600px]:items-start max-[600px]:*:data-[slot~=badge]:whitespace-normal max-[600px]:*:data-[slot~=badge]:text-right max-[600px]:*:data-[slot~=badge]:justify-end py-4 px-0">
          <span>Target: {c.target}%</span>
          <span>
            {c.battery === null
              ? "Battery reading unavailable"
              : `${Math.max(0, c.target - c.battery)}% remaining`}
          </span>
        </div>
        {(!student ||
          (c.reason &&
            ["pending", "interrupted", "stopped"].includes(c.status))) && (
          <Alert
            tone={
              ["interrupted", "stopped"].includes(c.status) ? "error" : "info"
            }
          >
            <span className="min-w-0 wrap-anywhere">
              {c.reason || "No allocation note."}
            </span>
          </Alert>
        )}
        <dl className="record-details">
          <dt>Vehicle</dt>
          <dd>{vehicleLabel(s, c.vehicle)}</dd>
          <dt>Hub</dt>
          <dd>
            {s.hubs.find((hub) => hub.id === c.hub)?.name ?? "Unknown hub"}
          </dd>
          <dt className="text-content-muted">Charging point</dt>
          <dd className="wrap-anywhere m-0">{c.point ?? "Not assigned"}</dd>
          {!student && (
            <>
              <dt className="text-content-muted">Queue</dt>
              <dd className="wrap-anywhere m-0">
                {c.status === "pending" ? "Awaiting allocation" : "Not waiting"}
              </dd>
            </>
          )}
          {(!student ||
            (c.schedule && c.schedule !== "No assigned schedule")) && (
            <>
              <dt className="text-content-muted">Schedule</dt>
              <dd className="wrap-anywhere m-0">{c.schedule}</dd>
            </>
          )}
          <dt className="text-content-muted">Parking context</dt>
          <dd className="wrap-anywhere m-0">
            {c.booking && s.role === "operator" ? (
              "Private vehicle parking"
            ) : c.booking ? (
              <Link to={recordUrl("parking", c.booking)}>
                {s.bookings.find((b) => b.id === c.booking)
                  ? parkingLabel(
                      s,
                      s.bookings.find((b) => b.id === c.booking)!,
                    )
                  : "View parking booking"}
              </Link>
            ) : (
              "Shared fleet parking"
            )}
          </dd>
        </dl>
        {command.error != null && (
          <Alert tone="error">{apiErrorMessage(command.error)}</Alert>
        )}
        {canAct && (
          <div className="flex items-center flex-wrap gap-3 mt-5 max-[600px]:flex-nowrap max-[600px]:*:data-[slot~=button]:flex-1 max-[600px]:*:data-[slot~=button]:min-w-0">
            {s.role === "operator" && c.status === "scheduled" && (
              <Confirm
                title="Start charging this vehicle?"
                description="The server checks the charging window, parking and point before starting."
                trigger={<Button disabled={command.busy}>Start</Button>}
                onConfirm={() => update("start")}
              />
            )}
            {["pending", "scheduled"].includes(c.status) && (
              <Confirm
                title="Cancel this charging request?"
                description="This cancels charging only. The parking booking remains unchanged."
                trigger={
                  <Button variant="secondary" disabled={command.busy}>
                    Cancel
                  </Button>
                }
                onConfirm={() => update("cancel")}
              />
            )}{" "}
            {c.status === "active" && (
              <Confirm
                title="Stop charging this vehicle?"
                description={
                  c.battery === null
                    ? "Parking stays occupied."
                    : `The battery is ${c.battery}% of a ${c.target}% target. Parking stays occupied.`
                }
                trigger={
                  <Button variant="danger" disabled={command.busy}>
                    Stop
                  </Button>
                }
                onConfirm={() => update("stop")}
              />
            )}
          </div>
        )}
      </Panel>
      {!student && (
        <Panel data-slot="panel" className="min-w-0">
          <SectionHead title="Session timeline" />
          <ol className="list-none [&_li:before]:content-[''] [&_li:before]:absolute [&_li:before]:-left-1.25 [&_li:before]:top-1.75 [&_li:before]:w-2.25 [&_li:before]:h-2.25 [&_li:before]:bg-primary [&_li:before]:rounded-full data-[compact=true]:mt-5 [&[data-compact=true]_li]:pb-3 m-0 p-0">
            <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 text-sm">
              Request received
            </li>
            <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 text-sm">
              Allocation {c.point ? "confirmed" : "pending"}
              <small className="leading-[1.6] block mt-1">
                {c.schedule ?? c.point ?? "No confirmed time slot"}
              </small>
            </li>
            <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 text-sm">
              Current state: {c.status}
              <small className="leading-[1.6] block mt-1"></small>
            </li>
          </ol>
        </Panel>
      )}
    </div>
  );
}
