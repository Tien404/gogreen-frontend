import { useApp } from "@/app/providers/AppContext";
import { inputTime, parseTime } from "@/shared/lib/time";
import type { FormEvent } from "react";
import { useState } from "react";

export function useParkingNew() {
  const { s, act, go } = useApp();
  const [error, setError] = useState("");
  const [service, setService] = useState("Parking only");
  const [hub, setHub] = useState("north");
  const [start, setStart] = useState(inputTime(s.clock));
  const [end, setEnd] = useState(inputTime(s.clock + 60));
  const [review, setReview] = useState(false);
  const [vehicle, setVehicle] = useState(
    s.privateVehicles.find((v) => v.owner === s.persona)?.id ?? "",
  );
  const [busy, setBusy] = useState(false);

  const valid =
    Number.isFinite(parseTime(start)) &&
    parseTime(start) >= s.clock &&
    parseTime(end) > parseTime(start);

  const submit = () => {
    setBusy(true);
    setTimeout(() => {
      const r = act({
        type: "book",
        vehicle,
        hub,
        start: parseTime(start),
        end: parseTime(end),
        service,
      });

      setBusy(false);
      setError(r.error ? r.message : "");

      if (r.id) go(`/student/parking/${r.id}`);
    }, 200);
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
    setReview(true);
  };

  return {
    s,
    error,
    setError,
    service,
    setService,
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
    busy,
    submit,
    submitParking,
  };
}
