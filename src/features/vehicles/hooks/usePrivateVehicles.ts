import { readPages } from "@/features/hubs/hubResources";
import { chargingEntry } from "../model/chargingEntry";
import { useRefreshStudentData } from "@/integration/studentRefresh";
import { vehicleTypeCode } from "@/integration/studentRecords";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApp } from "@/app/providers/AppContext";
import type { FormEvent } from "react";
import { useState } from "react";
export function usePrivateVehicles() {
  const { s, api, notify, go } = useApp();
  const refresh = useRefreshStudentData();
  const command = useApiAction();
  const [open, setOpen] = useState(false);
  const [chargingVehicle, setChargingVehicle] = useState<string | null>(null);
  const openCharging = async (vehicleId: string) => {
    if (chargingVehicle) return;
    setChargingVehicle(vehicleId);
    try {
      const [bookings, charges] = await Promise.all([
        readPages((offset, limit) =>
          api.request("GET /parking/reservations", {
            query: { offset, limit },
          }),
        ),
        readPages((offset, limit) =>
          api.request("GET /charging/sessions", { query: { offset, limit } }),
        ),
      ]);
      const entry = chargingEntry(vehicleId, bookings, charges);
      if (entry.available)
        go(
          `/student/charging/new?parking=${encodeURIComponent(entry.parkingId)}`,
        );
      else if (entry.reason === "PARKING_REQUIRED") {
        go(
          `/student/parking/new?${new URLSearchParams({ service: "park-charge", vehicle: vehicleId })}`,
        );
      } else notify(entry.message, "warning");
    } catch (error) {
      notify(apiErrorMessage(error), "error");
    } finally {
      setChargingVehicle(null);
    }
  };
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
      notify("Private vehicle added successfully.", "success");
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
    openCharging,
    chargingVehicle,
  };
}
