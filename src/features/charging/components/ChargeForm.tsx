import { Icon } from "@/shared/components/Icon";
import { MobilityArtwork } from "@/shared/components/MobilityArtwork";
import { Alert, Button, Field } from "@/shared/ui";
import { useChargeForm } from "../hooks/useChargeForm";

type ChargeFormProps = { onDone?: (id: string) => void };

export function ChargeForm({ onDone }: ChargeFormProps) {
  const {
    student,
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
      <div className="flex items-center gap-5 rounded-xs bg-soft p-4 mb-5">
        <MobilityArtwork
          name="charging-point"
          className="h-21.5 w-6 shrink-0"
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
        <select
          required
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
          className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
        >
          <option value="">Select a vehicle</option>
          {eligible.map((e) => (
            <option key={e.label}>{e.label}</option>
          ))}
        </select>
      </Field>
      <Field
        label="Target battery (%)"
        hint="Target must exceed current battery. A pending request does not confirm a time slot."
      >
        <input
          required
          type="number"
          min="0"
          max="100"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full placeholder:text-content-muted hover:bg-soft py-2 px-3"
        />
      </Field>
      <Field label="Need by · Asia/Ho_Chi_Minh">
        <select className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3">
          <option>20 October, 12:00 · supported preset</option>
        </select>
      </Field>
      {error && <Alert tone="error">{error}</Alert>}
      <Button type="submit" disabled={busy || !eligible.length}>
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
