import { MobileTimePicker } from "@/features/student-mobility/MobileTimePicker";
import { StudentJourney } from "@/features/student-mobility/StudentJourney";
import { studentDate } from "@/integration/studentData";
import { time } from "@/shared/lib/time";
import { useApp } from "@/app/providers/AppContext";
import {
  Select,
  Input,
  Alert,
  Battery,
  Button,
  Field,
  Panel,
  PageTitle,
  SectionHead,
  Link,
} from "@/shared/ui";
import { Icon } from "@/shared/components/Icon";
import {
  MobilityArtwork,
  VehicleArtwork,
} from "@/shared/components/MobilityArtwork";
import { useState } from "react";

import { useChargeForm } from "../hooks/useChargeForm";
type ChargeFormProps = {
  onDone?: (id: string) => void;
};
export function ChargeForm({ onDone }: ChargeFormProps) {
  const { s } = useApp();
  const [step, setStep] = useState<"vehicle" | "target">("vehicle");
  const {
    student,
    hub,
    selectedContext,
    needBy,
    setNeedBy,
    validChoice,
    eligible,
    choice,
    setChoice,
    target,
    setTarget,
    error,
    busy,
    requestCharge,
  } = useChargeForm({ onDone });

  if (!student) {
    return (
      <form
        data-slot="two-col"
        onSubmit={requestCharge}
        className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start gap-5 max-[1000px]:grid-cols-1"
      >
        <Panel className="min-w-0">
          <Field label="Eligible shared vehicle">
            <Select
              required
              value={choice}
              onValueChange={(value) => setChoice(value)}
              wrapperClassName="max-w-full cursor-pointer"
            >
              <option value="">Select a vehicle</option>
              {eligible.map((e) => (
                <option key={e.booking} value={e.booking}>
                  {e.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Target battery (%)"
            hint="Target must exceed current battery."
          >
            <Input
              required
              type="number"
              min={1}
              max="100"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="max-w-full"
            />
          </Field>
          {error && <Alert tone="error">{error}</Alert>}
          <Button
            type="submit"
            className="max-[600px]:w-full"
            disabled={busy || !validChoice}
          >
            {busy ? "Sending…" : "Request"}
            <Icon name="bolt" size={18} />
          </Button>
        </Panel>
        <Panel className="min-w-0">
          <div className="mb-5 flex items-center gap-5 rounded-lg bg-green-muted p-4 text-green-ink [&_p]:text-inherit">
            <MobilityArtwork
              name="charging-point"
              className="h-21.5 w-12 shrink-0"
            />
            <div className="min-w-0">
              <h3>A little more charge.</h3>
              <p className="mt-1">
                Choose your vehicle and target battery to join the charging
                queue.
              </p>
            </div>
          </div>
          <SectionHead
            title="Request summary"
            subtitle="Your selected vehicle and charging target"
          />
          <dl className="record-details">
            <dt>Vehicle</dt>
            <dd>{selectedContext?.vehicle ?? "Select a vehicle"}</dd>
            <dt>Hub</dt>
            <dd>{selectedContext?.hub ?? "From your parking booking"}</dd>
            <dt>Current battery</dt>
            <dd>
              {selectedContext?.battery == null
                ? "Unknown"
                : `${selectedContext.battery}%`}
            </dd>
            <dt>Target battery</dt>
            <dd>{target}%</dd>
          </dl>
        </Panel>
      </form>
    );
  }

  return (
    <StudentJourney hub={hub} availabilityMode="charging" step={step}>
      <Link
        to="/student/charging"
        className="mb-4 inline-flex items-center gap-2 text-sm text-content-muted"
      >
        <Icon name="arrow-left" size={16} />
        Charging
      </Link>

      <form onSubmit={requestCharge}>
        {step === "vehicle" ? (
          <>
            <PageTitle title="Request charging" />
            {eligible.length > 0 ? (
              <>
                <div
                  role="radiogroup"
                  aria-label="Your private vehicle and parking context"
                  className="mb-5 grid grid-cols-1 gap-3"
                >
                  {eligible.map((item) => {
                    const isSelected = choice === item.booking;
                    const priv = s.privateVehicles.find(
                      (v) => v.id === item.id,
                    );
                    const hubObj = s.hubs.find((h) => h.id === item.hub);
                    const booking = s.bookings.find(
                      (b) => b.id === item.booking,
                    );
                    return (
                      <button
                        key={item.booking}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setChoice(item.booking)}
                        className={`flex cursor-pointer items-center gap-3.5 rounded-xl p-3 text-left transition-colors ${
                          isSelected
                            ? "bg-green-muted text-primary ring-2 ring-primary"
                            : "bg-surface-muted text-content hover:bg-green-muted/50"
                        }`}
                      >
                        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-panel p-3 text-primary [&_img]:h-full [&_img]:w-full [&_img]:object-contain">
                          <VehicleArtwork type={priv?.type ?? ""} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <strong className="wrap-anywhere text-base text-content">
                              {priv?.identifier ?? item.label}
                            </strong>
                            <Battery value={priv?.battery ?? null} />
                          </div>
                          <span className="mt-1 block text-sm font-medium text-content">
                            {hubObj?.name ?? "Campus hub"}
                          </span>
                          {booking && (
                            <span className="mt-1 block text-sm text-content-muted">
                              {studentDate(booking.start)} – {time(booking.end)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  className="button-wide"
                  disabled={!validChoice}
                  onClick={() => setStep("target")}
                >
                  <span>Next</span>
                  <Icon name="arrow" size={18} />
                </Button>
                <div className="mt-3 text-center">
                  <Link
                    to="/student/parking/new?service=park-charge"
                    className="inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    Park &amp; charge <Icon name="arrow" size={14} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-surface-muted p-5 text-center">
                <span className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-green-muted text-primary">
                  <Icon name="bolt" size={24} />
                </span>
                <h2 className="text-base font-semibold">
                  No eligible parking booking yet
                </h2>
                <p className="mt-1.5 mb-4 text-sm text-content-muted">
                  Reserve parking before requesting a charge.
                </p>
                <Button asChild className="button-wide">
                  <Link to="/student/parking/new?service=park-charge">
                    <span>Park &amp; charge</span>
                    <Icon name="arrow" size={18} />
                  </Link>
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <PageTitle title="Set charging target" />
            <div className="mb-4 flex items-center justify-between gap-2 rounded-xl bg-green-muted p-3">
              <div className="min-w-0">
                <strong className="block wrap-anywhere text-base text-content">
                  {selectedContext?.vehicle} · {selectedContext?.hub}
                </strong>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setStep("vehicle")}
              >
                Change
              </Button>
            </div>

            <div className="mb-4 rounded-xl bg-surface-muted p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Target battery (%)
                </span>
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
                hint={
                  selectedContext?.battery != null
                    ? `Current battery is ${selectedContext.battery}%. Target must exceed it.`
                    : "Target must exceed current battery."
                }
              >
                <Input
                  required
                  type="number"
                  min={1}
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

            {error && <Alert tone="error">{error}</Alert>}
            <Button
              type="submit"
              className="button-wide"
              disabled={busy || !validChoice}
            >
              <span>{busy ? "Sending…" : "Request"}</span>
              <Icon name="bolt" size={18} />
            </Button>
          </>
        )}
      </form>
    </StudentJourney>
  );
}
