import { useApp } from "@/app/providers/AppContext";
import { ApiLoadError } from "@/shared/api/ApiFeedback";
import { VehicleTable } from "@/features/fleet/components/VehicleTable";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";
import {
  Alert,
  Badge,
  Button,
  Empty,
  Link,
  PageTitle,
  SectionHead,
} from "@/shared/ui";
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
      className="inline-flex items-center gap-2 text-xs text-content-muted mb-5"
      to={`/${s.role}/hubs`}
    >
      <Icon name="arrow-left" size={16} /> All hubs
    </Link>
  );
  if (result.status === "loading")
    return (
      <>
        {back}
        <p role="status">Loading hub…</p>
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
        <div
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-4"
        >
          <span className="text-xs text-content-muted">Physical occupancy</span>
          <strong className="text-lg leading-[1.4] block tracking-[-1px] mt-3 mb-1 max-[600px]:text-lg max-[600px]:tracking-[-0.5px] mx-0">
            {h.occupied} / {h.capacity}
          </strong>
          <small className="leading-[1.6] block max-[600px]:text-xs">
            Includes charging spaces
          </small>
        </div>
        <div
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-4"
        >
          <span className="text-xs text-content-muted">
            Available shared vehicles
          </span>
          <strong className="text-lg leading-[1.4] block tracking-[-1px] mt-3 mb-1 max-[600px]:text-lg max-[600px]:tracking-[-0.5px] mx-0">
            {h.availableVehicles}
          </strong>
          <small className="leading-[1.6] block max-[600px]:text-xs">
            {!student
              ? "Reported available by fleet status"
              : "Ready for an immediate hold"}
          </small>
        </div>
        <div
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-4"
        >
          <span className="text-xs text-content-muted">
            Charging points available
          </span>
          <strong className="text-lg leading-[1.4] block tracking-[-1px] mt-3 mb-1 max-[600px]:text-lg max-[600px]:tracking-[-0.5px] mx-0">
            {h.availablePoints} / {h.points.length}
          </strong>
          <small className="leading-[1.6] block max-[600px]:text-xs">
            {"Based on current point status"}
          </small>
        </div>
        <div
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-4"
        >
          <span className="text-xs text-content-muted">
            Dispatch commitments
          </span>
          <strong className="text-lg leading-[1.4] block tracking-[-1px] mt-3 mb-1 max-[600px]:text-lg max-[600px]:tracking-[-0.5px] mx-0">
            {commitments ?? "—"}
          </strong>
          <small className="leading-[1.6] block max-[600px]:text-xs">
            {commitments === undefined
              ? "Operator access only"
              : "Separate from physical occupancy"}
          </small>
        </div>
      </div>

      <div
        data-slot="panel"
        className="mt-5 bg-panel rounded-sm min-w-0 max-[600px]:mt-5 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
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
                className="rounded-xs text-content-muted text-center bg-surface-muted data-[occupied=true]:bg-soft [&_svg]:mt-0 [&_svg]:mb-2 p-3 [&_svg]:mx-auto"
              >
                <Icon name={"bike"} />
                <strong className="text-sm">
                  {String(i + 1).padStart(2, "0")}
                </strong>
                <small className="leading-[1.6] block text-xs">
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
      </div>
      <div
        data-slot="two-col"
        className="mt-5 grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 max-[900px]:gap-4 max-[600px]:mt-5 max-[600px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1"
      >
        <section
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
        >
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
        </section>
        <section
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
        >
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
        </section>
      </div>
    </>
  );
}
