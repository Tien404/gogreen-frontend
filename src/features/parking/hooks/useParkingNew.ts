import { campusInputToIso, recordUrl } from "@/integration/studentRecords";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApp } from "@/app/providers/AppContext";
import { inputTime, parseTime } from "@/shared/lib/time";
import type { FormEvent } from "react";
import { useState } from "react";
export function useParkingNew() {
  const { s, go, api } = useApp();
  const command = useApiAction();
  const initialStart = Math.ceil(s.clock);
  const [error, setError] = useState("");
  const service = "Parking only";
  const [hub, setHub] = useState(
    s.hubs.find((h) => h.id === "north")?.id ?? s.hubs[0]?.id ?? "",
  );
  const [start, setStart] = useState(inputTime(initialStart));
  const [end, setEnd] = useState(inputTime(initialStart + 60));
  const [review, setReview] = useState(false);
  const [vehicle, setVehicle] = useState(
    s.privateVehicles.find((v) => v.owner === s.persona)?.id ?? "",
  );
  const valid =
    Number.isFinite(parseTime(start)) &&
    parseTime(start) >= s.clock &&
    parseTime(end) > parseTime(start);
  const submit = async () => {
    const result = await command.run(() =>
      api.request("POST /parking/reservations", {
        body: {
          hub_id: hub,
          vehicle_id: vehicle,
          starts_at: campusInputToIso(start),
          ends_at: campusInputToIso(end),
        },
      }),
    );
    if (result.ok) go(recordUrl("parking", result.data.reservation_id));
    return;
  };
  const submitParking = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid) {
      setError(
        "End must follow start; start must not precede the current time.",
      );
      return;
    }
    setError("");
    command.setError(null);
    setReview(true);
  };
  return {
    s,

    error: command.error ? apiErrorMessage(command.error) : error,
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
    busy: command.busy,
    submit,
    submitParking,
  };
}
