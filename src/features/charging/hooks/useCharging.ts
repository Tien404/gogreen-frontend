import { useApp } from "@/app/providers/AppContext";
import { useState } from "react";

export function useCharging(id?: string) {
  const { s, act, go } = useApp();
  const [tab, setTab] = useState("all");

  const operator = s.role === "operator";

  const charges = s.charges.filter((c) => operator || c.owner === s.persona);

  const c = charges.find((c) => c.id === id)!;

  const canAct = c?.owner === (operator ? "operator" : s.persona);

  return { s, act, go, tab, setTab, operator, charges, c, canAct };
}

export type ChargingModel = ReturnType<typeof useCharging>;
