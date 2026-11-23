import { PageTitle } from "@/shared/ui";
import { OperatorScreenData } from "@/integration/OperatorScreenData";

import { VehicleTable } from "../components/VehicleTable";
export function Fleet() {
  return (
    <>
      <PageTitle
        title="Shared fleet"
        description="Inspect vehicles, batteries and availability across the campus network."
      />
      <OperatorScreenData>
        <VehicleTable />
      </OperatorScreenData>
    </>
  );
}
