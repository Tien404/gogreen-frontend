import { config } from "@/config/app";
import type { TransitionContext } from "../context";
import type { TransitionResult } from "../types";

export function handlePrivateVehicles({
  s,
  a,
  id,
  fail,
  ok,
}: TransitionContext): TransitionResult | undefined {
  if (a.type === "add-vehicle") {
    const vehicleType = config.vehicleTypes.find(
      (type) => type === a.vehicleType,
    );

    const identifier = String(a.identifier ?? "")
      .trim()
      .toUpperCase();

    if (
      s.role !== "student" ||
      !identifier ||
      !vehicleType ||
      !Number.isFinite(Number(a.battery)) ||
      Number(a.battery) < 0 ||
      Number(a.battery) > 100
    )
      return fail(
        "Enter an identifier, select a supported vehicle type and enter battery from 0–100%.",
      );

    if (
      s.privateVehicles.some(
        (v) => v.owner === s.persona && v.identifier === identifier,
      )
    )
      return fail("This identifier is already in your private vehicles.");

    const vid = id("PV");

    s.privateVehicles.push({
      id: vid,
      owner: s.persona,
      identifier,
      type: vehicleType,
      battery: Number(a.battery),
    });

    return ok("Private vehicle added", vid);
  }
}
