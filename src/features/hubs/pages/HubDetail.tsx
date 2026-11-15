import { Missing } from "@/app/pages/Missing";
import { useApp } from "@/app/providers/AppContext";
import { config } from "@/config/app";
import {
  available,
  freeSpaces,
  occupancy,
  pointFree,
  pointId,
} from "@/domain/selectors";
import { VehicleTable } from "@/features/fleet/components/VehicleTable";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";
import {
  Alert,
  Badge,
  Button,
  Link,
  PageTitle,
  SectionHead,
} from "@/shared/ui";

type HubDetailProps = { id: string };

export function HubDetail({ id }: HubDetailProps) {
  const { s, go } = useApp();

  const h = s.hubs.find((h) => h.id === id)!;

  const student = s.role === "student";

  const commitments = s.dispatches
    .filter(
      (d) =>
        d.destination === id &&
        ["planned", "in-transit", "failed"].includes(d.status),
    )
    .reduce((n, d) => n + d.vehicles.length, 0);

  if (!h) return <Missing />;

  return (
    <>
      <Link
        className="inline-flex items-center gap-2 text-xs text-content-muted mb-5"
        to={`/${s.role}/hubs`}
      >
        <Icon name="arrow-left" size={16} /> All hubs
      </Link>
      <PageTitle
        title={h.name}
        description={`${h.area} · Updated ${time(s.clock)}`}
        action={
          student ? (
            <Button onClick={() => go(`/student/find-ride?origin=${id}`)}>
              Find a ride <Icon name="arrow" />
            </Button>
          ) : (
            <Badge>{freeSpaces(s, id) === 0 ? "Full" : "Available"}</Badge>
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
            {occupancy(s, id)} / {h.capacity}
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
            {available(s, id).length}
          </strong>
          <small className="leading-[1.6] block max-[600px]:text-xs">
            Ready for an immediate hold
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
            {pointFree(s, id)} / {h.points}
          </strong>
          <small className="leading-[1.6] block max-[600px]:text-xs">
            {h.points * config.pointPowerKW} kW fixture hub limit
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
            {commitments}
          </strong>
          <small className="leading-[1.6] block max-[600px]:text-xs">
            Separate from physical occupancy
          </small>
        </div>
      </div>
      {s.preset === "stale" && (
        <Alert tone="error">
          Stale resource data · Check the listed battery freshness.
          Zero-capacity hubs cannot accept returns.
        </Alert>
      )}
      <div
        data-slot="panel"
        className="mt-5 bg-panel rounded-sm min-w-0 max-[600px]:mt-5 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <SectionHead
          title={student ? "Shared vehicles" : "Parking spaces"}
          subtitle={
            student
              ? "Immediate holds only. Your intended destination does not reserve a return space."
              : "Filled spaces include shared vehicles and checked-in private vehicles."
          }
        />
        {!student && (
          <div className="grid grid-cols-6 gap-3 mb-5 max-[600px]:grid-cols-3 max-[600px]:gap-2">
            {Array.from({ length: h.capacity }, (_, i) => (
              <div
                key={i}
                data-occupied={i < occupancy(s, id)}
                className="rounded-xs text-content-muted text-center bg-surface-muted data-[occupied=true]:bg-soft [&_svg]:mt-0 [&_svg]:mb-2 p-3 [&_svg]:mx-auto"
              >
                <Icon name={i < h.points ? "bolt" : "bike"} />
                <strong className="text-sm">
                  {String(i + 1).padStart(2, "0")}
                </strong>
                <small className="leading-[1.6] block text-xs">
                  {i < occupancy(s, id) ? "Occupied" : "Free"}
                  {i < h.points ? " · Charge" : ""}
                </small>
              </div>
            ))}
          </div>
        )}
        <VehicleTable hub={id} />
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
          {Array.from({ length: h.points }, (_, i) => (
            <div
              className="flex justify-between items-center gap-3 border-b border-solid border-b-divider text-sm last:border-b-0 last:border-solid [&_>_span:first-child_>_svg]:inline [&_>_span:first-child_>_svg]:align-middle [&_>_span:first-child_>_svg]:mr-2 [&_small]:block max-[600px]:items-start max-[600px]:*:data-[slot~=badge]:whitespace-normal max-[600px]:*:data-[slot~=badge]:text-right max-[600px]:*:data-[slot~=badge]:justify-end py-4 px-0"
              key={i}
            >
              <span>
                <Icon name="bolt" /> Point {pointId(id, i)}
              </span>
              <Badge>
                {i < pointFree(s, id) ? "Available" : "Occupied / unavailable"}
              </Badge>
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
                {freeSpaces(s, id)} spaces available now. Interval availability
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
            s.bookings
              .filter((b) => b.hub === id)
              .map((b) => (
                <div
                  key={b.id}
                  className="flex justify-between items-center gap-3 border-b border-solid border-b-divider text-sm last:border-b-0 last:border-solid [&_>_span:first-child_>_svg]:inline [&_>_span:first-child_>_svg]:align-middle [&_>_span:first-child_>_svg]:mr-2 max-[600px]:items-start max-[600px]:*:data-[slot~=badge]:whitespace-normal max-[600px]:*:data-[slot~=badge]:text-right max-[600px]:*:data-[slot~=badge]:justify-end py-4 px-0"
                >
                  <span>
                    {b.id} · {b.vehicle}
                    <small className="leading-[1.6] block">
                      {time(b.start)}–{time(b.end)}
                    </small>
                  </span>
                  <Badge>{b.status}</Badge>
                </div>
              ))
          )}
          {s.incidents
            .filter((i) => i.resource.includes(h.name) && i.status === "open")
            .map((i) => (
              <Alert key={i.id} tone="error">
                {i.description}
              </Alert>
            ))}
        </section>
      </div>
    </>
  );
}
