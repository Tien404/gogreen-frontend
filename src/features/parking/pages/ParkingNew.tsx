import { MobileTimePicker } from "@/features/student-mobility/MobileTimePicker";
import { StudentJourney } from "@/features/student-mobility/StudentJourney";
import { vehicleLabel } from "@/integration/recordLabels";
import { useRefreshStudentData } from "@/integration/studentRefresh";
import { vehicleTypeCode } from "@/integration/studentRecords";
import { Fragment, useRef, useState, type FormEvent } from "react";
import {
  Confirm,
  Link,
  Select,
  Input,
  Alert,
  Battery,
  Button,
  Field,
  Modal,
  PageTitle,
  SectionHead,
} from "@/shared/ui";
import { useApp } from "@/app/providers/AppContext";
import { config } from "@/config/app";
import { studentDate } from "@/integration/studentData";
import { StudentData } from "@/integration/StudentScreenData";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { Icon } from "@/shared/components/Icon";
import { VehicleArtwork } from "@/shared/components/MobilityArtwork";
import { parseTime } from "@/shared/lib/time";

import { useParkingNew } from "../hooks/useParkingNew";
export function ParkingNew() {
  return (
    <StudentData screen="newParking">
      <ParkingNewView />
    </StudentData>
  );
}
function ParkingNewView() {
  const { api, notify } = useApp();
  const refresh = useRefreshStudentData();
  const addVehicleCommand = useApiAction();
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [step, setStep] = useState<"setup" | "time">("setup");
  const {
    s,
    error,
    startError,
    endError,
    startNow,
    setStartNow,
    duration,
    setDuration,
    durationError,
    moveIntervalForward,
    service,
    withCharging,
    setWithCharging,
    target,
    setTarget,
    needBy,
    setNeedBy,
    createdParking,
    chargingError,
    cancelCreatedParking,
    hub,
    setHub,
    start,
    setStart,
    end,
    setEnd,
    review,
    setReview,
    vehicle,
    setVehicle,
    busy,
    submit,
    submitParking,
  } = useParkingNew();
  const resultRef = useRef<HTMLDivElement>(null);

  const ownedVehicles = s.privateVehicles.filter((v) => v.owner === s.persona);
  const selectedHub = s.hubs.find((h) => h.id === hub);
  const selectedVehicle = ownedVehicles.find((v) => v.id === vehicle);

  async function handleAddVehicle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const result = await addVehicleCommand.run(() =>
      api.request("POST /fleet/vehicles/private", {
        body: {
          license_plate: String(f.get("identifier") ?? "").trim(),
          vehicle_type: vehicleTypeCode(String(f.get("vehicleType"))),
          battery_pct: Number(f.get("battery")),
        },
      }),
    );
    if (result.ok) {
      notify("Private vehicle added.", "success");
      setVehicle(result.data.vehicle_id);
      setAddVehicleOpen(false);
      refresh?.();
    }
  }

  return (
    <StudentJourney
      hub={createdParking?.hub_id ?? hub}
      onHubSelect={createdParking || busy ? undefined : setHub}
      availabilityMode="parking"
      step={step}
    >
      <Link
        to="/student/parking"
        className="mb-4 inline-flex items-center gap-2 text-sm text-content-muted"
      >
        <Icon name="arrow-left" size={16} />
        Parking
      </Link>

      {createdParking && chargingError && (
        <div
          ref={resultRef}
          tabIndex={-1}
          aria-label="Booking result"
          aria-live="polite"
          className="mb-5 scroll-mt-5 outline-none"
        >
          <Alert tone="error">
            <strong>Parking booked; charging request failed.</strong>
            <p>{chargingError}</p>
          </Alert>
          {error && <Alert tone="error">{error}</Alert>}
          <div className="mb-5 flex flex-wrap gap-3 max-[600px]:*:data-[slot~=button]:flex-1">
            <Button disabled={busy} onClick={() => void submit()}>
              {busy ? "Retrying…" : "Retry charging"}
            </Button>
            <Button variant="secondary" asChild>
              <Link
                to={`/student/parking/${encodeURIComponent(createdParking.reservation_id)}`}
              >
                View parking
              </Link>
            </Button>
            <Confirm
              title="Cancel the parking booking?"
              description="Cancel the reserved parking and any linked charging request."
              onConfirm={() => void cancelCreatedParking()}
              trigger={
                <Button variant="secondary" disabled={busy}>
                  Cancel parking
                </Button>
              }
            />
          </div>
        </div>
      )}

      <form onSubmit={submitParking}>
        <fieldset
          disabled={busy || !!createdParking}
          className="min-w-0 border-0 p-0 m-0"
        >
          {step === "setup" ? (
            <Fragment key="setup">
              <PageTitle title="Book parking" />

              <div className="mb-5 rounded-xl bg-surface-muted p-3.5">
                <Field label="Campus hub">
                  <Select
                    value={hub}
                    onValueChange={(value) => setHub(value)}
                    className="border-0 bg-panel shadow-none"
                    wrapperClassName="max-w-full cursor-pointer"
                  >
                    {s.hubs.map((h) => (
                      <option value={h.id} key={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                {selectedHub?.live && (
                  <p className="mt-2 text-sm text-content-muted">
                    {selectedHub.live.bookable} bookable spaces ·{" "}
                    {selectedHub.live.availablePoints} charging points available
                  </p>
                )}
              </div>

              <SectionHead title="Your vehicle" />

              <div
                role="radiogroup"
                aria-label="Your private vehicle"
                className="grid grid-cols-1 gap-3"
              >
                {ownedVehicles.map((v) => {
                  const isSelected = vehicle === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setVehicle(v.id)}
                      className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                        isSelected
                          ? "bg-green-muted text-primary ring-2 ring-primary"
                          : "bg-surface-muted text-content hover:bg-green-muted/50 min-[850px]:bg-panel"
                      }`}
                    >
                      <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-panel p-2 text-primary [&_img]:h-full [&_img]:w-full [&_img]:object-contain">
                        <VehicleArtwork type={v.type} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <strong className="block wrap-anywhere text-base text-content">
                          {v.identifier}
                        </strong>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="text-sm text-content-muted">
                            {v.type}
                          </span>
                          <Battery value={v.battery} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setAddVehicleOpen(true)}
                className="mt-2 mb-5 w-full font-semibold"
              >
                <Icon name="plus" size={18} />
                Add vehicle
              </Button>

              <SectionHead title="Service" />
              <div
                role="radiogroup"
                aria-label="Parking service"
                className="mb-5 grid grid-cols-2 gap-2.5"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={!withCharging}
                  onClick={() => setWithCharging(false)}
                  className={`cursor-pointer rounded-xl p-3.5 text-left transition-colors ${
                    !withCharging
                      ? "bg-green-muted text-primary ring-2 ring-primary"
                      : "bg-surface-muted text-content"
                  }`}
                >
                  <Icon name="parking" size={20} />
                  <strong className="mt-2 block text-sm">Parking only</strong>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={withCharging}
                  onClick={() => setWithCharging(true)}
                  className={`cursor-pointer rounded-xl p-3.5 text-left transition-colors ${
                    withCharging
                      ? "bg-green-muted text-primary ring-2 ring-primary"
                      : "bg-surface-muted text-content"
                  }`}
                >
                  <Icon name="bolt" size={20} />
                  <strong className="mt-2 block text-sm">
                    Park &amp; charge
                  </strong>
                </button>
              </div>

              <Button
                type="button"
                className="button-wide"
                disabled={!vehicle || !hub}
                onClick={() => setStep("time")}
              >
                <span>Next</span>
                <Icon name="arrow" size={18} />
              </Button>
            </Fragment>
          ) : (
            <Fragment key="time">
              <PageTitle title="Choose parking times" />
              <div className="mb-4 flex items-center justify-between gap-2 rounded-xl bg-green-muted p-3">
                <div className="min-w-0">
                  <span className="block text-xs font-medium text-primary">
                    {service}
                  </span>
                  <strong className="block wrap-anywhere text-base text-content">
                    {selectedVehicle?.identifier ?? vehicleLabel(s, vehicle)} at{" "}
                    {selectedHub?.name}
                  </strong>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setStep("setup")}
                >
                  Change
                </Button>
              </div>

              <div
                role="group"
                aria-label="Parking start"
                className="segmented-control mb-4"
              >
                <button
                  type="button"
                  aria-pressed={!startNow}
                  onClick={() => setStartNow(false)}
                >
                  Schedule
                </button>
                <button
                  type="button"
                  aria-pressed={startNow}
                  onClick={() => setStartNow(true)}
                >
                  Start now
                </button>
              </div>

              {startNow ? (
                <section className="mb-4 rounded-xl bg-surface-muted p-3.5">
                  <h2 className="mb-2 text-lg font-semibold">
                    Parking duration
                  </h2>
                  <div
                    className="mb-3 grid grid-cols-4 gap-2"
                    role="group"
                    aria-label="Quick duration"
                  >
                    {[
                      [30, "30m"],
                      [60, "1h"],
                      [120, "2h"],
                      [240, "4h"],
                    ].map(([minutes, label]) => (
                      <Button
                        type="button"
                        key={minutes}
                        size="sm"
                        className="px-1"
                        variant={
                          duration === String(minutes) ? "primary" : "outline"
                        }
                        aria-pressed={duration === String(minutes)}
                        onClick={() => setDuration(String(minutes))}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                  <Field label="Duration in minutes" error={durationError}>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      inputMode="numeric"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </Field>
                  <p className="text-sm text-content-muted">
                    Parking starts when you confirm.
                  </p>
                </section>
              ) : (
                <>
                  <MobileTimePicker
                    label="Start time"
                    value={start}
                    clock={s.clock}
                    error={startError}
                    onChange={(value) => {
                      setStart(value);
                      setReview(false);
                    }}
                  />
                  <MobileTimePicker
                    label="End time"
                    value={end}
                    clock={s.clock}
                    error={endError}
                    durationFrom={start}
                    onChange={(value) => {
                      setEnd(value);
                      setReview(false);
                    }}
                  />
                </>
              )}

              {withCharging && (
                <>
                  <div className="mb-4 rounded-xl bg-surface-muted p-3.5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        Target battery (%)
                      </span>
                      <strong className="text-sm font-semibold text-primary tabular-nums">
                        {target}%
                      </strong>
                    </div>
                    <div className="mb-2.5 flex flex-wrap gap-1.5">
                      {[60, 80, 90, 100].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          aria-pressed={target === pct}
                          onClick={() => setTarget(pct)}
                          className={`flex-1 cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                            target === pct
                              ? "bg-primary text-on-dark"
                              : "bg-panel text-content hover:bg-green-muted"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                    <Field
                      label="Custom target (%)"
                      hint="Must exceed the vehicle’s current battery."
                    >
                      <Input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={target}
                        onChange={(e) => setTarget(Number(e.target.value))}
                        className="border-0 bg-panel shadow-none"
                      />
                    </Field>
                  </div>

                  <MobileTimePicker
                    label="Need by (optional)"
                    value={needBy}
                    clock={s.clock}
                    optional
                    onClear={() => setNeedBy("")}
                    onChange={(val) => setNeedBy(val)}
                  />
                </>
              )}

              {startError && (
                <Button
                  type="button"
                  variant="secondary"
                  className="mb-4 w-full"
                  onClick={moveIntervalForward}
                >
                  Move to next minute
                </Button>
              )}
              {error && <Alert tone="error">{error}</Alert>}
              {!createdParking && (
                <Button
                  type="submit"
                  className="button-wide"
                  disabled={!vehicle || !hub || busy}
                >
                  <span>Review</span>
                  <Icon name="arrow" size={18} />
                </Button>
              )}
            </Fragment>
          )}
        </fieldset>
      </form>

      <Modal
        title="Add a private vehicle"
        description="Register a vehicle identifier for campus parking and charging."
        open={addVehicleOpen}
        onOpenChange={(next) => {
          setAddVehicleOpen(next);
          addVehicleCommand.setError(null);
        }}
      >
        <form onSubmit={handleAddVehicle}>
          <Field label="Vehicle identifier">
            <Input
              name="identifier"
              placeholder="e.g. CAMPUS-215"
              required
              maxLength={30}
              className="max-w-full"
            />
          </Field>
          <Field label="Vehicle type">
            <Select
              name="vehicleType"
              wrapperClassName="max-w-full cursor-pointer"
            >
              {config.vehicleTypes.map((vehicleType) => (
                <option key={vehicleType}>{vehicleType}</option>
              ))}
            </Select>
          </Field>
          <Field label="Battery (%)">
            <Input
              name="battery"
              type="number"
              required
              min="0"
              max="100"
              defaultValue="60"
              className="max-w-full"
            />
          </Field>
          {addVehicleCommand.error != null && (
            <Alert tone="error">
              {apiErrorMessage(addVehicleCommand.error)}
            </Alert>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={addVehicleCommand.busy}
          >
            {addVehicleCommand.busy ? "Adding…" : "Add"}
          </Button>
        </form>
      </Modal>

      <Modal
        title="Confirm parking booking?"
        description="Review your selected hub, vehicle and parking interval."
        open={review}
        onOpenChange={(open) => !open && setReview(false)}
      >
        <dl className="record-details">
          <dt className="text-content-muted">Vehicle</dt>
          <dd className="wrap-anywhere m-0">{vehicleLabel(s, vehicle)}</dd>
          <dt className="text-content-muted">Hub</dt>
          <dd className="wrap-anywhere m-0">{selectedHub?.name}</dd>
          <dt className="text-content-muted">Start</dt>
          <dd className="wrap-anywhere m-0">
            {startNow ? "When you confirm" : studentDate(parseTime(start))}
          </dd>
          <dt className="text-content-muted">
            {startNow ? "Duration" : "End"}
          </dt>
          <dd className="wrap-anywhere m-0">
            {startNow ? duration + " min" : studentDate(parseTime(end))}
          </dd>
          <dt className="text-content-muted">Service</dt>
          <dd className="wrap-anywhere m-0">{service}</dd>
          {withCharging && (
            <>
              <dt>Charging target</dt>
              <dd>{target}%</dd>
              {needBy && (
                <>
                  <dt>Need by</dt>
                  <dd>{studentDate(parseTime(needBy))}</dd>
                </>
              )}
            </>
          )}
        </dl>
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex gap-3 justify-end mt-5 flex-wrap max-[600px]:*:data-[slot~=button]:flex-1">
          <Button disabled={busy} onClick={submit}>
            {busy ? "Confirming…" : "Confirm"}
          </Button>
        </div>
      </Modal>
    </StudentJourney>
  );
}
