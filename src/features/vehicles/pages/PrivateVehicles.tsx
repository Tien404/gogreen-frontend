import {
  Panel,
  Input,
  NativeSelect,
  Alert,
  Battery,
  Button,
  Empty,
  Field,
  Link,
  Modal,
  PageTitle,
} from "@/shared/ui";
import { StudentData } from "@/integration/StudentScreenData";
import { config } from "@/config/app";
import { Icon } from "@/shared/components/Icon";

import { usePrivateVehicles } from "../hooks/usePrivateVehicles";
export function PrivateVehicles() {
  return (
    <StudentData screen="privateVehicles">
      <PrivateVehiclesView />
    </StudentData>
  );
}
function PrivateVehiclesView() {
  const { s, open, setOpen, error, registerVehicle, busy } =
    usePrivateVehicles();
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
      {!s.privateVehicles.length && (
        <Empty
          title="No private vehicles"
          text="Add a vehicle to book parking."
        />
      )}
      <div className="grid grid-cols-3 gap-5 max-[1200px]:grid-cols-2 max-[600px]:grid-cols-1">
        {s.privateVehicles
          .filter((v) => v.owner === s.persona)
          .map((v) => (
            <Panel data-slot="panel" className="min-w-0" key={v.id}>
              <div className="h-37.5 rounded-lg bg-soft flex items-center justify-center text-primary relative mb-5 [&_>_svg]:w-27.5 [&_>_svg]:h-27.5">
                <Icon name="bike" size={96} />
                <span className="absolute bottom-3 left-3 text-sm bg-panel/80 rounded-lg text-content-muted py-1 px-2">
                  Private {v.type}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="min-w-0 wrap-anywhere">{v.identifier}</h3>
                <Battery value={v.battery} />
              </div>
              <p className="leading-[1.65] mt-1 mb-3 mx-0">
                {v.id} · Your private vehicle
              </p>
              <Link
                to="/student/parking/new"
                data-slot="button"
                className="active:translate-y-px inline-flex items-center justify-center gap-2 min-h-11 rounded-lg text-sm font-medium leading-[24px] whitespace-normal bg-surface-inset text-content [&:hover:not(:disabled)]:bg-soft w-full mt-5 py-2 px-5"
              >
                Book parking <Icon name="arrow" size={16} />
              </Link>
            </Panel>
          ))}
      </div>
      <Modal
        title="Add a private vehicle"
        description={
          "Register a vehicle identifier for campus parking and charging."
        }
        open={open}
        onOpenChange={setOpen}
      >
        <form onSubmit={registerVehicle}>
          <Field label="Vehicle identifier">
            <Input
              name="identifier"
              placeholder="e.g. CAMPUS-215"
              required
              maxLength={30}
              className="max-w-full"
            />
          </Field>
          <Field label="Vehicle type">
            <NativeSelect
              name="vehicleType"
              wrapperClassName="max-w-full cursor-pointer"
            >
              {config.vehicleTypes.map((vehicleType) => (
                <option key={vehicleType}>{vehicleType}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Battery (%)">
            <Input
              name="battery"
              type="number"
              required
              min="0"
              max="100"
              defaultValue="60"
              className="max-w-full"
            />
          </Field>
          {error && <Alert tone="error">{error}</Alert>}
          <Button type="submit" disabled={busy}>
            Add private vehicle
          </Button>
        </form>
      </Modal>
    </>
  );
}
