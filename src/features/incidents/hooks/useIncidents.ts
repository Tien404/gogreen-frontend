import { useApp } from "@/app/providers/AppContext";
import type { FormEvent } from "react";
import { useState } from "react";

export function useIncidents() {
  const { s, act } = useApp();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("open");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [resolve, setResolve] = useState("");

  const items = s.incidents.filter(
    (i) =>
      (filter === "all" || i.status === filter) &&
      `${i.id} ${i.resource} ${i.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const reportIncident = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const f = new FormData(e.currentTarget);

    const r = act({
      type: "incident",
      resource: f.get("resource"),
      severity: f.get("severity"),
      incidentType: f.get("type"),
      description: f.get("description"),
    });

    setError(r.error ? r.message : "");

    if (!r.error) setOpen(false);
  };

  const resolveIncident = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const r = act({
      type: "resolve",
      id: resolve,
      reason: new FormData(e.currentTarget).get("reason"),
    });

    setError(r.error ? r.message : "");

    if (!r.error) setResolve("");
  };

  return {
    s,
    open,
    setOpen,
    filter,
    setFilter,
    search,
    setSearch,
    error,
    resolve,
    setResolve,
    items,
    reportIncident,
    resolveIncident,
  };
}

export type IncidentsModel = ReturnType<typeof useIncidents>;
