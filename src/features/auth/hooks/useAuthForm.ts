import { useApp } from "@/app/providers/AppContext";
import { type AccountProfile } from "@/domain/types";
import { previewPassword } from "@/mocks/accounts";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  loginDestination,
  validateCredentials,
  validateRegistration,
} from "../model/accounts";
import { type AuthErrors, type Registration } from "../model/types";

export function useAuthForm(mode: "login" | "signup") {
  const { auth, notify } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [errors, setErrors] = useState<AuthErrors>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  const submitting = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const focusError = (fields: AuthErrors) => {
    const target = Array.from(formRef.current?.elements ?? []).find(
      (element) => {
        const name = (element as HTMLInputElement).name as keyof AuthErrors;

        return !!fields[name];
      },
    ) as HTMLElement | undefined;

    if (target) target.focus();
    else requestAnimationFrame(() => errorRef.current?.focus());
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting.current) return;

    const data = new FormData(event.currentTarget);

    const input: Registration = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      confirmPassword: String(data.get("confirmPassword") ?? ""),
    };

    const fields =
      mode === "signup"
        ? validateRegistration(input)
        : validateCredentials(input);

    setErrors(fields);
    setError("");

    if (Object.keys(fields).length) {
      focusError(fields);

      return;
    }

    setBusy(true);
    submitting.current = true;

    try {
      const result = await (mode === "signup"
        ? auth.signUp(input)
        : auth.signIn(input));

      if (!mounted.current) return;

      if ("error" in result) {
        setErrors(result.fields ?? {});
        setError(result.error);
        focusError(result.fields ?? {});

        return;
      }

      formRef.current?.reset();
      notify(
        mode === "signup"
          ? `Welcome, ${result.user.name}. Your account is ready.`
          : `Welcome back, ${result.user.name}.`,
      );
      navigate(loginDestination(params.get("returnTo"), result.user.role), {
        replace: true,
      });
    } catch {
      if (mounted.current) {
        setError("We couldn't complete that request. Please try again.");
        focusError({});
      }
    } finally {
      submitting.current = false;

      if (mounted.current) setBusy(false);
    }
  };

  const clearError = (event: FormEvent<HTMLFormElement>) => {
    const name = (event.target as HTMLInputElement).name as keyof AuthErrors;

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
      ...(name === "password" ? { confirmPassword: undefined } : {}),
    }));
    setError("");
  };

  const fillPreview = (profile: AccountProfile) => {
    const form = formRef.current;

    if (!form) return;

    (form.elements.namedItem("email") as HTMLInputElement).value =
      profile.email;
    (form.elements.namedItem("password") as HTMLInputElement).value =
      previewPassword;
    setErrors({});
    setError("");
    (form.querySelector('button[type="submit"]') as HTMLButtonElement)?.focus();
  };

  const query = params.get("returnTo");

  const alternate = `${mode === "login" ? "/signup" : "/login"}${query ? `?${new URLSearchParams({ returnTo: query })}` : ""}`;

  return {
    errors,
    error,
    busy,
    formRef,
    errorRef,
    submit,
    clearError,
    fillPreview,
    alternate,
  };
}
