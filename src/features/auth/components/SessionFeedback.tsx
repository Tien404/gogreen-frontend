import { Brand } from "@/shared/components/Brand";
import { Alert, Button } from "@/shared/ui";
import type { AuthSession } from "../model/types";

export function SessionFeedback({ auth }: { auth: AuthSession }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-dvh flex flex-col items-center justify-center gap-5 p-5 text-center"
    >
      <Brand />
      {auth.status === "loading" ? (
        <p role="status" className="text-content-muted">
          Checking your session…
        </p>
      ) : (
        <div className="max-w-100">
          <h1 className="text-[28px] leading-tight">Connection unavailable</h1>
          <Alert tone="error">
            {auth.error ?? "Could not check your session."}
          </Alert>
          <Button onClick={auth.retry}>Retry</Button>
        </div>
      )}
    </main>
  );
}
