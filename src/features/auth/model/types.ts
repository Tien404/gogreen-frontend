import type { AccountProfile, Role } from "@/domain/types";

export interface Credentials {
  email: string;
  password: string;
}

export interface Registration extends Credentials {
  name: string;
  confirmPassword: string;
}

export type AuthErrors = Partial<Record<keyof Registration, string>>;

export type AuthResult =
  { user: AccountProfile } | { error: string; fields?: AuthErrors };

export interface AuthSession {
  user: AccountProfile | null;
  status: "loading" | "ready" | "error";
  error?: string;
  retry: () => void;
  signIn: (input: Credentials) => Promise<AuthResult>;
  signUp: (input: Registration) => Promise<AuthResult>;
  preview: (role: Role, persona?: string) => AccountProfile | null;
  signOut: () => Promise<{ error?: string }>;
}
