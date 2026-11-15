import type { AccountProfile, Role } from "@/domain/types";
import { previewPassword, previewProfiles } from "@/mocks/accounts";
import type {
  AuthErrors,
  AuthResult,
  Credentials,
  Registration,
} from "./types";

export function validateCredentials(input: Credentials): AuthErrors {
  const errors: AuthErrors = {};

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
    errors.email = "Enter a valid email address.";

  if (!input.password) errors.password = "Enter your password.";

  return errors;
}

export function validateRegistration(input: Registration): AuthErrors {
  const errors = validateCredentials(input);

  if (input.name.trim().length < 2) errors.name = "Enter your full name.";

  if (input.password.length < 8 || input.password.length > 128)
    errors.password = "Use between 8 and 128 characters.";

  if (input.confirmPassword !== input.password)
    errors.confirmPassword = "The passwords do not match.";

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

async function digest(password: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password),
  );

  return Array.from(new Uint8Array(bytes), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
}

// A browser-only preview registry, recreated on reload. This is not server authentication.
export function createAccountStore() {
  const registered = new Map<
    string,
    { user: AccountProfile; digest: string }
  >();

  const normalize = (email: string) => email.trim().toLowerCase();

  const exists = (email: string) =>
    registered.has(email) || previewProfiles.some((p) => p.email === email);

  return {
    async signIn(input: Credentials): Promise<AuthResult> {
      const fields = validateCredentials(input);

      if (Object.keys(fields).length)
        return { error: "Check the highlighted fields.", fields };

      const email = normalize(input.email);

      const preview = previewProfiles.find((p) => p.email === email);

      if (preview && input.password === previewPassword)
        return { user: { ...preview } };

      const account = registered.get(email);

      if (account && account.digest === (await digest(input.password)))
        return { user: { ...account.user } };

      return { error: "Email or password is incorrect. Please try again." };
    },
    async signUp(input: Registration): Promise<AuthResult> {
      const fields = validateRegistration(input);

      if (Object.keys(fields).length)
        return { error: "Check the highlighted fields.", fields };

      const email = normalize(input.email);

      const passwordDigest = await digest(input.password);

      if (exists(email))
        return {
          error:
            "An account with this email already exists. Log in to continue.",
          fields: { email: "This email is already registered." },
        };

      const user: AccountProfile = {
        name: input.name.trim(),
        email,
        role: "student",
        persona: `student-${crypto.randomUUID()}`,
      };

      registered.set(email, { user, digest: passwordDigest });

      return { user: { ...user } };
    },
  };
}
