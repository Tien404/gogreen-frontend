import { previewProfiles } from "@/mocks/accounts";
import type { State } from "./types";
import { type AccountProfile } from "./types";

export function currentProfile(
  s: Pick<State, "role" | "persona" | "profile">,
): AccountProfile {
  if (s.profile?.persona === s.persona && s.profile.role === s.role)
    return s.profile;

  return (
    previewProfiles.find((p) => p.role === s.role && p.persona === s.persona) ??
    previewProfiles.find((p) => p.role === s.role) ??
    previewProfiles[0]
  );
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
