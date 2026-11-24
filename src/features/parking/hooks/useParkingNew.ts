import { campusInputToIso, recordUrl } from "@/integration/studentRecords";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { useApp } from "@/app/providers/AppContext";
import { inputTime } from "@/shared/lib/time";
import { moveParkingInterval, parkingIntervalErrors } from "../model/interval";
import { useSearchParams } from "react-router";
import type { Schemas } from "@/shared/api/contract.generated";
import { parkAndCharge, type ParkAndChargeInput } from "../model/parkAndCharge";
import type { FormEvent } from "react";
import { useState } from "react";
export function useParkingNew() {
  const { s, go, api, notify } = useApp();
  const command = useApiAction();
  const initialStart = Math.floor(s.clock) + 5;
  const [attemptedReview, setAttemptedReview] = useState(false);
  const [params] = useSearchParams();
  const [withCharging, setWithCharging] = useState(
    params.get("service") === "park-charge",
  );
  const [target, setTarget] = useState(80);
  const [needBy, setNeedBy] = useState("");
  const [validationError, setValidationError] = useState("");
  const [createdParking, setCreatedParking] = useState<
    Schemas["ParkingReservationOut"] | null
  >(null);
  const [savedInput, setSavedInput] = useState<ParkAndChargeInput | null>(null);
  const [chargingError, setChargingError] = useState("");
  const service = withCharging ? "Parking + charging request" : "Parking only";
  const [hub, setHub] = useState(
    s.hubs.find((h) => h.id === "north")?.id ?? s.hubs[0]?.id ?? "",
  );
  const [start, setStart] = useState(inputTime(initialStart));
  const [end, setEnd] = useState(inputTime(initialStart + 60));
  const [review, setReview] = useState(false);
  const [vehicle, setVehicle] = useState(
    s.privateVehicles.find(
      (v) => v.owner === s.persona && v.id === params.get("vehicle"),
    )?.id ??
      s.privateVehicles.find((v) => v.owner === s.persona)?.id ??
      "",
  );
  const intervalErrors = parkingIntervalErrors(start, end, s.clock);
  const valid = !intervalErrors.start && !intervalErrors.end;
  const chargeInputError = () => {
    const battery = s.privateVehicles.find((v) => v.id === vehicle)?.battery;
    if (
      withCharging &&
      (!Number.isFinite(target) ||
        target < 1 ||
        target > 100 ||
        (battery != null && target <= battery))
    )
      return "Charging target must be between 1 and 100% and exceed the current battery.";
    return "";
  };
  const submit = async () => {
    if (!createdParking) {
      setAttemptedReview(true);
      const message = chargeInputError();
      setValidationError(message);
      if (!valid || message) {
        setReview(false);
        return;
      }
    }
    const result = await command.run(async () => {
      const input = (createdParking ? savedInput : null) ?? {
        parking: {
          hub_id: hub,
          vehicle_id: vehicle,
          starts_at: campusInputToIso(start),
          ends_at: campusInputToIso(end),
        },
        charging: withCharging
          ? {
              target_battery_pct: target,
              need_by: needBy ? campusInputToIso(needBy) : undefined,
            }
          : undefined,
      };
      setSavedInput(input);
      return parkAndCharge(
        api,
        input,
        setCreatedParking,
        createdParking ?? undefined,
      );
    });
    if (result.ok) {
      setReview(false);
      if (result.data.status === "partial") {
        setChargingError(apiErrorMessage(result.data.error));
        notify(
          "Parking booked; charging request failed. You can retry charging without booking again.",
          "warning",
        );
      } else {
        setChargingError("");
        notify(
          withCharging
            ? "Parking booked and charging requested. Check your server-assigned schedule in the booking."
            : "Parking space reserved successfully.",
          "success",
        );
        go(recordUrl("parking", result.data.parking.reservation_id));
      }
    }
  };
  const cancelCreatedParking = async () => {
    if (!createdParking) return;
    const result = await command.run(() =>
      api.request("POST /parking/reservations/{reservation_id}/cancel", {
        params: { reservation_id: createdParking.reservation_id },
      }),
    );
    if (result.ok) {
      notify("Parking booking cancelled.", "info");
      go(recordUrl("parking", createdParking.reservation_id));
    }
  };
  const submitParking = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAttemptedReview(true);
    const message = chargeInputError();
    setValidationError(message);
    if (!valid || message) return;
    command.setError(null);
    setReview(true);
  };
  return {
    s,

    error: command.error ? apiErrorMessage(command.error) : validationError,
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
    withCharging,
    setWithCharging: (next: boolean) => {
      setWithCharging(next);
      setValidationError("");
      command.setError(null);
    },
    target,
    setTarget,
    needBy,
    setNeedBy,
    createdParking,
    chargingError,
    cancelCreatedParking,
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
    setReview: (next: boolean) => {
      if (!command.busy) setReview(next);
    },
    vehicle,
    setVehicle,
    busy: command.busy,
    submit,
    submitParking,
  };
}
