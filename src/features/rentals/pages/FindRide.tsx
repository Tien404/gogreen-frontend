import { ApiLoadError } from "@/shared/api/ApiFeedback";
import { StudentData } from "@/integration/StudentScreenData";
import { config } from "@/config/app";
import { Icon } from "@/shared/components/Icon";
import { VehicleArtwork } from "@/shared/components/MobilityArtwork";
import {
  Alert,
  Badge,
  Battery,
  Button,
  Empty,
  Field,
  Link,
  Modal,
  PageTitle,
  SectionHead,
} from "@/shared/ui";
import { useFindRide } from "../hooks/useFindRide";
export function FindRide() {
  return (
    <StudentData screen="findRide">
      <FindRideView />
    </StudentData>
  );
}
function FindRideView() {
  const {
    s,
    query,
    origin,
    setOrigin,
    destination,
    setDestination,
    type,
    setType,
    error,
    busy,
    setSelected,
    vehicles,
    v,
    hold,
    ride,
    reserveVehicle,
  } = useFindRide();
  return (
    <>
      <PageTitle
        title="Find your next ride"
        description="Choose a hub, pick a shared vehicle and get moving."
      />
      <div
        data-slot="panel"
        className="bg-panel rounded-sm min-w-0 grid grid-cols-3 gap-5 mb-5 max-[1200px]:grid-cols-2 max-[600px]:rounded-xs max-[600px]:grid-cols-1 max-[600px]:gap-4 p-5 **:data-[slot~=field]:m-0 max-[600px]:p-5 max-[600px]:**:data-[slot~=field]:m-0"
      >
        <Field label="Starting hub">
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
          >
            {s.hubs.map((h) => (
              <option value={h.id} key={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Intended destination"
          hint="A return space is checked when you arrive."
        >
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
          >
            {s.hubs.map((h) => (
              <option value={h.id} key={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vehicle type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
          >
            <option value="all">All vehicles</option>
            {config.vehicleTypes.map((vehicleType) => (
              <option key={vehicleType}>{vehicleType}</option>
            ))}
          </select>
        </Field>
      </div>
      {origin === destination && (
        <Alert>
          Returning to the same hub is allowed. Return capacity is checked at
          arrival.
        </Alert>
      )}
      {(hold || ride) && (
        <Alert>
          You already have an active {hold ? "hold" : "ride"}.{" "}
          <Link
            to={
              hold ? `/student/holds/${hold.id}` : `/student/rides/${ride!.id}`
            }
          >
            View it here <Icon name="arrow" size={16} />
          </Link>
        </Alert>
      )}
      {error && <Alert tone="error">{error}</Alert>}
      {query.result.status === "loading" && (
        <p role="status">Loading vehicles…</p>
      )}
      {(query.refreshError ??
        (query.result.status === "error" ? query.result : null)) && (
        <ApiLoadError
          message={
            query.refreshError?.message ??
            (query.result.status === "error" ? query.result.message : "")
          }
          retry={query.retry}
        />
      )}
      <SectionHead
        title={`${vehicles.length} suitable vehicles`}
        subtitle={
          "Availability and battery eligibility are checked by the server."
        }
      />
      <div className="grid grid-cols-3 gap-5 max-[1200px]:grid-cols-2 max-[600px]:grid-cols-1">
        {vehicles.map((v) => (
          <section
            key={v.id}
            data-slot="panel"
            className="bg-panel rounded-sm min-w-0 *:data-[slot~=button]:w-full *:data-[slot~=button]:mt-5 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
          >
            <div className="h-37.5 rounded-xs bg-soft flex items-center justify-center text-accent relative mb-5 [&_>_svg]:w-27.5 [&_>_svg]:h-27.5">
              <VehicleArtwork type={v.type} />
              <span className="absolute bottom-3 left-3 text-xs bg-panel/80 rounded-xs text-content-muted py-1 px-2">
                {v.type}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <h3>{v.id}</h3>
              <Battery value={v.battery} />
            </div>
            <p className="leading-[1.65] mt-1 mb-3 mx-0">
              {s.hubs.find((h) => h.id === origin)?.name}
            </p>
            <Badge>Available</Badge>
            <div className="text-xs text-content-muted flex gap-2 mt-4">
              <Icon name="check" size={16} />
              {"Eligible for an immediate hold"}
            </div>
            <Button disabled={!!hold || !!ride} onClick={() => setSelected(v)}>
              Reserve now <Icon name="arrow" size={16} />
            </Button>
          </section>
        ))}
      </div>
      {!vehicles.length && query.result.status === "ready" && (
        <Empty
          title="No suitable vehicles"
          text={"Try another origin or vehicle type."}
        />
      )}
      <div className="flex items-center gap-2 text-xs text-content-muted mt-5">
        <Icon name="help" /> Low battery, unknown battery, stale and unavailable
        vehicles are excluded. Journey suitability unavailable for unknown
        readings.
      </div>
      <Modal
        title={`Hold ${v?.id ?? "vehicle"}?`}
        description={`An immediate ${15}-minute hold. No future rental reservation or return space is created.`}
        open={!!v}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        {v && (
          <>
            <dl className="grid grid-cols-[minmax(100px,0.8fr)_1.2fr] gap-4 text-sm **:data-[slot~=badge]:align-top my-5 mx-0">
              <dt className="text-content-muted">Vehicle</dt>
              <dd className="wrap-anywhere m-0">
                {v.id} · {v.type}
              </dd>
              <dt className="text-content-muted">Pickup hub</dt>
              <dd className="wrap-anywhere m-0">
                {s.hubs.find((h) => h.id === origin)?.name}
              </dd>
              <dt className="text-content-muted">Intended destination</dt>
              <dd className="wrap-anywhere m-0">
                {s.hubs.find((h) => h.id === destination)?.name}
              </dd>
              <dt className="text-content-muted">Battery</dt>
              <dd className="wrap-anywhere m-0">{v.battery}%</dd>
            </dl>
            {error && <Alert tone="error">{error}</Alert>}
            <Button disabled={busy} onClick={reserveVehicle}>
              {busy ? "Reserving…" : "Confirm immediate hold"}
            </Button>
          </>
        )}
      </Modal>
    </>
  );
}
