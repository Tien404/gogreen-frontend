import { parkingLabel, vehicleLabel } from "@/integration/recordLabels";
import { campusInputToIso, recordUrl } from "@/integration/studentRecords";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { useSearchParams } from "react-router";
import { useApp } from "@/app/providers/AppContext";
import type { FormEvent } from "react";
import { useState } from "react";
export function useChargeForm({ onDone }: { onDone?: (id: string) => void }) {
  const { s, go, api, notify } = useApp();
  const [params] = useSearchParams();
  const command = useApiAction();
  const student = s.role === "student";
  const eligible = s.bookings
    .filter(
      (booking) =>
        booking.owner === s.persona &&
        ["confirmed", "checked-in"].includes(booking.status),
    )
    .map((booking) => ({
      id: booking.vehicle,
      label: `${vehicleLabel(s, booking.vehicle)} · ${parkingLabel(s, booking)}`,
      booking: booking.id,
      hub: booking.hub,
    }));
  const [choice, setChoice] = useState(
    eligible.find((row) => row.booking === params.get("parking"))?.booking ??
      eligible[0]?.booking ??
      "",
  );
  const [needBy, setNeedBy] = useState("");
  const [target, setTarget] = useState(80);
  const [error, setError] = useState("");
  const selected = eligible.find((e) => e.booking === choice);
  const requestCharge = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;
    command.setError(null);
    const battery = s.privateVehicles.find(
      (vehicle) => vehicle.id === selected.id,
    )?.battery;
    if (battery != null && target <= battery) {
      setError("Target battery must exceed the current battery.");
      return;
    }
    setError("");
    const result = await command.run(() =>
      api.request("POST /charging/sessions", {
        body: {
          vehicle_id: selected.id,
          parking_reservation_id: selected.booking,
          target_battery_pct: target,
          need_by: needBy ? campusInputToIso(needBy) : undefined,
        },
      }),
    );
    if (result.ok) {
      if (!student)
        notify("Charging request submitted successfully.", "success");
      if (onDone) onDone(result.data.session_id);
      else go(recordUrl("charging", result.data.session_id));
    }
    return;
  };
  return {
    student,
    hub: selected?.hub,
    selectedContext: selected
      ? {
          vehicle: vehicleLabel(s, selected.id),
          parking: parkingLabel(
            s,
            s.bookings.find((booking) => booking.id === selected.booking)!,
          ),
          battery:
            s.privateVehicles.find((vehicle) => vehicle.id === selected.id)
              ?.battery ?? null,
          hub:
            s.hubs.find(
              (hub) =>
                hub.id ===
                s.bookings.find((booking) => booking.id === selected.booking)
                  ?.hub,
            )?.name ?? "Unknown hub",
        }
      : null,

    needBy,
    setNeedBy,
    validChoice: Boolean(selected),
    eligible,
    choice,
    setChoice,
    target,
    setTarget,
    error: command.error ? apiErrorMessage(command.error) : error,
    busy: command.busy,
    requestCharge,
  };
}
