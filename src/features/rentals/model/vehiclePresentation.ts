const key = "gogreen:vehicle-types:v1";
export function rememberVehicleType(vehicle: { id: string; type: string }) {
  try {
    const types = JSON.parse(sessionStorage.getItem(key) ?? "{}");
    sessionStorage.setItem(
      key,
      JSON.stringify({ ...types, [vehicle.id]: vehicle.type }),
    );
  } catch {
    /* Artwork can still use the generic illustration if storage is unavailable. */
  }
}
export function rememberedVehicleType(id: string): string | undefined {
  try {
    return JSON.parse(sessionStorage.getItem(key) ?? "{}")[id];
  } catch {
    return undefined;
  }
}
