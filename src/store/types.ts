import type { State } from "@/domain/types";

export type Action = {
  type: string;
  [key: string]: unknown;
};

export interface ActionResult {
  message: string;
  error?: boolean;
  id?: string;
}

export interface TransitionResult extends ActionResult {
  state: State;
}
