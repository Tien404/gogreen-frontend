import type { AccountProfile } from "@/domain/types";
export interface Credentials {
  email: string;
  password: string;
}
export type AuthErrors = Partial<Record<keyof Credentials, string>>;
export type AuthResult =
  | {
      user: AccountProfile;
    }
  | {
      error: string;
      fields?: AuthErrors;
    };
export interface AuthSession {
  user: AccountProfile | null;
  status: "loading" | "ready" | "error";
  error?: string;
  retry: () => void;
  signIn: (input: Credentials) => Promise<AuthResult>;
  signOut: () => Promise<{
    error?: string;
  }>;
}
