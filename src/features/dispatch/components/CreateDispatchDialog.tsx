import { vehicleLabel } from "@/integration/recordLabels";
import { Select, Input, Alert, Button, Field, Modal } from "@/shared/ui";
import { freeSpaces } from "@/domain/selectors";

import { DispatchRoutePreview } from "./DispatchRoutePreview";
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
  const sourceHub = hubs.find((hub) => hub.id === source);
  const destinationHub = hubs.find((hub) => hub.id === destination);
  const selectedVehicleLabels = vehicles.map((id) => vehicleLabel(s, id));
  const allSelected =
    candidates.length > 0 &&
    candidates.every((candidate) => vehicles.includes(candidate.id));

  return (
    <Modal
      title="Create a dispatch"
      open={open}
      onOpenChange={(next) => {
        if (!next) setReview(false);
        setOpen(next);
      }}
      size="lg"
    >
      <form onSubmit={submitDispatch}>
        {review ? (
          <DispatchRoutePreview
            focusOnMount
            source={sourceHub}
            destination={destinationHub}
            vehicles={selectedVehicleLabels}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 md:items-start">
            <div className="min-w-0">
              <Field label="Source hub">
                <Select
                  className="border-divider bg-surface-inset shadow-none hover:bg-surface-muted"
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
                  className="border-divider bg-surface-inset shadow-none hover:bg-surface-muted"
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
              <fieldset className="border border-solid border-divider rounded-lg mt-0 mb-5 p-3.5 mx-0">
                <legend className="text-sm font-medium py-0 px-2">
                  Eligible shared vehicles
                </legend>
                {candidates.length > 1 && (
                  <div className="mb-2 flex items-center justify-between text-xs text-content-muted px-1">
                    <span>
                      {vehicles.length} of {candidates.length} selected
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setVehicles(
                          allSelected ? [] : candidates.map((c) => c.id),
                        );
                        setReview(false);
                      }}
                    >
                      {allSelected ? "Clear all" : "Select all"}
                    </Button>
                  </div>
                )}
                <div className="grid gap-1 max-h-55 overflow-auto">
                  {candidates.length === 0 ? (
                    <p className="px-1 py-2 text-sm text-content-muted">
                      No eligible shared vehicles at this source hub.
                    </p>
                  ) : (
                    candidates.map((v) => (
                      <label
                        key={vehicleLabel(s, v.id)}
                        className="flex gap-3 text-sm items-center min-h-11 cursor-pointer rounded-md px-2 py-1.5 transition-colors hover:bg-surface-muted has-[:checked]:bg-green-muted/60"
                      >
                        <Input
                          type="checkbox"
                          name="dispatch-vehicle"
                          checked={vehicles.includes(v.id)}
                          onChange={(e) => {
                            setVehicles(
                              e.target.checked
                                ? [...vehicles, v.id]
                                : vehicles.filter((x) => x !== v.id),
                            );
                            setReview(false);
                          }}
                          className="size-4.5 shrink-0 accent-primary p-0 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:ring-0"
                        />
                        <span className="min-w-0 flex-1 wrap-anywhere">
                          <span className="font-medium text-content">
                            {vehicleLabel(s, v.id)}
                          </span>{" "}
                          <span className="text-content-muted">
                            · {v.type} ·{" "}
                            {v.battery === null
                              ? "Battery unavailable"
                              : `${v.battery}%`}
                          </span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </fieldset>
            </div>
            <DispatchRoutePreview
              source={sourceHub}
              destination={destinationHub}
              vehicles={selectedVehicleLabels}
            />
          </div>
        )}
        <p className="mb-4 text-sm text-content-muted">
          {freeSpaces(s, destination)} bookable spaces at destination
        </p>
        {vehicles.length > 0 && !valid && (
          <Alert tone="error">
            The selected vehicle or route is unavailable. Review the current
            choices.
          </Alert>
        )}
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex flex-wrap justify-end gap-2 max-[600px]:flex-nowrap max-[600px]:*:data-[slot~=button]:flex-1 max-[600px]:*:data-[slot~=button]:min-w-0">
          {review && (
            <Button
              variant="secondary"
              type="button"
              disabled={busy}
              onClick={() => setReview(false)}
            >
              Edit
            </Button>
          )}
          <Button disabled={!valid || busy} type="submit">
            {review
              ? vehicles.length > 1
                ? `Confirm ${vehicles.length}`
                : "Confirm"
              : "Review"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
