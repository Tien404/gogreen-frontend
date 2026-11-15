import { useApp } from "@/app/providers/AppContext";
import { available, freeSpaces, pointFree } from "@/domain/selectors";
import { useState } from "react";

export function useHubs() {
  const { s } = useApp();
  const [search, setSearch] = useState("");
  const [view, setView] = useState("map");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState("");

  const hubs = s.hubs.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" ||
        (filter === "vehicles"
          ? available(s, h.id).length > 0
          : filter === "parking"
            ? freeSpaces(s, h.id) > 0
            : pointFree(s, h.id) > 0)),
  );

  return {
    s,
    search,
    setSearch,
    view,
    setView,
    filter,
    setFilter,
    selected,
    setSelected,
    hubs,
  };
}
