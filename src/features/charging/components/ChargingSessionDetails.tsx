import { time } from "@/shared/lib/time";
import { Alert, Button, Confirm, Link, SectionHead } from "@/shared/ui";
import type { ChargingModel } from "../hooks/useCharging";

type ChargingSessionDetailsProps = Pick<
  ChargingModel,
  "c" | "canAct" | "act" | "s"
>;

export function ChargingSessionDetails({
  c,
  canAct,
  act,
  s,
}: ChargingSessionDetailsProps) {
  return (
    <div
      data-slot="two-col"
      className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 [&_>_[data-slot~=panel]_>_p]:mt-3 [&_>_[data-slot~=panel]_>_p]:mb-5 max-[900px]:gap-4 max-[600px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1 [&_>_[data-slot~=panel]_>_p]:mx-0"
    >
      <section
        data-slot="panel"
        className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <SectionHead title="Battery progress" />
        <div className="text-lg leading-[1.3] tracking-[-3px] text-accent max-[600px]:text-lg my-5 mx-0">
          {c.battery}
          <span className="text-lg">%</span>
        </div>
        <progress
          aria-label="Battery percentage"
          max="100"
          value={c.battery}
          className="h-3 w-full border-0 border-solid rounded-lg overflow-hidden bg-surface-inset [&::-webkit-progress-bar]:bg-surface-inset [&::-webkit-progress-value]:bg-brand [&::-webkit-progress-value]:rounded-lg [&::-moz-progress-bar]:bg-brand"
        />
        <div className="flex justify-between items-center gap-3 border-b border-solid border-b-divider text-sm last:border-b-0 last:border-solid [&_>_span:first-child_>_svg]:inline [&_>_span:first-child_>_svg]:align-middle [&_>_span:first-child_>_svg]:mr-2 [&_small]:block max-[600px]:items-start max-[600px]:*:data-[slot~=badge]:whitespace-normal max-[600px]:*:data-[slot~=badge]:text-right max-[600px]:*:data-[slot~=badge]:justify-end py-4 px-0">
          <span>Target: {c.target}%</span>
          <span>{Math.max(0, c.target - c.battery)}% remaining</span>
        </div>
        <Alert
          tone={
            ["interrupted", "stopped"].includes(c.status) ? "error" : "info"
          }
        >
          {c.reason}
        </Alert>
        <dl className="grid grid-cols-[minmax(100px,0.8fr)_1.2fr] gap-4 text-sm **:data-[slot~=badge]:align-top my-5 mx-0">
          <dt className="text-content-muted">Charging point</dt>
          <dd className="wrap-anywhere m-0">{c.point ?? "Not assigned"}</dd>
          <dt className="text-content-muted">Queue</dt>
          <dd className="wrap-anywhere m-0">
            {c.status === "pending"
              ? "1 · Awaiting fixture allocation"
              : "Not waiting"}
          </dd>
          <dt className="text-content-muted">Parking context</dt>
          <dd className="wrap-anywhere m-0">
            {c.booking ? (
              <Link to={`/student/parking/${c.booking}`}>{c.booking}</Link>
            ) : (
              "Shared fleet parking"
            )}
          </dd>
        </dl>
        {canAct && (
          <div className="flex items-center flex-wrap gap-3 mt-5 *:data-[slot~=button]:shrink-0">
            {["pending", "scheduled"].includes(c.status) && (
              <Confirm
                title={`Cancel ${c.id}?`}
                description="This cancels charging only. The parking booking remains unchanged."
                trigger={<Button variant="secondary">Cancel request</Button>}
                onConfirm={() => act({ type: "cancel-charge", id: c.id })}
              />
            )}{" "}
            {c.status === "active" && (
              <Confirm
                title={`Stop ${c.id}?`}
                description={`The battery is ${c.battery}% of a ${c.target}% target. Parking stays occupied.`}
                trigger={<Button variant="danger">Stop charging</Button>}
                onConfirm={() => act({ type: "stop-charge", id: c.id })}
              />
            )}
          </div>
        )}
      </section>
      <section
        data-slot="panel"
        className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <SectionHead title="Session timeline" />
        <ol className="list-none [&_li:before]:content-[''] [&_li:before]:absolute [&_li:before]:-left-1.25 [&_li:before]:top-1.75 [&_li:before]:w-2.25 [&_li:before]:h-2.25 [&_li:before]:bg-accent [&_li:before]:rounded-full [&_li:last-child]:border-l-transparent data-[compact=true]:mt-5 [&[data-compact=true]_li]:pb-3 m-0 p-0">
          <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 border-l border-solid border-l-divider text-sm">
            Request received{" "}
            <small className="leading-[1.6] block mt-1">{c.vehicle}</small>
          </li>
          <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 border-l border-solid border-l-divider text-sm">
            Allocation {c.point ? "confirmed" : "pending"}
            <small className="leading-[1.6] block mt-1">
              {c.point ?? "No confirmed time slot"}
            </small>
          </li>
          <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 border-l border-solid border-l-divider text-sm">
            Current state: {c.status}
            <small className="leading-[1.6] block mt-1">
              Updated {time(s.clock)}
            </small>
          </li>
        </ol>
        <div
          className="bg-demo-surface rounded-xs mt-5 **:focus-visible:outline-demo [&_>_h3]:text-demo p-5"
          data-demo-scope=""
        >
          <strong className="text-demo">Demo</strong>
          <p className="leading-[1.65] mt-2 mb-4 mx-0">
            Advance this session through its scripted states.
          </p>
          <Button
            variant="secondary"
            disabled={
              !canAct || !["pending", "scheduled", "active"].includes(c.status)
            }
            onClick={() => act({ type: "advance-charge", id: c.id })}
          >
            Advance charging state
          </Button>
        </div>
      </section>
    </div>
  );
}
