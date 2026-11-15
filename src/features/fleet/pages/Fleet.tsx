import { PageTitle } from "@/shared/ui";
import { VehicleTable } from "../components/VehicleTable";

export function Fleet() {
  return (
    <>
      <PageTitle
        title="Shared fleet"
        description="Inspect vehicles, batteries and availability across the campus network."
      />
      <section
        data-slot="panel"
        className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <VehicleTable />
      </section>
    </>
  );
}
