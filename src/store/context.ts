import { currentProfile } from "@/domain/identity";
import { type State } from "@/domain/types";
import type { Action } from "./types";

export function createTransitionContext(state: State, a: Action) {
  const s = structuredClone(state);

  const id = (prefix: string) => `${prefix}-${++s.serial}`;

  const fail = (message: string) => {
    log(
      a.type,
      String(a.id ?? a.vehicle ?? "Workspace"),
      "Failed",
      message,
      String(a.link ?? ""),
    );

    return { state: s, message, error: true };
  };

  const log = (
    action: string,
    resource: string,
    result = "Success",
    reason = "",
    link = "",
  ) => {
    s.activity.unshift({
      id: id("AC"),
      at: s.clock,
      actor: currentProfile(s).name,
      persona: s.persona,
      action,
      resource,
      result,
      reason,
      link,
    });
  };

  const ok = (message: string, record?: string, link = "") => {
    s.revision++;
    log(a.type, record ?? "Workspace", "Success", message, link);

    return { state: s, message, id: record };
  };

  return { state, s, a, id, fail, log, ok };
}

export type TransitionContext = ReturnType<typeof createTransitionContext>;
