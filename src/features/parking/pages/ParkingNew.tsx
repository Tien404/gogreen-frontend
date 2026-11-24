import { vehicleLabel } from "@/integration/recordLabels";
import { useRef } from "react";
import {
  Panel,
  Confirm,
  Link,
  Select,
  Input,
  Alert,
  Button,
  Field,
  Modal,
  PageTitle,
  SectionHead,
} from "@/shared/ui";
import { studentDate } from "@/integration/studentData";
import { StudentData } from "@/integration/StudentScreenData";
import { Icon } from "@/shared/components/Icon";
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
  const {
    s,
    error,
    startError,
    endError,
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

  return (
    <>
      <Link
        to="/student/parking"
        className="mb-5 inline-flex items-center gap-2 text-sm text-content-muted"
      >
        <Icon name="arrow-left" size={16} />
        Parking
      </Link>
      <PageTitle
        title="A space for your day."
        description={
          "Book parking for your private vehicle and optionally request charging."
        }
      />
      <div
        data-slot="two-col"
        className="grid grid-cols-2 gap-5 max-[900px]:gap-4 max-[900px]:grid-cols-1"
      >
        <Panel data-slot="panel" className="min-w-0">
          {createdParking && chargingError && (
            <div
              ref={resultRef}
              tabIndex={-1}
              aria-label="Booking result"
              aria-live="polite"
              className="scroll-mt-5 outline-none"
            >
              <Alert tone="error">
                <strong>Parking booked; charging request failed.</strong>
                <p>{chargingError}</p>
                <p>Your parking booking remains reserved.</p>
              </Alert>
              {error && <Alert tone="error">{error}</Alert>}
              <div className="mb-5 flex flex-wrap gap-3">
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
                    <Button variant="ghost" disabled={busy}>
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
              <Field label="Your private vehicle">
                <Select
                  required
                  value={vehicle}
                  onValueChange={(value) => setVehicle(value)}
                  wrapperClassName="max-w-full cursor-pointer"
                >
                  <option value="">Select vehicle</option>
                  {s.privateVehicles
                    .filter((v) => v.owner === s.persona)
                    .map((v) => (
                      <option value={v.id} key={v.id}>
                        {v.identifier} · {v.type}
                      </option>
                    ))}
                </Select>
              </Field>
              <Field label="Hub">
                <Select
                  value={hub}
                  onValueChange={(value) => setHub(value)}
                  wrapperClassName="max-w-full cursor-pointer"
                >
                  {s.hubs.map((h) => (
                    <option value={h.id} key={h.id}>
                      {h.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <div
                data-slot="two-col"
                className="grid grid-cols-2 gap-4 **:data-[slot~=two-col]:gap-4 [&_>_[data-slot~=panel]_>_p]:mt-3 [&_>_[data-slot~=panel]_>_p]:mb-5 max-[900px]:gap-4 max-[900px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1 [&_>_[data-slot~=panel]_>_p]:mx-0"
              >
                <Field label="Start" error={startError}>
                  <Input
                    type="datetime-local"
                    required
                    value={start}
                    onChange={(e) => {
                      setStart(e.target.value);
                      setReview(false);
                    }}
                    className="max-w-full"
                  />
                </Field>
                <Field label="End" error={endError}>
                  <Input
                    type="datetime-local"
                    required
                    value={end}
                    onChange={(e) => {
                      setEnd(e.target.value);
                      setReview(false);
                    }}
                    className="max-w-full"
                  />
                </Field>
              </div>

              <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-lg bg-soft p-4 text-sm">
                <input
                  type="checkbox"
                  checked={withCharging}
                  onChange={(e) => setWithCharging(e.target.checked)}
                  className="mt-0.5 size-5 shrink-0 accent-primary"
                />
                <span>
                  <strong className="block">Park &amp; charge</strong>
                  <span className="mt-1 block text-content-muted">
                    Request charging with this booking. The server assigns the
                    queue and schedule.
                  </span>
                </span>
              </label>
              {withCharging && (
                <>
                  <Field
                    label="Target battery (%)"
                    hint="Must exceed the vehicle’s current battery."
                  >
                    <Input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={target}
                      onChange={(e) => setTarget(Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Need by (optional)">
                    <Input
                      type="datetime-local"
                      value={needBy}
                      onChange={(e) => setNeedBy(e.target.value)}
                    />
                  </Field>
                </>
              )}
              {startError && (
                <Button
                  type="button"
                  variant="secondary"
                  className="mb-4"
                  onClick={moveIntervalForward}
                >
                  Move interval to next minute
                </Button>
              )}
              {error && <Alert tone="error">{error}</Alert>}
              {!createdParking && (
                <Button type="submit" disabled={!vehicle || !hub || busy}>
                  Review interval availability <Icon name="arrow" />
                </Button>
              )}
            </fieldset>
          </form>
        </Panel>
        <Panel data-slot="panel" className="min-w-0">
          <SectionHead title="Booking summary" />
          <dl className="record-details">
            <dt className="text-content-muted">Hub</dt>
            <dd className="wrap-anywhere m-0">
              {s.hubs.find((h) => h.id === hub)?.name}
            </dd>
            <dt className="text-content-muted">Service</dt>
            <dd className="wrap-anywhere m-0">{service}</dd>
            {withCharging && (
              <>
                <dt>Target battery</dt>
                <dd>{target}%</dd>
                <dt>Charging slot</dt>
                <dd>Assigned by the server; may be queued</dd>
              </>
            )}
            <dt className="text-content-muted">Availability</dt>
            <dd className="wrap-anywhere m-0">
              {createdParking
                ? "Parking booked; charging not confirmed"
                : review
                  ? "Checked when you confirm"
                  : "Review your selected interval"}
            </dd>
          </dl>
        </Panel>
      </div>
      <Modal
        title={
          withCharging ? "Confirm park & charge" : "Confirm parking booking"
        }
        description="Review the selected service and whole parking interval."
        open={review}
        onOpenChange={setReview}
        onCloseAutoFocus={(event) => {
          if (createdParking && chargingError && resultRef.current) {
            event.preventDefault();
            resultRef.current.focus({ preventScroll: true });
            resultRef.current.scrollIntoView({
              block: "start",
              behavior: "instant",
            });
          }
        }}
      >
        <dl className="record-details">
          <dt className="text-content-muted">Vehicle</dt>
          <dd className="wrap-anywhere m-0">{vehicleLabel(s, vehicle)}</dd>
          <dt className="text-content-muted">Hub</dt>
          <dd className="wrap-anywhere m-0">
            {s.hubs.find((h) => h.id === hub)?.name}
          </dd>
          <dt className="text-content-muted">Interval</dt>
          <dd className="wrap-anywhere m-0">
            {`${studentDate(parseTime(start))} – ${studentDate(parseTime(end))}`}
          </dd>
          <dt className="text-content-muted">Service</dt>
          <dd className="wrap-anywhere m-0">{service}</dd>
        </dl>
        {withCharging && (
          <>
            <dl className="record-details">
              <dt>Charging target</dt>
              <dd>{target}%</dd>
              {needBy && (
                <>
                  <dt>Need by</dt>
                  <dd>{studentDate(parseTime(needBy))}</dd>
                </>
              )}
            </dl>
            <Alert>
              Parking is booked first, then charging is requested. A charging
              slot is not guaranteed. If charging fails, you can retry or cancel
              parking.
            </Alert>
          </>
        )}
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex gap-3 justify-end mt-5 flex-wrap max-[600px]:*:data-[slot~=button]:flex-1">
          <Button disabled={busy} onClick={submit}>
            {busy ? "Confirming…" : "Confirm booking"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
