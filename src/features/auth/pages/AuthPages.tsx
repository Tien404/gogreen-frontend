import { SessionFeedback } from "../components/SessionFeedback";
import { useApp } from "@/app/providers/AppContext";
import { previewProfiles } from "@/mocks/accounts";
import { Alert, Button, Field, Link } from "@/shared/ui";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Navigate, useSearchParams } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordField } from "../components/PasswordField";
import { useAuthForm } from "../hooks/useAuthForm";
import { loginDestination } from "../model/accounts";

export function Login() {
  return <AuthForm mode="login" />;
}

export function SignUp() {
  return <AuthForm mode="signup" />;
}

type AuthFormProps = { mode: "login" | "signup" };

function AuthForm({ mode }: AuthFormProps) {
  const [params] = useSearchParams();

  const signup = mode === "signup";

  const { auth, mode: dataMode } = useApp();
  const {
    errors,
    error,
    busy,
    formRef,
    errorRef,
    submit,
    clearError,
    fillPreview,
    alternate,
  } = useAuthForm(mode);

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
      title={signup ? "Make campus yours." : "Good to see you."}
      description={
        signup
          ? "Create your student account and get moving."
          : "Log in to pick up where you left off."
      }
    >
      <form
        ref={formRef}
        onSubmit={submit}
        onChange={clearError}
        noValidate
        aria-busy={busy}
      >
        <fieldset disabled={busy} className="m-0 min-w-0 border-0 p-0">
          {signup && (
            <Field label="Full name" error={errors.name}>
              <input
                name="name"
                autoComplete="name"
                required
                maxLength={100}
                placeholder="Your full name"
                className="min-h-6 rounded-xs border border-control-border bg-panel px-3 py-2 hover:bg-soft aria-invalid:border-danger"
              />
            </Field>
          )}
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
            newPassword={signup}
            hint={
              signup
                ? "Use 8–128 characters. You can paste from a password manager."
                : undefined
            }
          />
          {signup && (
            <PasswordField
              name="confirmPassword"
              label="Confirm password"
              error={errors.confirmPassword}
              newPassword
            />
          )}
          {error && (
            <div ref={errorRef} tabIndex={-1} className="rounded-xs">
              <Alert tone="error">{error}</Alert>
            </div>
          )}
          <Button type="submit" disabled={busy} className="w-full min-h-6">
            {busy ? (
              <LoaderCircle
                size={18}
                className="animate-spin motion-reduce:animate-none"
              />
            ) : null}
            {busy
              ? signup
                ? "Creating your account…"
                : "Logging in…"
              : signup
                ? "Create account"
                : "Log in"}
            {!busy && <ArrowRight size={18} strokeWidth={1.75} />}
          </Button>
        </fieldset>
      </form>
      {dataMode === "preview" && <p className="text-center text-sm mt-5">
        {signup ? "Already have an account? " : "New to gogreen? "}
        <Link
          to={alternate}
          className="font-semibold text-accent hover:underline underline-offset-4"
        >
          {signup ? "Log in" : "Sign up"}
        </Link>
      </p>}
      {signup && (
        <p className="mt-4 text-xs text-content-muted text-center">
          Operator accounts are provided by your campus administrator.
        </p>
      )}
      {dataMode === "preview" ? <details className="mt-5 rounded-xs bg-demo-surface p-4 text-sm text-demo">
        <summary className="cursor-pointer rounded-xs font-semibold focus-visible:outline-demo">
          Demo
        </summary>
        <p className="mt-3 text-xs text-demo">
          This frontend uses local mock accounts. No information is sent to a
          server. Use sample details; accounts reset on reload.
        </p>
        {!signup && (
          <div className="mt-3 flex flex-col gap-2">
            {[previewProfiles[0], previewProfiles[2]].map((profile) => (
              <button
                key={profile.email}
                type="button"
                disabled={busy}
                onClick={() => fillPreview(profile)}
                className="min-h-11 rounded-xs bg-panel px-3 py-2 text-left hover:bg-demo-surface-hover focus-visible:outline-demo disabled:opacity-50"
              >
                Fill {profile.role} account{" "}
                <span className="block text-xs text-demo">{profile.email}</span>
              </button>
            ))}
          </div>
        )}
      </details> : (
        <p className="mt-5 text-center text-xs text-content-muted">Use your student or operator account provided for this workspace.</p>
      )}
    </AuthLayout>
  );
}
