import { PageTitle } from "@/shared/ui";
import { OperatorScreenData } from "@/integration/OperatorScreenData";

import { VehicleTable } from "../components/VehicleTable";
export function Fleet() {
  return (
    <>
      <PageTitle title="Shared fleet" />
      <OperatorScreenData>
        <VehicleTable />
      </OperatorScreenData>
    </>
  );
}
