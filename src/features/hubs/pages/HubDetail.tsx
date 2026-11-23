import {
  LoadingState,
  Panel,
  Alert,
  Badge,
  Button,
  Empty,
  Link,
  PageTitle,
  SectionHead,
} from "@/shared/ui";
import { useApp } from "@/app/providers/AppContext";
import { ApiLoadError } from "@/shared/api/ApiFeedback";
import { VehicleTable } from "@/features/fleet/components/VehicleTable";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";

import { useLiveHub } from "../hooks/useLiveHub";
type HubDetailProps = {
  id: string;
};
export function HubDetail({ id }: HubDetailProps) {
  const { s, go } = useApp();
  const { result, retry, refreshError, retryOperations } = useLiveHub(id);
  const student = s.role === "student";
  const back = (
    <Link
      className="inline-flex items-center gap-2 text-sm text-content-muted mb-5"
      to={`/${s.role}/hubs`}
    >
      <Icon name="arrow-left" size={16} /> All hubs
    </Link>
  );
  if (result.status === "loading")
    return (
      <>
        {back}
        <LoadingState label={"Loading hub…"} />
      </>
    );
  if (result.status === "error")
    return (
      <>
        {back}
        {result.code === 404 ? (
          <Empty
            title="Hub not found"
            text="This address does not match a campus hub."
          />
        ) : (
          <ApiLoadError message={result.message} retry={retry} />
        )}
      </>
    );
  const data = result.data;
  const h = data.hub;
  const commitments = data.commitments;
  const alerts = data.alerts;
  return (
    <>
      {back}
      {refreshError && retryOperations && (
        <ApiLoadError message={refreshError.message} retry={retryOperations} />
      )}
      <PageTitle
        title={h.name}
        description={`${h.area} · Updated ${time(data?.clock ?? s.clock)}`}
        action={
          student ? (
            <Button
              onClick={() =>
                go(`/student/find-ride?${new URLSearchParams({ origin: id })}`)
              }
            >
              Find a ride <Icon name="arrow" />
            </Button>
          ) : (
            <Badge>{h.parkingAvailable === 0 ? "Full" : "Available"}</Badge>
          )
        }
      />
      <div className="grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[600px]:gap-2">
        <Panel data-slot="panel" className="min-w-0">
          <span className="text-sm text-content-muted">Physical occupancy</span>
          <strong className="metric-value">
            {h.occupied} / {h.capacity}
          </strong>
          <small className="leading-[1.6] block max-[600px]:text-sm">
            Includes charging spaces
          </small>
        </Panel>
        <Panel data-slot="panel" className="min-w-0">
          <span className="text-sm text-content-muted">
            Available shared vehicles
          </span>
          <strong className="metric-value">{h.availableVehicles}</strong>
          <small className="leading-[1.6] block max-[600px]:text-sm">
            {!student
              ? "Reported available by fleet status"
              : "Ready for an immediate hold"}
          </small>
        </Panel>
        <Panel data-slot="panel" className="min-w-0">
          <span className="text-sm text-content-muted">
            Charging points available
          </span>
          <strong className="metric-value">
            {h.availablePoints} / {h.points.length}
          </strong>
          <small className="leading-[1.6] block max-[600px]:text-sm">
            {"Based on current point status"}
          </small>
        </Panel>
        <Panel data-slot="panel" className="min-w-0">
          <span className="text-sm text-content-muted">
            Dispatch commitments
          </span>
          <strong className="metric-value">{commitments ?? "—"}</strong>
          <small className="leading-[1.6] block max-[600px]:text-sm">
            {commitments === undefined
              ? "Operator access only"
              : "Separate from physical occupancy"}
          </small>
        </Panel>
      </div>

      <Panel data-slot="panel" className="mt-5 min-w-0 max-[600px]:mt-5">
        <SectionHead
          title={student ? "Shared vehicles" : "Parking spaces"}
          subtitle={
            student
              ? "Immediate holds only. Your intended destination does not reserve a return space."
              : "Illustrated using the hub’s total capacity and occupancy."
          }
        />
        {!student && (
          <div className="grid grid-cols-6 gap-3 mb-5 max-[600px]:grid-cols-3 max-[600px]:gap-2">
            {Array.from({ length: h.capacity }, (_, i) => (
              <div
                key={i}
                data-occupied={i < h.occupied}
                className="rounded-lg text-content-muted text-center bg-surface-muted data-[occupied=true]:bg-soft data-[occupied=true]:text-primary [&_small]:text-inherit [&_svg]:mt-0 [&_svg]:mb-2 p-3 [&_svg]:mx-auto"
              >
                <Icon name={"bike"} />
                <strong className="text-sm">
                  {String(i + 1).padStart(2, "0")}
                </strong>
                <small className="leading-[1.6] block text-sm">
                  {i < h.occupied ? "Occupied" : "Free"}
                  {""}
                </small>
              </div>
            ))}
          </div>
        )}
        <VehicleTable
          hub={id}
          live={data ? { hubName: h.name, vehicles: data.vehicles } : undefined}
        />
      </Panel>
      <div
        data-slot="two-col"
        className="mt-5 grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 max-[900px]:gap-4 max-[600px]:mt-5 max-[900px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1"
      >
        <Panel data-slot="panel" className="min-w-0">
          <SectionHead title="Charging points" />
          {!h.points.length && (
            <Empty
              title="No charging points"
              text="This hub has no charging points."
            />
          )}
          {h.points.map((point) => (
            <div
              className="flex justify-between items-center gap-3 border-b border-solid border-b-divider text-sm last:border-b-0 last:border-solid [&_>_span:first-child_>_svg]:inline [&_>_span:first-child_>_svg]:align-middle [&_>_span:first-child_>_svg]:mr-2 [&_small]:block max-[600px]:items-start max-[600px]:*:data-[slot~=badge]:whitespace-normal max-[600px]:*:data-[slot~=badge]:text-right max-[600px]:*:data-[slot~=badge]:justify-end py-4 px-0"
              key={point.id}
            >
              <span className="wrap-anywhere">
                <Icon name="bolt" /> Point {point.id}
              </span>
              <Badge>{point.status}</Badge>
            </div>
          ))}
        </Panel>
        <Panel data-slot="panel" className="min-w-0">
          <SectionHead
            title={
              student ? "Parking for your vehicle" : "Relevant parking bookings"
            }
          />
          {student ? (
            <>
              <p className="leading-[1.65] mt-3 mb-5 mx-0">
                {h.parkingAvailable} spaces available now. Interval availability
                is reviewed when you book.
              </p>
              <Button
                variant="secondary"
                onClick={() => go("/student/parking/new")}
              >
                Book parking
              </Button>
            </>
          ) : (
            <Empty
              title="Booking details unavailable"
              text="The live Hub view provides aggregate parking availability."
            />
          )}
          {alerts.map((incident) => (
            <Alert key={incident.id} tone="error">
              <span className="wrap-anywhere">{incident.description}</span>
            </Alert>
          ))}
        </Panel>
      </div>
    </>
  );
}
