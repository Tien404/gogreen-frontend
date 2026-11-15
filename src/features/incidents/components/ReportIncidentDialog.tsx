import { pointId } from "@/domain/selectors";
import { Alert, Button, Field, Modal } from "@/shared/ui";
import type { IncidentsModel } from "../hooks/useIncidents";

type ReportIncidentDialogProps = Pick<
  IncidentsModel,
  "s" | "open" | "setOpen" | "reportIncident" | "error"
>;

export function ReportIncidentDialog({
  s,
  open,
  setOpen,
  reportIncident,
  error,
}: ReportIncidentDialogProps) {
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
            required
            className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
          >
            <option value="">Select hub, vehicle or charging point</option>
            {s.hubs.map((h) => (
              <option key={h.id}>{h.name}</option>
            ))}
            {s.hubs.map((h) => (
              <option key={`${h.id}-point`}>
                {h.name} · {pointId(h.id, 0)}
              </option>
            ))}
            {s.vehicles.map((v) => (
              <option key={v.id}>{v.id}</option>
            ))}
          </select>
        </Field>
        <div
          data-slot="two-col"
          className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 [&_>_[data-slot~=panel]_>_p]:mt-3 [&_>_[data-slot~=panel]_>_p]:mb-5 max-[900px]:gap-4 max-[600px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1 [&_>_[data-slot~=panel]_>_p]:mx-0"
        >
          <Field label="Type">
            <select
              name="type"
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
        <Button type="submit">Record incident</Button>
      </form>
    </Modal>
  );
}
