import {
  NativeSelect,
  Input,
  Textarea,
  Alert,
  Button,
  Field,
  Modal,
} from "@/shared/ui";

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
          <NativeSelect
            name="resource"
            value={resource}
            onChange={(event) => setResource(event.target.value)}
            required
            wrapperClassName="max-w-full cursor-pointer"
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
          </NativeSelect>
        </Field>
        {resource === "parking" && (
          <>
            <Field label="Hub">
              <NativeSelect name="hub" required wrapperClassName="">
                {s.hubs.map((hub) => (
                  <option value={hub.id} key={hub.id}>
                    {hub.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Parking-space ID">
              <Input name="parking" required maxLength={100} />
            </Field>
          </>
        )}
        <div
          data-slot="two-col"
          className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 [&_>_[data-slot~=panel]_>_p]:mt-3 [&_>_[data-slot~=panel]_>_p]:mb-5 max-[900px]:gap-4 max-[900px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1 [&_>_[data-slot~=panel]_>_p]:mx-0"
        >
          <Field label="Type">
            <NativeSelect
              name="type"
              key={resource}
              defaultValue={type}
              wrapperClassName="max-w-full cursor-pointer"
            >
              <option>Vehicle fault</option>
              <option>Point fault</option>
              <option>Hub capacity</option>
            </NativeSelect>
          </Field>
          <Field label="Severity">
            <NativeSelect
              name="severity"
              wrapperClassName="max-w-full cursor-pointer"
            >
              <option>Medium</option>
              <option>High</option>
              <option>Low</option>
            </NativeSelect>
          </Field>
        </div>
        <Field label="Description">
          <Textarea
            required
            name="description"
            rows={3}
            placeholder="What happened, and what is affected?"
            className="max-w-full resize-y"
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
