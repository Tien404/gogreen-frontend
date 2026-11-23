import {
  Panel,
  NativeSelect,
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
import { StudentData } from "@/integration/StudentScreenData";
import { Missing } from "@/app/pages/Missing";
import { freeSpaces } from "@/domain/selectors";
import { Icon } from "@/shared/components/Icon";
import { VehicleArtwork } from "@/shared/components/MobilityArtwork";
import { time } from "@/shared/lib/time";

import { useRideDetail } from "../hooks/useRideDetail";
type RideDetailProps = {
  id: string;
};
export function RideDetail(props: RideDetailProps) {
  return (
    <StudentData screen="ride" id={props.id}>
      <RideDetailView {...props} />
    </StudentData>
  );
}
function RideDetailView({ id }: RideDetailProps) {
  const {
    s,
    r,
    destination,
    setDestination,
    error,
    suggestions,
    busy,
    clearError,
    v,
    handleConfirm1,
  } = useRideDetail({ id });
  if (!r) return <Missing />;
  return (
    <>
      <PageTitle
        title={
          r.status === "active"
            ? "Enjoy the journey."
            : r.status === "completed"
              ? "You’ve arrived."
              : "Ride disputed"
        }
        description={`${r.id} · ${r.status === "active" ? "Your ride is active" : r.status === "completed" ? "Ride completed" : "Ride disputed"}`}
        action={<Badge>{r.status}</Badge>}
      />
      <div
        data-slot="two-col"
        className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 max-[900px]:gap-4 max-[900px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1"
      >
        <Panel data-slot="panel" className="min-w-0">
          <div className="h-50 rounded-lg bg-soft grid place-items-center text-primary mb-5 max-[600px]:h-42.5">
            <VehicleArtwork type={v?.type ?? ""} />
          </div>
          <SectionHead
            title={v ? `${r.vehicle} · ${v.type}` : r.vehicle}
            action={<Battery value={v?.battery ?? null} />}
          />
          <dl className="record-details">
            <dt className="text-content-muted">Started</dt>
            <dd className="wrap-anywhere m-0">{time(r.start)}</dd>
            <dt className="text-content-muted">Elapsed time</dt>
            <dd className="wrap-anywhere m-0">
              {Math.max(0, Math.floor((r.end ?? s.clock) - r.start))} minutes
            </dd>
            <dt className="text-content-muted">Origin</dt>
            <dd className="wrap-anywhere m-0">
              {s.hubs.find((h) => h.id === r.origin)?.name}
            </dd>
            <dt className="text-content-muted">Destination</dt>
            <dd className="wrap-anywhere m-0">
              {s.hubs.find((h) => h.id === r.destination)?.name ??
                (r.destination || "Not specified")}
            </dd>
          </dl>
        </Panel>
        <Panel data-slot="panel" className="min-w-0">
          <SectionHead
            title={
              r.status === "active"
                ? "Ready to return?"
                : r.status === "completed"
                  ? "Return confirmed"
                  : "Ride status"
            }
          />
          {r.status === "active" ? (
            <>
              <Field label="Return hub">
                <NativeSelect
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  wrapperClassName="max-w-full cursor-pointer"
                >
                  {s.hubs.map((h) => (
                    <option value={h.id} key={h.id}>
                      {h.name} · {freeSpaces(s, h.id)} available now
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Alert>
                Space is checked on confirmation. Selecting a hub does not
                reserve it.
              </Alert>
              {error && (
                <Alert tone="error">
                  {error}
                  {suggestions !== null && " Your ride is still active."}
                </Alert>
              )}
              {suggestions !== null && (
                <>
                  <h3>Alternative hubs</h3>
                  <div className="flex items-center flex-wrap gap-3 mt-5">
                    {suggestions.map((hub) => (
                      <Button
                        variant="secondary"
                        key={hub.id}
                        onClick={() => {
                          setDestination(hub.id);
                          clearError();
                        }}
                      >
                        {s.hubs.find((h) => h.id === hub.id)?.name ?? hub.id}
                        {` · ${hub.spaces} available`}
                      </Button>
                    ))}
                  </div>
                  {!suggestions.length && (
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
                  <Button disabled={busy || !destination}>
                    Confirm return <Icon name="check" />
                  </Button>
                }
                onConfirm={handleConfirm1}
              />
            </>
          ) : (
            <>
              {r.status === "completed" ? (
                <Alert>
                  Vehicle returned to{" "}
                  {s.hubs.find((h) => h.id === r.destination)?.name ??
                    (r.destination || "Not specified")}
                  . Occupancy was updated once.
                </Alert>
              ) : (
                <Alert>This ride is disputed.</Alert>
              )}
              <Link
                data-slot="button"
                className="active:translate-y-px inline-flex items-center justify-center gap-2 min-h-11 rounded-lg text-sm font-medium leading-[24px] whitespace-normal text-on-dark bg-primary [&:hover:not(:disabled)]:bg-brand-hover [&:hover:not(:disabled)]:text-on-dark py-2 px-5"
                to="/student"
              >
                Back to overview
              </Link>
            </>
          )}
        </Panel>
      </div>
    </>
  );
}
