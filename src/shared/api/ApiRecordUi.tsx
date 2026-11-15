import type { ReactNode } from "react";
import { Empty, Link } from "../ui";
import { ApiLoadError } from "./ApiFeedback";

export const inputClass = "min-h-11 rounded-xs border border-control-border bg-panel px-3 text-sm hover:bg-soft";
export const panelClass = "mb-5 min-w-0 rounded-sm bg-panel p-5";
export const recordRowClass = "flex flex-wrap items-center justify-between gap-3 border-b border-divider py-3 last:border-b-0";

type FeedbackQuery = {
  result: { status: "loading" | "ready" } | { status: "error"; message: string; code?: number };
  refreshError?: { message: string };
  retry: () => void;
};

export function RecordFeedback({ query, item, back }: { query: FeedbackQuery; item: string; back?: string }) {
  if (query.result.status === "loading") return <p role="status">Loading {item}…</p>;
  if (query.result.status === "error" && query.result.code === 404 && back) {
    return <Empty title="Record not found" text="Check the address or return to the list." action={<Link to={back}>Back to list</Link>} />;
  }
  const error = query.result.status === "error" ? query.result : query.refreshError;
  return error ? <ApiLoadError message={error.message} retry={query.retry} /> : null;
}

export function DataRows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="space-y-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-wrap justify-between gap-2">
          <dt className="text-content-muted">{label}</dt>
          <dd className="m-0 font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
