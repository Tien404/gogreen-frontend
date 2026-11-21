import { useApp } from "@/app/providers/AppContext";
import { currentProfile } from "@/domain/identity";
import { useState } from "react";
export function useActivity() {
  const { s } = useApp();
  const [filter, setFilter] = useState("");
  const [outcome, setOutcome] = useState("all");
  const search = filter.toLowerCase().replaceAll(/[-_]/g, " ");
  const items = s.activity.filter(
    (a) =>
      (s.role === "operator" ||
        a.persona === s.persona ||
        (!a.persona && a.actor === currentProfile(s).name)) &&
      `${a.action} ${a.resource} ${a.reason}`
        .toLowerCase()
        .replaceAll(/[-_]/g, " ")
        .includes(search) &&
      (outcome === "all" || a.result === outcome),
  );
  return { s, filter, setFilter, outcome, setOutcome, items };
}
