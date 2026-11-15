import { Missing } from "@/app/pages/Missing";
import { freeSpaces } from "@/domain/selectors";
import { Icon } from "@/shared/components/Icon";
import { VehicleArtwork } from "@/shared/components/MobilityArtwork";
import { time } from "@/shared/lib/time";
import {
  Alert,
  Badge,
  Battery,
  Button,
  Confirm,
  Field,
  Link,
  PageTitle,
  SectionHead,
} from "@/shared/ui";
import { useRideDetail } from "../hooks/useRideDetail";

type RideDetailProps = { id: string };

export function RideDetail({ id }: RideDetailProps) {
  const {
    s,
    r,
    destination,
    setDestination,
    error,
    setError,
    v,
    handleConfirm1,
  } = useRideDetail({ id });

  if (!r) return <Missing />;

  return (
    <>
      <PageTitle
        title={r.status === "active" ? "Enjoy the journey." : "You’ve arrived."}
        description={`${r.id} · ${r.status === "active" ? "Your ride is active" : "Ride completed"}`}
        action={<Badge>{r.status}</Badge>}
      />
      <div
        data-slot="two-col"
        className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 max-[900px]:gap-4 max-[600px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1"
      >
        <section
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
        >
          <div className="h-50 rounded-xs bg-soft grid place-items-center text-accent mb-5 max-[600px]:h-42.5">
            <VehicleArtwork type={v.type} />
          </div>
          <SectionHead
            title={`${r.vehicle} · ${v.type}`}
            action={<Battery value={v.battery} />}
          />
          <dl className="grid grid-cols-[minmax(100px,0.8fr)_1.2fr] gap-4 text-sm **:data-[slot~=badge]:align-top my-5 mx-0">
            <dt className="text-content-muted">Started</dt>
            <dd className="wrap-anywhere m-0">{time(r.start)}</dd>
            <dt className="text-content-muted">Elapsed time</dt>
            <dd className="wrap-anywhere m-0">
              {(r.end ?? s.clock) - r.start} minutes
            </dd>
            <dt className="text-content-muted">Origin</dt>
            <dd className="wrap-anywhere m-0">
              {s.hubs.find((h) => h.id === r.origin)?.name}
            </dd>
            <dt className="text-content-muted">Destination</dt>
            <dd className="wrap-anywhere m-0">
              {s.hubs.find((h) => h.id === r.destination)?.name}
            </dd>
          </dl>
        </section>
        <section
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
        >
          <SectionHead
            title={
              r.status === "active" ? "Ready to return?" : "Return confirmed"
            }
          />
          {r.status === "active" ? (
            <>
              <Field label="Return hub">
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
                >
                  {s.hubs.map((h) => (
                    <option value={h.id} key={h.id}>
                      {h.name} · {freeSpaces(s, h.id)} available now
                    </option>
                  ))}
                </select>
              </Field>
              <Alert>
                Space is checked on confirmation. Selecting a hub does not
                reserve it.
              </Alert>
              {error && (
                <>
                  <Alert tone="error">{error}</Alert>
                  <h3>Alternative hubs</h3>
                  <div className="flex items-center flex-wrap gap-3 mt-5 *:data-[slot~=button]:shrink-0">
                    {s.hubs
                      .filter(
                        (h) => h.id !== destination && freeSpaces(s, h.id) > 0,
                      )
                      .map((h) => (
                        <Button
                          variant="secondary"
                          key={h.id}
                          onClick={() => {
                            setDestination(h.id);
                            setError("");
                          }}
                        >
                          {h.name}
                        </Button>
                      ))}
                  </div>
                  {s.hubs.every((h) => freeSpaces(s, h.id) === 0) && (
                    <p className="leading-[1.65] mt-3 mb-5 mx-0">
                      No alternative hub is available. Your ride remains active;
                      review hubs again later.
                    </p>
                  )}
                </>
              )}
              <Confirm
                title={`Return at ${s.hubs.find((h) => h.id === destination)?.name}?`}
                description="If capacity is available, the ride completes and this vehicle occupies one space."
                trigger={
                  <Button>
                    Confirm return <Icon name="check" />
                  </Button>
                }
                onConfirm={handleConfirm1}
              />
            </>
          ) : (
            <>
              <Alert>
                Vehicle returned to{" "}
                {s.hubs.find((h) => h.id === r.destination)?.name}. Occupancy
                was updated once.
              </Alert>
              <Link
                data-slot="button"
                className="active:translate-y-px inline-flex items-center justify-center gap-2 min-h-11 rounded-xs text-sm font-medium leading-[24px] whitespace-normal text-on-dark bg-accent [&:hover:not(:disabled)]:bg-brand-hover [&:hover:not(:disabled)]:text-on-dark py-2 px-5"
                to="/student"
              >
                Back to overview
              </Link>
            </>
          )}
        </section>
      </div>
    </>
  );
}
