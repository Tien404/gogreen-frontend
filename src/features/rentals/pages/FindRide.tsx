import { StudentActivityCard } from "@/features/student-mobility/StudentActivityCard";
import { StudentJourney } from "@/features/student-mobility/StudentJourney";
import { currentStudentActivities } from "@/features/student-mobility/studentActivities";
import {
  LoadingState,
  Panel,
  Select,
  Alert,
  Battery,
  Button,
  Empty,
  Field,
  Modal,
  PageTitle,
  SectionHead,
} from "@/shared/ui";
import { ApiLoadError } from "@/shared/api/ApiFeedback";
import { StudentData } from "@/integration/StudentScreenData";
import { config } from "@/config/app";
import { Icon } from "@/shared/components/Icon";
import { VehicleArtwork } from "@/shared/components/MobilityArtwork";
import { useState } from "react";

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
    setSelected,
    error,
    busy,
    vehicles,
    v,
    reserveVehicle,
  } = useFindRide();
  const [step, setStep] = useState<"route" | "vehicle">("route");
  const activeRideCard = currentStudentActivities(s).find(
    (item) => item.kind === "hold" || item.kind === "rental",
  );
  const originHub = s.hubs.find((h) => h.id === origin);
  const destinationHub = s.hubs.find((h) => h.id === destination);

  return (
    <StudentJourney
      hub={activeRideCard ? activeRideCard.hub : origin}
      selectedHub={activeRideCard ? undefined : origin}
      mapSelection={false}
      destination={activeRideCard ? activeRideCard.destination : destination}
      active={Boolean(activeRideCard)}
      step={activeRideCard ? undefined : step}
    >
      {activeRideCard ? (
        <StudentActivityCard activity={activeRideCard} />
      ) : step === "route" ? (
        <>
          <PageTitle title="Choose your route" />
          <Panel
            data-slot="panel"
            className="min-w-0 grid grid-cols-1 gap-4 mb-5 bg-surface-muted **:data-[slot~=field]:m-0"
          >
            <Field label="Pickup hub">
              <Select
                value={origin}
                onValueChange={(value) => setOrigin(value)}
                wrapperClassName="max-w-full cursor-pointer"
              >
                {s.hubs.map((h) => (
                  <option value={h.id} key={h.id}>
                    {h.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Destination hub">
              <Select
                value={destination}
                onValueChange={(value) => setDestination(value)}
                wrapperClassName="max-w-full cursor-pointer"
              >
                {s.hubs.map((h) => (
                  <option value={h.id} key={h.id}>
                    {h.name}
                  </option>
                ))}
              </Select>
            </Field>
          </Panel>
          <Button
            className="button-wide"
            disabled={!origin || !destination}
            onClick={() => setStep("vehicle")}
          >
            <span>Next</span>
            <Icon name="arrow" size={18} />
          </Button>
        </>
      ) : (
        <>
          <PageTitle
            title="Choose a vehicle"
            action={
              <Button
                type="button"
                variant="secondary"
                className="px-3"
                onClick={() => setStep("route")}
              >
                Change hubs
              </Button>
            }
          />
          <dl className="mb-4 grid grid-cols-2 gap-2">
            <div className="min-w-0 rounded-xl bg-green-muted p-3">
              <dt className="flex items-center gap-1.5 text-sm font-medium text-primary">
                <Icon name="bike" size={17} /> Pickup
              </dt>
              <dd className="mt-1 wrap-anywhere text-base font-semibold leading-snug">
                {originHub?.name}
              </dd>
            </div>
            <div className="min-w-0 rounded-xl bg-green-muted p-3">
              <dt className="flex items-center gap-1.5 text-sm font-medium text-primary">
                <Icon name="pin" size={17} /> Destination
              </dt>
              <dd className="mt-1 wrap-anywhere text-base font-semibold leading-snug">
                {destinationHub?.name}
              </dd>
            </div>
          </dl>

          <div
            role="group"
            aria-label="Filter vehicle type"
            className="segmented-control mb-4"
          >
            <button
              type="button"
              aria-pressed={type === "all"}
              onClick={() => setType("all")}
            >
              All ({vehicles.length})
            </button>
            {config.vehicleTypes.map((vehicleType) => (
              <button
                type="button"
                key={vehicleType}
                aria-pressed={type === vehicleType}
                onClick={() => setType(vehicleType)}
              >
                {vehicleType}
              </button>
            ))}
          </div>

          {error && <Alert tone="error">{error}</Alert>}
          {query.result.status === "loading" && (
            <LoadingState label={"Loading vehicles…"} />
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
            title={
              query.result.status === "ready"
                ? `${vehicles.length} suitable vehicles`
                : "Available vehicles"
            }
          />
          <div className="student-ride-results grid grid-cols-1 gap-4">
            {vehicles.map((veh) => (
              <Panel
                key={veh.id}
                data-slot="panel"
                className="min-w-0 bg-surface-muted min-[850px]:bg-panel"
              >
                <div className="h-36 rounded-lg bg-soft flex items-center justify-center text-primary relative mb-4 [&_>_svg]:w-26 [&_>_svg]:h-26">
                  <VehicleArtwork type={veh.type} />
                  <span className="absolute bottom-3 left-3 text-xs font-medium bg-panel/90 rounded-lg text-content-muted py-1 px-2">
                    {veh.type}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="min-w-0 text-lg font-semibold wrap-anywhere">
                    {veh.id}
                  </h3>
                  <Battery value={veh.battery} />
                </div>
                <Button
                  className="button-wide mt-4"
                  onClick={() => setSelected(veh)}
                >
                  Select <Icon name="arrow" />
                </Button>
              </Panel>
            ))}
          </div>
          {!vehicles.length && query.result.status === "ready" && (
            <Empty
              title="No suitable vehicles"
              text={"Try another origin or vehicle type."}
            />
          )}
        </>
      )}
      <Modal
        title={`Hold ${v?.id ?? "vehicle"}?`}
        description={`Immediate 15-minute hold at ${originHub?.name ?? "pickup hub"}.`}
        open={!!v}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        {v && (
          <>
            <div className="mb-4 grid h-36 place-items-center rounded-xl bg-soft text-primary">
              <VehicleArtwork type={v.type} />
            </div>
            <dl className="record-details">
              <dt className="text-content-muted">Vehicle</dt>
              <dd className="wrap-anywhere m-0">
                {v.id} · {v.type}
              </dd>
              <dt className="text-content-muted">Pickup hub</dt>
              <dd className="wrap-anywhere m-0">{originHub?.name}</dd>
              <dt className="text-content-muted">Intended destination</dt>
              <dd className="wrap-anywhere m-0">{destinationHub?.name}</dd>
              <dt className="text-content-muted">Battery</dt>
              <dd className="wrap-anywhere m-0">
                <Battery value={v.battery} />
              </dd>
            </dl>
            {error && <Alert tone="error">{error}</Alert>}
            <Button className="w-full" disabled={busy} onClick={reserveVehicle}>
              {busy ? "Reserving…" : "Confirm hold"}
            </Button>
          </>
        )}
      </Modal>
    </StudentJourney>
  );
}
