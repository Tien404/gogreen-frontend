import { useApp } from "@/app/providers/AppContext";
import { useRefreshStudentData } from "@/integration/studentRefresh";
import { hubAlternatives } from "@/integration/studentRecords";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { useState } from "react";
export function useRideDetail({ id }: { id: string }) {
  const { s, api, notify } = useApp();
  const refresh = useRefreshStudentData();
  const command = useApiAction();
  const r = s.rides.find((ride) => ride.id === id && ride.owner === s.persona);
  const [destination, setDestination] = useState(
    r?.destination || s.hubs[0]?.id || "",
  );
  const v = s.vehicles.find((vehicle) => vehicle.id === r?.vehicle);
  const suggestions = hubAlternatives(command.error);
  function clearError() {
    command.setError(null);
  }
  const handleConfirm1 = async () => {
    if (!r || !destination) return;
    const result = await command.run(() =>
      api.request("POST /rentals/rentals/{rental_id}/return", {
        params: { rental_id: r.id },
        body: { return_hub_id: destination },
      }),
    );
    if (result.ok) {
      notify(
        "Ride completed successfully. Thank you for riding green!",
        "success",
      );
    }
    refresh?.();
    return;
  };
  return {
    s,
    r,
    destination,
    setDestination,
    suggestions,

    busy: command.busy,
    error: command.error ? apiErrorMessage(command.error) : "",
    clearError,
    v,
    handleConfirm1,
  };
}
