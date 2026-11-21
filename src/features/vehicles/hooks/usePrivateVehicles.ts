import { useRefreshStudentData } from "@/integration/studentRefresh";
import { vehicleTypeCode } from "@/integration/studentRecords";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApp } from "@/app/providers/AppContext";
import type { FormEvent } from "react";
import { useState } from "react";
export function usePrivateVehicles() {
  const { s, api } = useApp();
  const refresh = useRefreshStudentData();
  const command = useApiAction();
  const [open, setOpen] = useState(false);
  const registerVehicle = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const result = await command.run(() =>
      api.request("POST /fleet/vehicles/private", {
        body: {
          license_plate: String(f.get("identifier") ?? "").trim(),
          vehicle_type: vehicleTypeCode(String(f.get("vehicleType"))),
          battery_pct: Number(f.get("battery")),
        },
      }),
    );
    if (result.ok) {
      refresh?.();
      setOpen(false);
    }
    return;
  };
  return {
    s,
    open,

    busy: command.busy,
    setOpen: (next: boolean) => {
      setOpen(next);
      command.setError(null);
    },
    error: command.error ? apiErrorMessage(command.error) : "",
    registerVehicle,
  };
}
