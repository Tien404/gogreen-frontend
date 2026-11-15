import { useApp } from "@/app/providers/AppContext";
import type { FormEvent } from "react";
import { useState } from "react";

export function usePrivateVehicles() {
  const { s, act } = useApp();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const registerVehicle = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const f = new FormData(e.currentTarget);

    const r = act({
      type: "add-vehicle",
      identifier: f.get("identifier"),
      vehicleType: f.get("vehicleType"),
      battery: Number(f.get("battery")),
    });

    setError(r.error ? r.message : "");

    if (!r.error) setOpen(false);
  };

  return { s, open, setOpen, error, registerVehicle };
}
