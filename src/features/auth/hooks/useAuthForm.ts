import { useApp } from "@/app/providers/AppContext";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { loginDestination, validateCredentials } from "../model/accounts";
import { type AuthErrors, type Credentials } from "../model/types";
export function useAuthForm() {
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
    const input: Credentials = {
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    };
    const fields = validateCredentials(input);
    setErrors(fields);
    setError("");
    if (Object.keys(fields).length) {
      focusError(fields);
      return;
    }
    setBusy(true);
    submitting.current = true;
    try {
      const result = await auth.signIn(input);
      if (!mounted.current) return;
      if ("error" in result) {
        setErrors(result.fields ?? {});
        setError(result.error);
        notify(result.error, "error");
        focusError(result.fields ?? {});
        return;
      }
      formRef.current?.reset();
      notify(`Welcome back, ${result.user.name}.`, "success");
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
    }));
    setError("");
  };
  return {
    errors,
    error,
    busy,
    formRef,
    errorRef,
    submit,
    clearError,
  };
}
