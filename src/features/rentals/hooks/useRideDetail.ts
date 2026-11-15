import { useApp } from "@/app/providers/AppContext";
import { useState } from "react";

export function useRideDetail({ id }: { id: string }) {
  const { s, act } = useApp();

  const r = s.rides.find((r) => r.id === id && r.owner === s.persona)!;

  const [destination, setDestination] = useState(r?.destination ?? "library");
  const [error, setError] = useState("");

  const v = s.vehicles.find((v) => v.id === r?.vehicle)!;

  const handleConfirm1 = () => {
    const result = act({ type: "return", id: r.id, destination });

    setError(result.error ? result.message : "");
  };

  return {
    s,
    r,
    destination,
    setDestination,
    error,
    setError,
    v,
    handleConfirm1,
  };
}
