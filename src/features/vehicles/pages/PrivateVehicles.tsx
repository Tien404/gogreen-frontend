import { config } from "@/config/app";
import { Icon } from "@/shared/components/Icon";
import {
  Alert,
  Battery,
  Button,
  Field,
  Link,
  Modal,
  PageTitle,
} from "@/shared/ui";
import { usePrivateVehicles } from "../hooks/usePrivateVehicles";

export function PrivateVehicles() {
  const { s, open, setOpen, error, registerVehicle } = usePrivateVehicles();

  return (
    <>
      <PageTitle
        title="Your private vehicles"
        description="Your own vehicles, ready for campus parking and charging."
        action={
          <Button onClick={() => setOpen(true)}>
            <Icon name="plus" />
            Add vehicle
          </Button>
        }
      />
      <Alert>
        Private vehicles belong to your account. They are separate from shared
        rentals and operator dispatch.
      </Alert>
      <div className="grid grid-cols-3 gap-5 max-[1200px]:grid-cols-2 max-[600px]:grid-cols-1">
        {s.privateVehicles
          .filter((v) => v.owner === s.persona)
          .map((v) => (
            <section
              data-slot="panel"
              className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
              key={v.id}
            >
              <div className="h-37.5 rounded-xs bg-soft flex items-center justify-center text-accent relative mb-5 [&_>_svg]:w-27.5 [&_>_svg]:h-27.5">
                <Icon name="bike" size={96} />
                <span className="absolute bottom-3 left-3 text-xs bg-panel/80 rounded-xs text-content-muted py-1 px-2">
                  Private {v.type}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <h3>{v.identifier}</h3>
                <Battery value={v.battery} />
              </div>
              <p className="leading-[1.65] mt-1 mb-3 mx-0">
                {v.id} · Your private vehicle
              </p>
              <Link
                to="/student/parking/new"
                data-slot="button"
                className="active:translate-y-px inline-flex items-center justify-center gap-2 min-h-11 rounded-xs text-sm font-medium leading-[24px] whitespace-normal bg-surface-inset text-content [&:hover:not(:disabled)]:bg-soft w-full mt-5 py-2 px-5"
              >
                Book parking <Icon name="arrow" size={16} />
              </Link>
            </section>
          ))}
      </div>
      <Modal
        title="Add a private vehicle"
        description="Use a fictional identifier. All information stays in this browser session."
        open={open}
        onOpenChange={setOpen}
      >
        <form onSubmit={registerVehicle}>
          <Field label="Vehicle identifier">
            <input
              name="identifier"
              placeholder="e.g. CAMPUS-215"
              required
              maxLength={30}
              className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full placeholder:text-content-muted hover:bg-soft py-2 px-3"
            />
          </Field>
          <Field label="Vehicle type">
            <select
              name="vehicleType"
              className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
            >
              {config.vehicleTypes.map((vehicleType) => (
                <option key={vehicleType}>{vehicleType}</option>
              ))}
            </select>
          </Field>
          <Field label="Battery (%)">
            <input
              name="battery"
              type="number"
              required
              min="0"
              max="100"
              defaultValue="60"
              className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full placeholder:text-content-muted hover:bg-soft py-2 px-3"
            />
          </Field>
          {error && <Alert tone="error">{error}</Alert>}
          <Button type="submit">Add private vehicle</Button>
        </form>
      </Modal>
    </>
  );
}
