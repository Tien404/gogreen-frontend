import { useState } from "react";
import { Button } from "./Button";

export function RecordReference({
  value,
  label = "Reference",
}: {
  value: string;
  label?: string;
}) {
  const [feedback, setFeedback] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback("Reference copied.");
    } catch {
      setFeedback("Copy unavailable. Select the reference above to copy it.");
    }
  }
  return (
    <details className="mt-5 text-sm">
      <summary className="min-h-11 cursor-pointer py-3 text-content-muted">
        {label} · {value.slice(0, 8).toUpperCase()}
      </summary>
      <div className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-inset p-3">
        <code className="min-w-0 flex-1 select-all wrap-anywhere text-sm">
          {value}
        </code>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Copy ${label.toLowerCase()}`}
          onClick={() => void copy()}
        >
          Copy
        </Button>
        {feedback && (
          <p role="status" className="w-full text-sm">
            {feedback}
          </p>
        )}
      </div>
    </details>
  );
}
