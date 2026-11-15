import { useApp } from "@/app/providers/AppContext";
import { config } from "@/config/app";
import { available } from "@/domain/selectors";
import { useState } from "react";
import { useSearchParams } from "react-router";

export function useFindRide() {
  const { s, act, go } = useApp();
  const [searchParams] = useSearchParams();

  const requestedOrigin = searchParams.get("origin");

  const [origin, setOrigin] = useState(
    s.hubs.some((h) => h.id === requestedOrigin) ? requestedOrigin! : "north",
  );
  const [destination, setDestination] = useState("library");
  const [type, setType] = useState("all");
  const [need, setNeed] = useState("short");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState("");

  const vehicles = available(s, origin).filter(
    (v) =>
      (type === "all" || v.type === type) &&
      (need === "short" || (v.battery ?? 0) >= config.extendedJourneyBattery),
  );

  const v = s.vehicles.find((v) => v.id === selected);

  const hold = s.holds.find(
    (h) => h.owner === s.persona && h.status === "held",
  );

  const ride = s.rides.find(
    (r) => r.owner === s.persona && r.status === "active",
  );

  const reserveVehicle = () => {
    setBusy(true);
    setTimeout(() => {
      const r = act({
        type: "reserve",
        vehicle: v!.id,
        destination,
      });

      setBusy(false);
      setError(r.error ? r.message : "");

      if (r.id) go(`/student/holds/${r.id}`);
    }, 200);
  };

  return {
    s,
    origin,
    setOrigin,
    destination,
    setDestination,
    type,
    setType,
    need,
    setNeed,
    error,
    busy,
    selected,
    setSelected,
    vehicles,
    v,
    hold,
    ride,
    reserveVehicle,
  };
}
