import type { State } from "@/domain/types";
import { createTransitionContext } from "./context";
import { handleCharging } from "./handlers/charging";
import { handleDispatch } from "./handlers/dispatch";
import { handleIncidents } from "./handlers/incidents";
import { handleParking } from "./handlers/parking";
import { handlePrivateVehicles } from "./handlers/privateVehicles";
import { handleRentals } from "./handlers/rentals";
import { handleScenarios } from "./handlers/scenarios";
import {
  handleClock,
  handleSamples,
  handleWorkspace,
} from "./handlers/workspace";
import type { Action, TransitionResult } from "./types";

const handlers = [
  handleWorkspace,
  handleClock,
  handleRentals,
  handlePrivateVehicles,
  handleParking,
  handleCharging,
  handleIncidents,
  handleDispatch,
  handleScenarios,
  handleSamples,
];

export function transition(state: State, action: Action): TransitionResult {
  const context = createTransitionContext(state, action);

  for (const handler of handlers) {
    const result = handler(context);

    if (result) return result;
  }

  return { state, message: "No action available", error: true };
}
