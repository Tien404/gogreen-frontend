import { Alert as ShadcnAlert, AlertDescription } from "./primitives/alert";
import { type ReactNode } from "react";
import { Icon } from "../components/Icon";

type AlertProps = {
  children: ReactNode;
  tone?: string;
};

export function Alert({ children, tone = "info" }: AlertProps) {
  return (
    <ShadcnAlert
      variant={tone === "error" ? "destructive" : "default"}
      data-tone={tone}
      className="border-0 bg-warning-surface text-warning leading-6 [&_p]:text-inherit data-[tone=error]:bg-danger-surface data-[tone=error]:text-danger [&_a]:underline p-4 my-5 mx-0"
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon name={tone === "error" ? "alert" : "help"} />
      <AlertDescription className="min-w-0 text-inherit wrap-anywhere">
        {children}
      </AlertDescription>
    </ShadcnAlert>
  );
}

type EmptyProps = {
  title?: string;
  text?: string;
  action?: ReactNode;
  headingLevel?: 1 | 2 | 3;
};

export function Empty({
  title = "No matches found",
  text = "Try another search or adjust your filters.",
  action,
  headingLevel = 3,
}: EmptyProps) {
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3";
  return (
    <div
      role="status"
      className="text-center py-8 px-5 max-[600px]:py-6 max-[600px]:px-4"
    >
      <div
        data-slot="icon-box"
        className="inline-flex items-center justify-center text-primary w-11 h-11 rounded-lg shrink-0 mb-3"
      >
        <Icon name="search" size={24} />
      </div>
      <Heading
        className={
          headingLevel === 1 ? "text-[28px] leading-tight" : "text-base"
        }
      >
        {title}
      </Heading>
      <p className="leading-[1.65] mt-2 mb-4 max-w-105 mx-auto">{text}</p>
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl bg-panel p-5 sm:p-6"
    >
      <p className="text-sm">{label}</p>
      <div
        aria-hidden="true"
        className="mt-4 grid gap-3 motion-safe:animate-pulse"
      >
        <div className="h-3 w-1/3 rounded bg-surface-inset" />
        <div className="h-3 w-full rounded bg-surface-inset" />
        <div className="h-3 w-2/3 rounded bg-surface-inset" />
      </div>
    </div>
  );
}
