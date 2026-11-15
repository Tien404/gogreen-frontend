import { useApp } from "@/app/providers/AppContext";
import { mapOwnedVehicle } from "@/integration/studentRecords";
import { ApiErrorNotice } from "@/shared/api/ApiFeedback";
import { inputClass, panelClass, recordRowClass, RecordFeedback } from "@/shared/api/ApiRecordUi";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApiQuery } from "@/shared/api/useApiQuery";
import { Button, Empty, Field, PageTitle, SectionHead } from "@/shared/ui";
import { useCallback, type FormEvent } from "react";

export function ApiPrivateVehicles() {
  const { api, notify } = useApp();
  const action = useApiAction();
  const load = useCallback(async (signal: AbortSignal) =>
    (await api!.request("GET /fleet/vehicles/private", { signal })).map(mapOwnedVehicle), [api]);
  const query = useApiQuery(load, { retain: true });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const battery = String(fields.get("battery_pct") ?? "");
    const result = await action.run(() => api!.request("POST /fleet/vehicles/private", {
      body: {
        license_plate: String(fields.get("license_plate") ?? "").trim(),
        vehicle_type: String(fields.get("vehicle_type")),
        battery_pct: battery === "" ? null : Number(battery),
      },
    }));
    if (result.ok) {
      form.reset();
      notify("Vehicle added.");
      query.retry();
    }
  }

  return (
    <>
      <PageTitle title="Your private vehicles" description="Register the vehicles you use for campus parking and charging." />
      <section data-slot="panel" className={panelClass}>
        <SectionHead title="Registered vehicles" />
        <RecordFeedback query={query} item="private vehicles" />
        {query.result.status === "ready" && (query.result.data.length ? (
          <ul>
            {query.result.data.map((vehicle) => (
              <li key={vehicle.id} className={recordRowClass}>
                <strong>{vehicle.label}</strong>
                <span>{vehicle.type ?? "Private vehicle"} · {vehicle.battery == null ? "Battery unknown" : `${vehicle.battery}% battery`}</span>
              </li>
            ))}
          </ul>
        ) : <Empty title="No private vehicles" text="Add a vehicle below to book parking." />)}
      </section>
      <section data-slot="panel" className={panelClass}>
        <SectionHead title="Add a private vehicle" />
        <form onSubmit={submit} className="max-w-120">
          <fieldset disabled={action.busy} className="border-0 p-0">
            <Field label="Vehicle identifier">
              <input className={inputClass} name="license_plate" required pattern=".*\S.*" />
            </Field>
            <Field label="Vehicle type">
              <select className={inputClass} name="vehicle_type" required defaultValue="e-bike">
                <option value="e-bike">Electric bicycle</option>
                <option value="e-motorcycle">Electric motorcycle</option>
              </select>
            </Field>
            <Field label="Battery (%)">
              <input className={inputClass} type="number" name="battery_pct" min="0" max="100" step="any" />
            </Field>
            <ApiErrorNotice error={action.error} />
            <Button type="submit">{action.busy ? "Adding…" : "Add vehicle"}</Button>
          </fieldset>
        </form>
      </section>
    </>
  );
}
