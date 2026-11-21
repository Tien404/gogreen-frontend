import { studentDate } from "@/integration/studentData";
import { Alert, Button, Confirm, SectionHead } from "@/shared/ui";
import type { DispatchesModel } from "../hooks/useDispatches";
type DispatchDetailsProps = Pick<
  DispatchesModel,
  "d" | "s" | "error" | "action" | "busy"
>;
export function DispatchDetails({
  d,
  s,
  error,
  action,
  busy,
}: DispatchDetailsProps) {
  const failedBeforeDeparture =
    d.status === "failed" && d.started === undefined;
  return (
    <div
      data-slot="two-col"
      className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 [&_>_[data-slot~=panel]_>_p]:mt-3 [&_>_[data-slot~=panel]_>_p]:mb-5 max-[900px]:gap-4 max-[600px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1 [&_>_[data-slot~=panel]_>_p]:mx-0"
    >
      <section
        data-slot="panel"
        className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <SectionHead title="Movement details" />
        <dl className="grid grid-cols-[minmax(100px,0.8fr)_1.2fr] gap-4 text-sm **:data-[slot~=badge]:align-top my-5 mx-0">
          <dt className="text-content-muted">Shared vehicles</dt>
          <dd className="wrap-anywhere m-0">{d.vehicles.join(", ")}</dd>
          <dt className="text-content-muted">Source hub</dt>
          <dd className="wrap-anywhere m-0">
            {s.hubs.find((h) => h.id === d.source)?.name}
          </dd>
          <dt className="text-content-muted">Destination</dt>
          <dd className="wrap-anywhere m-0">
            {s.hubs.find((h) => h.id === d.destination)?.name}
          </dd>
          <dt className="text-content-muted">Destination commitment</dt>
          <dd className="wrap-anywhere m-0">
            {["completed", "cancelled"].includes(d.status) ||
            failedBeforeDeparture
              ? "Released"
              : `${d.vehicles.length} spaces · separate from occupancy`}
          </dd>
          <dt className="text-content-muted">Physical location</dt>
          <dd className="wrap-anywhere m-0">
            {d.status === "planned" || failedBeforeDeparture
              ? "Still at source"
              : d.status === "completed"
                ? "At destination"
                : d.status === "cancelled"
                  ? "Still at source"
                  : "In transit · belongs to neither hub"}
          </dd>
        </dl>
        {d.reason && (
          <Alert tone={d.status === "failed" ? "error" : "info"}>
            <span className="wrap-anywhere">{d.reason}</span>
          </Alert>
        )}
      </section>
      <section
        data-slot="panel"
        className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <SectionHead title="Dispatch timeline" />
        <ol className="list-none [&_li:before]:content-[''] [&_li:before]:absolute [&_li:before]:-left-1.25 [&_li:before]:top-1.75 [&_li:before]:w-2.25 [&_li:before]:h-2.25 [&_li:before]:bg-accent [&_li:before]:rounded-full [&_li:last-child]:border-l-transparent data-[compact=true]:mt-5 [&[data-compact=true]_li]:pb-3 m-0 p-0">
          <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 border-l border-solid border-l-divider text-sm">
            Planned{" "}
            <small className="leading-[1.6] block mt-1">
              Destination space commitment displayed
            </small>
          </li>
          {d.status !== "planned" && !failedBeforeDeparture && (
            <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 border-l border-solid border-l-divider text-sm">
              {d.status === "cancelled"
                ? "Cancelled before departure"
                : "Departed source"}
              <small className="leading-[1.6] block mt-1">
                {d.started === undefined
                  ? "Source occupancy updated at departure only"
                  : studentDate(d.started)}
              </small>
            </li>
          )}
          {d.status === "completed" && (
            <li className="relative ml-2 pt-0 pr-0 pb-5 pl-5 border-l border-solid border-l-divider text-sm">
              Arrived at destination{" "}
              <small className="leading-[1.6] block mt-1">
                {d.completed === undefined
                  ? "Vehicles placed once"
                  : studentDate(d.completed)}
              </small>
            </li>
          )}
        </ol>
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex items-center flex-wrap gap-3 mt-5 *:data-[slot~=button]:shrink-0">
          {d.status === "planned" && (
            <>
              <Confirm
                title={`Start ${d.id}?`}
                description={`${d.vehicles.length} vehicle(s) leave the source and become in transit.`}
                trigger={<Button disabled={busy}>Start dispatch</Button>}
                onConfirm={() => action("start-dispatch")}
              />
            </>
          )}
          {(d.status === "in-transit" ||
            (d.status === "failed" && !failedBeforeDeparture)) && (
            <Confirm
              title="Confirm arrival?"
              description="Destination capacity is checked before these vehicles are placed."
              trigger={<Button disabled={busy}>Complete dispatch</Button>}
              onConfirm={() => action("complete-dispatch")}
            />
          )}
        </div>
      </section>
    </div>
  );
}
