import type { Role } from "@/domain/types";
import type { AuthErrors, Credentials } from "./types";
export function validateCredentials(input: Credentials): AuthErrors {
  const errors: AuthErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
    errors.email = "Enter a valid email address.";
  if (!input.password) errors.password = "Enter your password.";
  return errors;
}
export function loginDestination(returnTo: string | null, role: Role) {
  const fallback = `/${role}`;
  if (!returnTo?.startsWith("/") || returnTo.startsWith("//")) return fallback;
  const url = new URL(returnTo, "https://gogreen.example");
  if (url.origin !== "https://gogreen.example") return fallback;
  if (url.pathname !== fallback && !url.pathname.startsWith(`${fallback}/`))
    return fallback;
  return `${url.pathname}${url.search}${url.hash}`;
}
