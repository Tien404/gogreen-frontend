import { useApp } from "@/app/providers/AppContext";
import type { FormEvent } from "react";
import { useState } from "react";

export function useDispatches({ id }: { id?: string }) {
  const { s, act, go } = useApp();
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("north");
  const [destination, setDestination] = useState("library");
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [review, setReview] = useState(false);
  const [recover, setRecover] = useState("science");

  const d = s.dispatches.find((d) => d.id === id)!;

  const action = (type: string) => {
    const r = act({ type, id: d?.id, destination: recover });

    setError(r.error ? r.message : "");
  };

  const submitDispatch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!review) {
      setReview(true);

      return;
    }

    const r = act({ type: "dispatch", source, destination, vehicles });

    setError(r.error ? r.message : "");

    if (r.id) go(`/operator/dispatch/${r.id}`);
  };

  return {
    s,
    open,
    setOpen,
    source,
    setSource,
    destination,
    setDestination,
    vehicles,
    setVehicles,
    error,
    review,
    setReview,
    recover,
    setRecover,
    d,
    action,
    submitDispatch,
  };
}

export type DispatchesModel = ReturnType<typeof useDispatches>;
