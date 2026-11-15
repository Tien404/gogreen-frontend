import { available, freeSpaces } from "@/domain/selectors";
import { Alert, Button, Field, Modal } from "@/shared/ui";
import type { DispatchesModel } from "../hooks/useDispatches";

type CreateDispatchDialogProps = Pick<
  DispatchesModel,
  | "open"
  | "setOpen"
  | "submitDispatch"
  | "source"
  | "setSource"
  | "setVehicles"
  | "setReview"
  | "s"
  | "destination"
  | "setDestination"
  | "vehicles"
  | "review"
  | "error"
>;

export function CreateDispatchDialog({
  open,
  setOpen,
  submitDispatch,
  source,
  setSource,
  setVehicles,
  setReview,
  s,
  destination,
  setDestination,
  vehicles,
  review,
  error,
}: CreateDispatchDialogProps) {
  return (
    <Modal
      title="Create a dispatch"
      description="Review eligible shared vehicles and destination capacity before confirming."
      open={open}
      onOpenChange={setOpen}
    >
      <form onSubmit={submitDispatch}>
        <Field label="Source hub">
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setVehicles([]);
              setReview(false);
            }}
            className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
          >
            {s.hubs.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Destination hub">
          <select
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setReview(false);
            }}
            className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
          >
            {s.hubs.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </Field>
        <fieldset className="border border-solid border-divider rounded-xs mt-0 mb-5 p-4 mx-0">
          <legend className="text-sm py-0 px-2">
            Eligible shared vehicles
          </legend>
          <div className="grid gap-3 max-h-55 overflow-auto">
            {available(s, source).map((v) => (
              <label
                key={v.id}
                className="flex gap-3 text-sm items-center min-h-8"
              >
                <input
                  type="checkbox"
                  checked={vehicles.includes(v.id)}
                  onChange={(e) => {
                    setVehicles(
                      e.target.checked
                        ? [...vehicles, v.id]
                        : vehicles.filter((x) => x !== v.id),
                    );
                    setReview(false);
                  }}
                  className="placeholder:text-content-muted hover:bg-soft w-4.5 h-4.5 accent-accent"
                />
                {v.id} · {v.type} · {v.battery}%
              </label>
            ))}
          </div>
        </fieldset>
        <Alert>
          {freeSpaces(s, destination)} physical spaces free · {vehicles.length}{" "}
          selected. Existing dispatch commitments are rechecked on confirmation.
        </Alert>
        {review && (
          <Alert>
            Review: {vehicles.join(", ")} will move from {source} to{" "}
            {destination}. Departure is a separate action.
          </Alert>
        )}
        {error && <Alert tone="error">{error}</Alert>}
        <Button
          disabled={!vehicles.length || source === destination}
          type="submit"
        >
          {review ? "Confirm planned dispatch" : "Review dispatch"}
        </Button>
      </form>
    </Modal>
  );
}
