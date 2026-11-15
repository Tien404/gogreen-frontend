import { useApp } from "@/app/providers/AppContext";
import { useState } from "react";

export function useVehicleTable({ hub }: { hub?: string }) {
  const { s, go } = useApp();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("id");
  const [selected, setSelected] = useState("");

  const list = s.vehicles
    .filter(
      (v) =>
        (!hub || v.hub === hub) &&
        `${v.id} ${v.type}`.toLowerCase().includes(search.toLowerCase()) &&
        (status === "all" || v.status === status),
    )
    .sort((a, b) =>
      sort === "battery"
        ? (b.battery ?? -1) - (a.battery ?? -1)
        : a.id.localeCompare(b.id),
    );

  const pages = Math.max(1, Math.ceil(list.length / 8));

  const current = Math.min(page, pages);

  const v = s.vehicles.find((v) => v.id === selected);

  return {
    s,
    go,
    search,
    setSearch,
    status,
    setStatus,
    setPage,
    sort,
    setSort,
    setSelected,
    list,
    pages,
    current,
    v,
  };
}

export type VehicleTableModel = ReturnType<typeof useVehicleTable>;
