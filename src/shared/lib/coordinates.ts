export type Coordinates = readonly [latitude: number, longitude: number];

export function coordinates(
  latitude: string | number | null | undefined,
  longitude: string | number | null | undefined,
): Coordinates | null {
  if (latitude == null || longitude == null) return null;
  if (String(latitude).trim() === "" || String(longitude).trim() === "")
    return null;
  const lat = Number(latitude);
  const lng = Number(longitude);
  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
    ? [lat, lng]
    : null;
}
