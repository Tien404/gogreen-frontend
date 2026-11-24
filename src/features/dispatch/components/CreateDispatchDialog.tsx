import { vehicleLabel } from "@/integration/recordLabels";
import { Select, Input, Alert, Button, Field, Modal } from "@/shared/ui";
import { freeSpaces } from "@/domain/selectors";

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
  | "busy"
  | "valid"
  | "candidates"
  | "hubs"
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
  busy,
  valid,
  candidates,
  hubs,
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
          <Select
            value={source}
            onValueChange={(value) => {
              setSource(value);
              setVehicles([]);
              setReview(false);
            }}
            wrapperClassName="max-w-full cursor-pointer"
          >
            {hubs.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Destination hub">
          <Select
            value={destination}
            onValueChange={(value) => {
              setDestination(value);
              setReview(false);
            }}
            wrapperClassName="max-w-full cursor-pointer"
          >
            {hubs.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </Select>
        </Field>
        <fieldset className="border border-solid border-divider rounded-lg mt-0 mb-5 p-4 mx-0">
          <legend className="text-sm py-0 px-2">
            Eligible shared vehicles
          </legend>
          <div className="grid gap-3 max-h-55 overflow-auto">
            {candidates.map((v) => (
              <label
                key={vehicleLabel(s, v.id)}
                className="flex gap-3 text-sm items-center min-h-11"
              >
                <Input
                  type={"radio"}
                  name={"dispatch-vehicle"}
                  checked={vehicles.includes(v.id)}
                  onChange={(e) => {
                    setVehicles(
                      e.target.checked
                        ? [v.id]
                        : vehicles.filter((x) => x !== v.id),
                    );
                    setReview(false);
                  }}
                  className="size-4.5 shrink-0 accent-primary p-0 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:ring-0"
                />
                {vehicleLabel(s, v.id)} · {v.type} ·{" "}
                {v.battery === null ? "Battery unavailable" : `${v.battery}%`}
              </label>
            ))}
          </div>
        </fieldset>
        <Alert>
          {freeSpaces(s, destination)} {"bookable spaces"} · {vehicles.length}{" "}
          selected. Existing dispatch commitments are rechecked on confirmation.
        </Alert>
        {vehicles.length > 0 && !valid && (
          <Alert tone="error">
            The selected vehicle or route is unavailable. Review the current
            choices.
          </Alert>
        )}
        {review && (
          <Alert>
            Review: {vehicles.join(", ")} will move from {source} to{" "}
            {destination}. Departure is a separate action.
          </Alert>
        )}
        {error && <Alert tone="error">{error}</Alert>}
        <Button disabled={!valid || busy} type="submit">
          {review ? "Confirm planned dispatch" : "Review dispatch"}
        </Button>
      </form>
    </Modal>
  );
}
