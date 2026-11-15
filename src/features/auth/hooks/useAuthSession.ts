import { type AccountProfile } from "@/domain/types";
import { previewProfiles } from "@/mocks/accounts";
import { useState } from "react";
import { createAccountStore } from "../model/accounts";
import { type AuthSession } from "../model/types";

export function useAuthSession(
  onSelect: (profile: AccountProfile | null) => void,
): AuthSession {
  const [accounts] = useState(createAccountStore);
  const [user, setUser] = useState<AccountProfile | null>(null);

  const select = (profile: AccountProfile | null) => {
    setUser(profile);
    onSelect(profile);
  };

  return {
    user,
    status: "ready",
    retry() {},
    async signIn(input) {
      const result = await accounts.signIn(input);

      if ("user" in result) select(result.user);

      return result;
    },
    async signUp(input) {
      const result = await accounts.signUp(input);

      if ("user" in result) select(result.user);

      return result;
    },
    preview(role, persona) {
      const profile = previewProfiles.find(
        (p) => p.role === role && (!persona || p.persona === persona),
      )!;

      select({ ...profile });

      return profile;
    },
    async signOut() {
      select(null);
      return {};
    },
  };
}
