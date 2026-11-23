import { NativeSelect, Input, Alert, Button, Field } from "@/shared/ui";
import { Icon } from "@/shared/components/Icon";
import { MobilityArtwork } from "@/shared/components/MobilityArtwork";

import { useChargeForm } from "../hooks/useChargeForm";
type ChargeFormProps = {
  onDone?: (id: string) => void;
};
export function ChargeForm({ onDone }: ChargeFormProps) {
  const {
    student,
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
    <form onSubmit={requestCharge}>
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
      <Field
        label={
          student
            ? "Your private vehicle and parking context"
            : "Eligible shared vehicle"
        }
      >
        <NativeSelect
          required
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
          wrapperClassName="max-w-full cursor-pointer"
        >
          <option value="">Select a vehicle</option>
          {choice && !validChoice && (
            <option value={choice} disabled>
              {choice} · unavailable
            </option>
          )}
          {eligible.map((e) => (
            <option key={e.label}>{e.label}</option>
          ))}
        </NativeSelect>
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
      <Field label="Need by · Asia/Ho_Chi_Minh">
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
          No eligible vehicle.{" "}
          {student
            ? "Add a private vehicle and book parking first."
            : "Available shared vehicles need known battery data."}
        </Alert>
      )}
    </form>
  );
}
