import { studentDate } from "@/integration/studentData";
import { StudentData } from "@/integration/StudentScreenData";
import { Icon } from "@/shared/components/Icon";
import { parseTime } from "@/shared/lib/time";
import {
  Alert,
  Button,
  Field,
  Modal,
  PageTitle,
  SectionHead,
} from "@/shared/ui";
import { useParkingNew } from "../hooks/useParkingNew";
export function ParkingNew() {
  return (
    <StudentData screen="newParking">
      <ParkingNewView />
    </StudentData>
  );
}
function ParkingNewView() {
  const {
    s,
    error,
    service,
    hub,
    setHub,
    start,
    setStart,
    end,
    setEnd,
    review,
    setReview,
    vehicle,
    setVehicle,
    busy,
    submit,
    submitParking,
  } = useParkingNew();
  return (
    <>
      <PageTitle
        title="A space for your day."
        description={"Book parking for your private vehicle."}
      />
      <div
        data-slot="two-col"
        className="grid grid-cols-2 gap-5 max-[900px]:gap-4 max-[600px]:grid-cols-1"
      >
        <section
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
        >
          <form onSubmit={submitParking}>
            <Field label="Your private vehicle">
              <select
                required
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
              >
                <option value="">Select vehicle</option>
                {s.privateVehicles
                  .filter((v) => v.owner === s.persona)
                  .map((v) => (
                    <option value={v.id} key={v.id}>
                      {v.identifier} · {v.type}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Hub">
              <select
                value={hub}
                onChange={(e) => setHub(e.target.value)}
                className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
              >
                {s.hubs.map((h) => (
                  <option value={h.id} key={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </Field>
            <div
              data-slot="two-col"
              className="grid grid-cols-2 gap-4 **:data-[slot~=two-col]:gap-4 [&_>_[data-slot~=panel]_>_p]:mt-3 [&_>_[data-slot~=panel]_>_p]:mb-5 max-[900px]:gap-4 max-[600px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1 [&_>_[data-slot~=panel]_>_p]:mx-0"
            >
              <Field label="Start · Asia/Ho_Chi_Minh">
                <input
                  type="datetime-local"
                  required
                  value={start}
                  onChange={(e) => {
                    setStart(e.target.value);
                    setReview(false);
                  }}
                  className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full placeholder:text-content-muted hover:bg-soft py-2 px-3"
                />
              </Field>
              <Field label="End · Asia/Ho_Chi_Minh">
                <input
                  type="datetime-local"
                  required
                  value={end}
                  onChange={(e) => {
                    setEnd(e.target.value);
                    setReview(false);
                  }}
                  className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full placeholder:text-content-muted hover:bg-soft py-2 px-3"
                />
              </Field>
            </div>

            {error && <Alert tone="error">{error}</Alert>}
            <Button type="submit" disabled={!vehicle || !hub}>
              Review interval availability <Icon name="arrow" />
            </Button>
          </form>
        </section>
        <section
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
        >
          <SectionHead title="Booking summary" />
          <dl className="grid grid-cols-[minmax(100px,0.8fr)_1.2fr] gap-4 text-sm **:data-[slot~=badge]:align-top my-5 mx-0">
            <dt className="text-content-muted">Hub</dt>
            <dd className="wrap-anywhere m-0">
              {s.hubs.find((h) => h.id === hub)?.name}
            </dd>
            <dt className="text-content-muted">Service</dt>
            <dd className="wrap-anywhere m-0">{service}</dd>
            <dt className="text-content-muted">Availability</dt>
            <dd className="wrap-anywhere m-0">
              {review
                ? "Checked when you confirm"
                : "Review your selected interval"}
            </dd>
          </dl>
          <Alert>
            The server allocates an available space for your selected interval
            when you confirm.
          </Alert>
        </section>
      </div>
      <Modal
        title="Confirm parking booking"
        description="Review the selected service and whole parking interval."
        open={review}
        onOpenChange={setReview}
      >
        <dl className="grid grid-cols-[minmax(100px,0.8fr)_1.2fr] gap-4 text-sm **:data-[slot~=badge]:align-top my-5 mx-0">
          <dt className="text-content-muted">Vehicle</dt>
          <dd className="wrap-anywhere m-0">{vehicle}</dd>
          <dt className="text-content-muted">Hub</dt>
          <dd className="wrap-anywhere m-0">
            {s.hubs.find((h) => h.id === hub)?.name}
          </dd>
          <dt className="text-content-muted">Interval</dt>
          <dd className="wrap-anywhere m-0">
            {`${studentDate(parseTime(start))} – ${studentDate(parseTime(end))}`}
          </dd>
          <dt className="text-content-muted">Service</dt>
          <dd className="wrap-anywhere m-0">{service}</dd>
        </dl>
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex gap-3 justify-end mt-5 flex-wrap max-[600px]:*:data-[slot~=button]:flex-1">
          <Button disabled={busy} onClick={submit}>
            {busy ? "Confirming…" : "Confirm booking"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
