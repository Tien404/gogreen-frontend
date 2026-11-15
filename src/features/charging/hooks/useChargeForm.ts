import { useApp } from "@/app/providers/AppContext";
import type { FormEvent } from "react";
import { useState } from "react";

export function useChargeForm({ onDone }: { onDone?: (id: string) => void }) {
  const { s, act, go } = useApp();

  const student = s.role === "student";

  const eligible = student
    ? s.bookings
        .filter(
          (b) =>
            b.owner === s.persona &&
            ["confirmed", "checked-in", "overstaying"].includes(b.status),
        )
        .map((b) => ({
          id: b.vehicle,
          label: `${b.vehicle} · ${b.id}`,
          booking: b.id,
        }))
    : s.vehicles
        .filter(
          (v) =>
            v.status === "available" && v.hub && v.battery !== null && !v.stale,
        )
        .map((v) => ({
          id: v.id,
          label: `${v.id} · ${v.battery}%`,
          booking: "",
        }));

  const [choice, setChoice] = useState(eligible[0]?.label ?? "");
  const [target, setTarget] = useState(80);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const selected = eligible.find((e) => e.label === choice);

  const requestCharge = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      const r = act({
        type: "request-charge",
        vehicle: selected?.id,
        booking: selected?.booking,
        target,
      });

      setBusy(false);
      setError(r.error ? r.message : "");

      if (r.id) {
        if (onDone) onDone(r.id);
        else go(`/student/charging/${r.id}`);
      }
    }, 200);
  };

  return {
    student,
    eligible,
    choice,
    setChoice,
    target,
    setTarget,
    error,
    busy,
    requestCharge,
  };
}
