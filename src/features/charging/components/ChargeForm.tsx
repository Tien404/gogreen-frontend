import {
  Select,
  Input,
  Alert,
  Button,
  Field,
  Panel,
  SectionHead,
  Link,
} from "@/shared/ui";
import { Icon } from "@/shared/components/Icon";
import { MobilityArtwork } from "@/shared/components/MobilityArtwork";

import { useChargeForm } from "../hooks/useChargeForm";
type ChargeFormProps = {
  onDone?: (id: string) => void;
};
export function ChargeForm({ onDone }: ChargeFormProps) {
  const {
    student,
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
  return (
    <form
      onSubmit={requestCharge}
      className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start gap-5 max-[1000px]:grid-cols-1"
    >
      <Panel className="min-w-0">
        <Field
          label={
            student
              ? "Your private vehicle and parking context"
              : "Eligible shared vehicle"
          }
        >
          <Select
            required
            value={choice}
            onValueChange={(value) => setChoice(value)}
            wrapperClassName="max-w-full cursor-pointer"
          >
            <option value="">Select a vehicle</option>
            {choice && !validChoice && (
              <option value={choice} disabled>
                Selected parking booking · unavailable
              </option>
            )}
            {eligible.map((e) => (
              <option key={e.booking} value={e.booking}>
                {e.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Target battery (%)"
          hint="Target must exceed current battery. A pending request does not confirm a time slot."
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
        <Field label="Need by">
          {
            <Input
              type="datetime-local"
              value={needBy}
              onChange={(e) => setNeedBy(e.target.value)}
              className="max-w-full"
            />
          }
        </Field>
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" disabled={busy || !validChoice}>
          {busy ? "Adding request…" : "Request charging"}
          <Icon name="bolt" size={18} />
        </Button>
        {!eligible.length && (
          <Alert>
            {student
              ? "No eligible parking booking selected. Use Park & charge to book parking and request charging together."
              : "Available shared vehicles need known battery data."}
            {student && (
              <Link
                className="mt-2 inline-flex min-h-11 items-center gap-2 font-semibold"
                to="/student/parking/new?service=park-charge"
              >
                Park &amp; charge <Icon name="arrow" size={16} />
              </Link>
            )}
          </Alert>
        )}
      </Panel>
      <Panel className="min-w-0">
        <div className="flex items-center gap-5 rounded-lg bg-green-muted text-green-ink [&_p]:text-inherit p-4 mb-5">
          <MobilityArtwork
            name="charging-point"
            className="h-21.5 w-12 shrink-0"
          />
          <div className="min-w-0">
            <h3>A little more charge.</h3>
            <p className="mt-1">
              Choose your vehicle and target battery to join the charging queue.
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
          <dt>Parking booking</dt>
          <dd>{selectedContext?.parking ?? "No eligible booking selected"}</dd>
        </dl>
        <p className="text-sm">
          A pending request does not confirm a time slot. Your schedule is
          assigned by the server.
        </p>
      </Panel>
    </form>
  );
}
