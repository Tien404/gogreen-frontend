import { config } from "@/config/app";
import { ApiError } from "@/shared/api/errors";
import type { Schemas } from "@/shared/api/contract.generated";
import { apiId, apiTime, mapStatus, mapVehicle } from "./apiMappers";

const formatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium", timeStyle: "short", timeZone: config.timezone,
});

export function campusTime(instant: string) {
  return formatter.format(apiTime(instant));
}

export function campusInputToIso(value: string) {
  const minute = Date.parse(`${value}:00+07:00`);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) || !Number.isFinite(minute)) {
    throw new ApiError(422, "INVALID_INPUT", "Choose a valid campus date and time.");
  }
  // Date.parse can normalize invalid dates such as February 30.
  const normalized = new Date(minute + 7 * 3_600_000).toISOString().slice(0, 16);
  if (normalized !== value) throw new ApiError(422, "INVALID_INPUT", "Choose a valid campus date and time.");
  return new Date(minute).toISOString();
}

export function recordUrl(kind: "hold" | "rental" | "parking" | "charging", id: string) {
  const segment = { hold: "holds", rental: "rides", parking: "parking", charging: "charging" }[kind];
  return `/student/${segment}/${encodeURIComponent(apiId(id))}`;
}

export function mapOwnedVehicle(dto: Schemas["OwnedVehicleOut"]) {
  return { ...mapVehicle(dto), label: dto.license_plate };
}

export function activityLink(dto: Schemas["ActivityOut"], role: "student" | "operator" = "student") {
  if (role === "operator") {
    const path = dto.resource_type === "dispatch" ? "dispatch" : dto.resource_type === "charging" ? "charging" : null;
    if (path) return `/operator/${path}/${encodeURIComponent(dto.resource_id)}`;
    return dto.resource_type === "incident" ? `/operator/incidents?${new URLSearchParams({ incident: dto.resource_id })}` : null;
  }
  const kind = dto.resource_type;
  return kind === "hold" || kind === "rental" || kind === "parking" || kind === "charging"
    ? recordUrl(kind, dto.resource_id) : null;
}

export function statusLabel(kind: Parameters<typeof mapStatus>[0], status: string) {
  return mapStatus(kind, status)?.replaceAll("-", " ") ?? "Unknown status";
}

export function hubAlternatives(error: unknown) {
  if (!(error instanceof ApiError) || error.code !== "HUB_FULL") return null;
  const details = error.details as { alternatives?: unknown } | null;
  if (!Array.isArray(details?.alternatives)) return [];
  return details.alternatives.flatMap((item: unknown) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    return typeof row.hub_id === "string" && row.hub_id.trim() &&
      typeof row.bookable_now === "number" && Number.isInteger(row.bookable_now) && row.bookable_now > 0
      ? [{ id: row.hub_id, spaces: row.bookable_now }] : [];
  });
}

export function chargeSchedule(charge: Schemas["ChargingSessionOut"]) {
  return charge.scheduled_start_at && charge.scheduled_end_at
    ? `${campusTime(charge.scheduled_start_at)} – ${campusTime(charge.scheduled_end_at)}`
    : "No assigned schedule";
}
