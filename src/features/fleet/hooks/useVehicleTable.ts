import { useApp } from "@/app/providers/AppContext";
import { useState } from "react";
export type LiveVehicleTable = {
  hubName: string;
  vehicles: {
    id: string;
    type: string;
    status: string;
    hub: string | null;
    battery: number | null;
    stale?: boolean;
    observedClock?: number | null;
  }[];
};
export function useVehicleTable({
  hub,
  live,
}: {
  hub?: string;
  live?: LiveVehicleTable;
}) {
  const { s, go } = useApp();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("id");
  const [selected, setSelected] = useState("");
  const vehicles = live?.vehicles ?? s.vehicles;
  const list = vehicles
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
  const v: LiveVehicleTable["vehicles"][number] | undefined = vehicles.find(
    (v) => v.id === selected,
  );
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
