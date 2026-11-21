import type { State } from "./types";
import { type AccountProfile } from "./types";
export function currentProfile(
  s: Pick<State, "role" | "persona" | "profile">,
): AccountProfile {
  if (s.profile?.persona === s.persona && s.profile.role === s.role)
    return s.profile;
  throw new Error("A signed-in account is required.");
}
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
