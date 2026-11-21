import { useApp } from "@/app/providers/AppContext";
import { Alert, Button, Field } from "@/shared/ui";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Navigate, useLocation, useSearchParams } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordField } from "../components/PasswordField";
import { SessionFeedback } from "../components/SessionFeedback";
import { useAuthForm } from "../hooks/useAuthForm";
import { loginDestination } from "../model/accounts";
export function SignUp() {
  const { search } = useLocation();
  return <Navigate replace to={`/login${search}`} />;
}
export function Login() {
  const { auth } = useApp();
  const [params] = useSearchParams();
  const { errors, error, busy, formRef, errorRef, submit, clearError } =
    useAuthForm();
  if (auth.status !== "ready") return <SessionFeedback auth={auth} />;
  if (auth.user)
    return (
      <Navigate
        replace
        to={loginDestination(params.get("returnTo"), auth.user.role)}
      />
    );
  return (
    <AuthLayout
      title="Good to see you."
      description="Log in to pick up where you left off."
    >
      <form
        ref={formRef}
        onSubmit={submit}
        onChange={clearError}
        noValidate
        aria-busy={busy}
      >
        <fieldset disabled={busy} className="m-0 min-w-0 border-0 p-0">
          <Field label="Email address" error={errors.email}>
            <input
              name="email"
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              maxLength={254}
              placeholder="you@university.edu"
              className="min-h-6 rounded-xs border border-control-border bg-panel px-3 py-2 hover:bg-soft aria-invalid:border-danger"
            />
          </Field>
          <PasswordField
            name="password"
            label="Password"
            error={errors.password}
          />
          {error && (
            <div ref={errorRef} tabIndex={-1} className="rounded-xs">
              <Alert tone="error">{error}</Alert>
            </div>
          )}
          <Button type="submit" disabled={busy} className="w-full min-h-6">
            {busy && (
              <LoaderCircle
                size={18}
                className="animate-spin motion-reduce:animate-none"
              />
            )}
            {busy ? "Logging in…" : "Log in"}
            {!busy && <ArrowRight size={18} strokeWidth={1.75} />}
          </Button>
        </fieldset>
      </form>
      <p className="mt-5 text-center text-xs text-content-muted">
        Use your student or operator account provided for this workspace.
      </p>
    </AuthLayout>
  );
}
