export type DataMode = "api" | "preview";

export function resolveDataMode(value: string | undefined, viteMode: string): DataMode {
  const mode = value || (viteMode === "preview" ? "preview" : "api");
  if (mode === "api" || mode === "preview") return mode;
  throw new Error("Set VITE_APP_MODE to api or preview.");
}

export function resolveApiBaseUrl(value = "/api/v1"): string {
  const base = value.trim().replace(/\/+$/, "");
  if (!base.startsWith("/") || base.startsWith("//") || base.includes("\\")) {
    const url = URL.parse(base);
    if (!url || !["http:", "https:"].includes(url.protocol) || url.username || url.password) {
      throw new Error("Set VITE_API_BASE_URL to /api/v1 or an HTTP(S) URL ending in /api/v1.");
    }
  }
  if (!base.endsWith("/api/v1") || /[?#\\]/.test(base)) {
    throw new Error("Set VITE_API_BASE_URL to a path or URL ending in /api/v1.");
  }
  return base;
}
