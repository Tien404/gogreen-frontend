import { campusInputToIso, recordUrl } from "@/integration/studentRecords";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApp } from "@/app/providers/AppContext";
import { inputTime } from "@/shared/lib/time";
import { moveParkingInterval, parkingIntervalErrors } from "../model/interval";
import type { FormEvent } from "react";
import { useState } from "react";
export function useParkingNew() {
  const { s, go, api, notify } = useApp();
  const command = useApiAction();
  const initialStart = Math.floor(s.clock) + 5;
  const [attemptedReview, setAttemptedReview] = useState(false);
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
  const intervalErrors = parkingIntervalErrors(start, end, s.clock);
  const valid = !intervalErrors.start && !intervalErrors.end;
  const submit = async () => {
    setAttemptedReview(true);
    if (!valid) {
      setReview(false);
      return;
    }
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
    if (result.ok) {
      notify("Parking space reserved successfully.", "success");
      go(recordUrl("parking", result.data.reservation_id));
    }
    return;
  };
  const submitParking = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAttemptedReview(true);
    if (!valid) return;
    command.setError(null);
    setReview(true);
  };
  return {
    s,

    error: command.error ? apiErrorMessage(command.error) : "",
    startError: attemptedReview ? intervalErrors.start : undefined,
    endError: attemptedReview ? intervalErrors.end : undefined,
    moveIntervalForward: () => {
      const next = moveParkingInterval(start, end, s.clock);
      setStart(next.start);
      setEnd(next.end);
      setReview(false);
      command.setError(null);
    },
    service,
    hub,
    setHub,
    start,
    setStart: (value: string) => {
      setStart(value);
      command.setError(null);
    },
    end,
    setEnd: (value: string) => {
      setEnd(value);
      command.setError(null);
    },
    review,
    setReview,
    vehicle,
    setVehicle,
    busy: command.busy,
    submit,
    submitParking,
  };
}
