import { config } from "@/config/app";
import { mapTiles } from "@/config/map";
import { useApp } from "@/app/providers/AppContext";
import { Icon } from "@/shared/components/Icon";
import { Button, Link } from "@/shared/ui";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker, TileLayer } from "leaflet";
import type { HubResources } from "../hubResources";
import { campusCenter, hubLocation } from "../hubMap";
import "leaflet/dist/leaflet.css";
import "./campus-map.css";

type CampusMapProps = {
  selected?: string;
  onSelect?: (id: string) => void;
  hubs?: HubResources[];
  directory?: boolean;
};
type Runtime = {
  L: typeof import("leaflet");
  map: LeafletMap;
  tiles: TileLayer;
  markers: Map<string, { marker: Marker; label: string }>;
};
type TileStatus = "loading" | "ready" | "error" | "unavailable";

export function CampusMap({
  selected,
  onSelect,
  hubs,
  directory,
}: CampusMapProps) {
  const { s } = useApp();
  const canvas = useRef<HTMLDivElement>(null);
  const fittedBounds = useRef("");
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [status, setStatus] = useState<TileStatus>("loading");
  const [localSelected, setLocalSelected] = useState("");
  const displayHubs =
    hubs ??
    s.hubs.map((hub) => ({
      id: hub.id,
      name: hub.name,
      coordinates: hub.coordinates,
      availableVehicles: hub.live?.availableVehicles ?? 0,
      parkingAvailable: hub.live?.bookable ?? 0,
      availablePoints: hub.live?.availablePoints ?? 0,
    }));
  const located = displayHubs.flatMap((hub) => {
    const location = hubLocation(hub);
    return location ? [{ ...hub, ...location }] : [];
  });
  const selectedId = selected ?? localSelected;
  const active = located.find((hub) => hub.id === selectedId);

  useEffect(() => {
    let disposed = false;
    let instance: LeafletMap | undefined;
    let observer: ResizeObserver | undefined;
    void import("leaflet")
      .then((L) => {
        if (disposed || !canvas.current) return;
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        const map = L.map(canvas.current, {
          center: [...campusCenter],
          zoom: 14,
          minZoom: 12,
          maxZoom: 19,
          scrollWheelZoom: false,
          zoomControl: false,
          zoomAnimation: !reducedMotion,
          fadeAnimation: !reducedMotion,
          markerZoomAnimation: !reducedMotion,
        });
        instance = map;
        L.control.zoom({ position: "bottomright" }).addTo(map);
        let failed = false;
        const tiles = L.tileLayer(mapTiles.url, {
          maxZoom: 19,
          attribution: mapTiles.attribution,
        });
        tiles.on("loading", () => {
          failed = false;
          setStatus("loading");
        });
        tiles.on("tileerror", () => {
          failed = true;
          setStatus("error");
        });
        tiles.on("load", () => setStatus(failed ? "error" : "ready"));
        tiles.addTo(map);
        observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
        observer.observe(canvas.current);
        fittedBounds.current = "";
        setRuntime({ L, map, tiles, markers: new Map() });
      })
      .catch(() => {
        if (!disposed) setStatus("unavailable");
      });
    return () => {
      disposed = true;
      observer?.disconnect();
      instance?.remove();
    };
  }, []);

  useEffect(() => {
    if (!runtime) return;
    const { L, map, markers } = runtime;
    const ids = new Set(located.map((hub) => hub.id));
    for (const [id, entry] of markers) {
      if (!ids.has(id)) {
        entry.marker.remove();
        markers.delete(id);
      }
    }
    for (const hub of located) {
      const label = `${hub.name}, ${hub.availableVehicles} vehicles, ${hub.parkingAvailable} parking spaces available`;
      let entry = markers.get(hub.id);
      if (!entry || entry.label !== label) {
        const content = document.createElement("span");
        content.className = "campus-hub-pin";
        const logo = document.createElement("span");
        logo.className = "campus-hub-logo";
        logo.setAttribute("aria-hidden", "true");
        content.append(logo);
        const count = document.createElement("span");
        count.className = "campus-hub-count";
        count.textContent = String(hub.availableVehicles);
        content.append(count);
        const icon = L.divIcon({
          className: "campus-hub-marker",
          html: content,
          iconSize: [44, 48],
          iconAnchor: [22, 48],
          tooltipAnchor: [0, -44],
        });
        if (entry) entry.marker.setIcon(icon);
        else {
          entry = {
            marker: L.marker([...hub.position], {
              icon,
              title: hub.name,
              keyboard: true,
            }).addTo(map),
            label,
          };
          markers.set(hub.id, entry);
        }
        entry.label = label;
        const tooltip = document.createElement("span");
        tooltip.textContent = hub.name;
        entry.marker.unbindTooltip().bindTooltip(tooltip, {
          direction: "top",
          className: "campus-hub-tooltip",
        });
      }
      entry.marker.setLatLng([...hub.position]);
      entry.marker.off("click").on("click", () => {
        if (onSelect) onSelect(hub.id);
        else setLocalSelected(hub.id);
      });
      const element = entry.marker.getElement();
      const marker = entry.marker;
      if (element)
        element.onkeydown = (event) => {
          if (event.key === " ") {
            event.preventDefault();
            marker.fire("click");
          }
        };
      element?.setAttribute("aria-label", label);
      element?.setAttribute("aria-pressed", String(hub.id === selectedId));
      entry.marker.setZIndexOffset(hub.id === selectedId ? 1000 : 0);
    }
    // Polling refreshes marker data without resetting the user's pan/zoom.
    const boundsKey = located
      .map((hub) => `${hub.id}:${hub.position.join(",")}`)
      .sort()
      .join(";");
    if (boundsKey !== fittedBounds.current && located.length) {
      map.fitBounds(L.latLngBounds(located.map((hub) => [...hub.position])), {
        padding: [45, 45],
        maxZoom: 16,
        animate: false,
      });
      fittedBounds.current = boundsKey;
    }
  }, [runtime, located, onSelect, selectedId]);

  const showAll = () => {
    if (!runtime || !located.length) return;
    runtime.map.fitBounds(
      runtime.L.latLngBounds(located.map((hub) => [...hub.position])),
      { padding: [45, 45], maxZoom: 16, animate: false },
    );
  };
  const retry = () => {
    if (status === "unavailable") {
      window.location.reload();
      return;
    }
    setStatus("loading");
    runtime?.tiles.redraw();
  };

  return (
    <section
      className="campus-map"
      data-directory={directory || undefined}
      aria-label="Campus hub map"
    >
      <div className="campus-map-heading">
        <div>
          <Icon name="pin" size={16} />
          <span>{config.campus}</span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="text-content-muted"
          onClick={showAll}
          disabled={!runtime || !located.length}
        >
          <Icon name="focus" size={16} />
          Focus hubs
        </Button>
      </div>
      <div
        ref={canvas}
        className="campus-map-canvas"
        role="region"
        aria-label="Interactive campus map. Use arrow keys to pan and plus or minus to zoom."
      />
      {/* {status === "loading" && (
        <p className="campus-map-status" role="status">
          Loading map…
        </p>
      )} */}
      {(status === "error" || status === "unavailable") && (
        <div className="campus-map-status campus-map-error" role="status">
          <span>
            Map{" "}
            {status === "unavailable"
              ? "could not start"
              : "tiles could not load"}
            . Hub data is still available in the list.
          </span>
          <Button variant="ghost" size="sm" onClick={retry}>
            Retry map
          </Button>
        </div>
      )}
      {active && (
        <div className="campus-map-selection" aria-live="polite">
          <div>
            <strong>{active.name}</strong>
            <p>
              {active.availableVehicles} vehicles · {active.parkingAvailable}{" "}
              parking spaces · {active.availablePoints} charging points
              available
            </p>
          </div>
          <Link
            className="campus-map-detail"
            to={`/${s.role}/hubs/${encodeURIComponent(active.id)}`}
          >
            View hub <Icon name="arrow" size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
