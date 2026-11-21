import { Alert, Button, Field, Modal } from "@/shared/ui";
import type { IncidentsModel } from "../hooks/useIncidents";
type ReportIncidentDialogProps = Pick<
  IncidentsModel,
  | "s"
  | "open"
  | "setOpen"
  | "reportIncident"
  | "error"
  | "busy"
  | "resource"
  | "setResource"
  | "targets"
>;
export function ReportIncidentDialog({
  s,
  open,
  setOpen,
  reportIncident,
  error,
  busy,
  resource,
  setResource,
  targets,
}: ReportIncidentDialogProps) {
  const kind = targets.find((item) => item.key === resource)?.kind;
  const type =
    kind === "point"
      ? "Point fault"
      : resource === "parking"
        ? "Hub capacity"
        : "Vehicle fault";
  return (
    <Modal
      title="Record an incident"
      description="Link a resource and describe the impact on campus operations."
      open={open}
      onOpenChange={setOpen}
    >
      <form onSubmit={reportIncident}>
        <Field label="Affected resource">
          <select
            name="resource"
            value={resource}
            onChange={(event) => setResource(event.target.value)}
            required
            className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
          >
            <option value="">Select hub, vehicle or charging point</option>
            {
              <>
                {targets.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
                <option value="parking">Parking space · enter ID</option>
              </>
            }
          </select>
        </Field>
        {resource === "parking" && (
          <>
            <Field label="Hub">
              <select
                name="hub"
                required
                className="min-h-11 rounded-xs border border-control-border bg-panel px-3"
              >
                {s.hubs.map((hub) => (
                  <option value={hub.id} key={hub.id}>
                    {hub.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Parking-space ID">
              <input
                name="parking"
                required
                maxLength={100}
                className="min-h-11 rounded-xs border border-control-border bg-panel px-3"
              />
            </Field>
          </>
        )}
        <div
          data-slot="two-col"
          className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 [&_>_[data-slot~=panel]_>_p]:mt-3 [&_>_[data-slot~=panel]_>_p]:mb-5 max-[900px]:gap-4 max-[600px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1 [&_>_[data-slot~=panel]_>_p]:mx-0"
        >
          <Field label="Type">
            <select
              name="type"
              key={resource}
              defaultValue={type}
              className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
            >
              <option>Vehicle fault</option>
              <option>Point fault</option>
              <option>Hub capacity</option>
            </select>
          </Field>
          <Field label="Severity">
            <select
              name="severity"
              className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
            >
              <option>Medium</option>
              <option>High</option>
              <option>Low</option>
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea
            required
            name="description"
            rows={3}
            placeholder="What happened, and what is affected?"
            className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full placeholder:text-content-muted hover:bg-soft resize-y py-2 px-3"
          />
        </Field>
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" disabled={busy}>
          Record incident
        </Button>
      </form>
    </Modal>
  );
}
