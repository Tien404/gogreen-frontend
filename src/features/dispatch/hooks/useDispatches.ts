import { useApp } from "@/app/providers/AppContext";
import { dispatchUrl } from "@/integration/operatorRecords";
import { apiErrorMessage } from "@/shared/api/errors";
import { useApiAction } from "@/shared/api/useApiAction";
import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
export function useDispatches({ id }: { id?: string }) {
  const { s, go, api, refreshOperations, notify } = useApp();
  const [params] = useSearchParams();
  const advisedVehicle = params.get("vehicle_id");
  const [open, setOpen] = useState(Boolean(!id && advisedVehicle));
  const [source, setSource] = useState(
    params.get("from_hub_id") ??
      s.hubs.find((hub) => hub.live?.active)?.id ??
      "",
  );
  const [destination, setDestination] = useState(
    params.get("to_hub_id") ??
      s.hubs.find((hub) => hub.live?.active && hub.id !== source)?.id ??
      "",
  );
  const [vehicles, setVehicles] = useState<string[]>(
    advisedVehicle ? [advisedVehicle] : [],
  );
  const [review, setReview] = useState(false);
  const command = useApiAction();
  const d = s.dispatches.find((d) => d.id === id)!;
  const hubs = s.hubs.filter((hub) => hub.live?.active);
  const candidates = s.vehicles.filter(
    (v) => v.hub === source && v.status === "available",
  );
  const valid =
    vehicles.length > 0 &&
    source !== destination &&
    vehicles.every((vehicleId) =>
      candidates.some((candidate) => candidate.id === vehicleId),
    ) &&
    [source, destination].every((hub) => hubs.some((item) => item.id === hub));
  const action = async (type: string) => {
    if (d) {
      if (type !== "start-dispatch" && type !== "complete-dispatch") return;
      const result = await command.run(() =>
        api.request(
          type === "start-dispatch"
            ? "POST /redistribution-tasks/{task_id}/start"
            : "POST /redistribution-tasks/{task_id}/complete",
          { params: { task_id: d.id } },
        ),
      );
      if (result.ok) {
        notify(
          type === "start-dispatch"
            ? "Dispatch task started."
            : "Dispatch task completed.",
          "success",
        );
      }
      refreshOperations?.();
      return;
    }
  };
  const submitDispatch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid) return;
    if (!review) {
      setReview(true);
      return;
    }
    const selectedVehicles = [...vehicles];
    const created: Array<{ task_id: string; vehicle_id: string }> = [];
    const result = await command.run(async () => {
      for (const vehicleId of selectedVehicles) {
        try {
          const task = await api.request("POST /redistribution-tasks", {
            body: {
              from_hub_id: source,
              to_hub_id: destination,
              vehicle_id: vehicleId,
            },
          });
          created.push({ task_id: task.task_id, vehicle_id: vehicleId });
        } catch (err) {
          if (created.length > 0) {
            const createdIds = new Set(created.map((item) => item.vehicle_id));
            setVehicles((prev) => prev.filter((item) => !createdIds.has(item)));
            refreshOperations?.();
            notify(
              `${created.length} dispatch(es) created before an error occurred.`,
              "info",
            );
          }
          throw err;
        }
      }
      return created;
    });
    if (result.ok) {
      refreshOperations?.();
      if (result.data.length === 1) {
        notify("Vehicle redistribution dispatch created.", "success");
        go(dispatchUrl(result.data[0].task_id));
      } else {
        notify(
          `${result.data.length} vehicle redistribution dispatches created.`,
          "success",
        );
        setVehicles([]);
        setReview(false);
        setOpen(false);
      }
    }
    return;
  };
  return {
    s,
    open,
    setOpen,
    source,
    setSource,
    destination,
    setDestination,
    vehicles,
    setVehicles,
    error: command.error ? apiErrorMessage(command.error) : "",
    review,
    setReview,
    d,
    action,
    submitDispatch,

    busy: command.busy,
    valid,
    candidates,
    hubs,
  };
}
export type DispatchesModel = ReturnType<typeof useDispatches>;
