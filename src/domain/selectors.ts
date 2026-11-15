import { config } from "@/config/app";
import type { State } from "./types";

export function occupancy(s: State, id: string) {
  return (
    s.vehicles.filter((v) => v.hub === id).length +
    s.bookings.filter(
      (b) => b.hub === id && ["checked-in", "overstaying"].includes(b.status),
    ).length
  );
}

export function freeSpaces(s: State, id: string) {
  const h = s.hubs.find((h) => h.id === id);

  if (!h) return 0;

  if (
    s.preset === "no-alternative" ||
    (s.preset === "full" && id === "library")
  )
    return 0;

  return Math.max(0, h.capacity - occupancy(s, id));
}

export function available(s: State, id?: string) {
  return s.vehicles.filter(
    (v) =>
      (!id || v.hub === id) &&
      v.status === "available" &&
      v.battery !== null &&
      v.battery >= config.minimumBattery &&
      !v.stale,
  );
}

export function pointFree(s: State, id: string) {
  const h = s.hubs.find((h) => h.id === id)!;

  return Math.max(
    0,
    h.points -
      s.charges.filter(
        (c) => c.hub === id && ["active", "scheduled"].includes(c.status),
      ).length -
      s.incidents.filter(
        (i) =>
          i.status === "open" &&
          i.type === "Point fault" &&
          i.resource.includes(h.name),
      ).length,
  );
}

export function pointId(hub: string, index: number) {
  const prefixes: Record<string, string> = {
    north: "DH",
    library: "CL",
    science: "UC",
    metro: "MT",
  };

  return `${prefixes[hub] ?? hub}-${String(index + 1).padStart(2, "0")}`;
}
