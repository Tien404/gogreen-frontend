import { useApp } from "@/app/providers/AppContext";
import { scenarioFixtures, scenarioTypes } from "@/mocks/scenarios";
import type { FormEvent } from "react";
import { useState } from "react";

export function useWhatIf(id?: string) {
  const { s, act, go } = useApp();
  const [type, setType] = useState(scenarioTypes[0]);
  const [hub, setHub] = useState(scenarioFixtures[scenarioTypes[0]].hub);
  const [horizon, setHorizon] = useState("60");
  const [demand, setDemand] = useState("standard");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const r = s.runs.find((r) => r.id === id)!;

  const result = scenarioFixtures[r?.type ?? "Demand surge"];

  const runScenario = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (demand !== "standard") {
      setError(
        "No mock result for this configuration. Choose Standard supported preset.",
      );

      return;
    }

    setBusy(true);
    setError("");
    setTimeout(() => {
      const result = act({
        type: "run",
        scenarioType: type,
        hub,
        horizon,
        demand,
      });

      setBusy(false);

      if (result.id) go(`/operator/what-if/runs/${result.id}`);
    }, 800);
  };

  return {
    s,
    act,
    go,
    type,
    setType,
    hub,
    setHub,
    horizon,
    setHorizon,
    demand,
    setDemand,
    busy,
    error,
    setError,
    r,
    result,
    runScenario,
  };
}

export type WhatIfModel = ReturnType<typeof useWhatIf>;
