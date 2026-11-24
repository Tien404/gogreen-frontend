import { Badge as StatusBadge } from "./primitives/badge";
import { type ReactNode } from "react";

type BadgeProps = { children: ReactNode };

export function Badge({ children }: BadgeProps) {
  const t = String(children).toLowerCase();

  const tone = /unavailable|interrupted|failed/.test(t)
    ? "red"
    : /active|available|completed|success|resolved|confirmed/.test(t)
      ? "green"
      : /pending|held|scheduled|planned|medium|overstaying|full/.test(t)
        ? "amber"
        : /fault|fail|interrupted|high|expired|maintenance|stale/.test(t)
          ? "red"
          : "gray";

  return (
    <StatusBadge
      variant="outline"
      data-tone={tone}
      data-slot="badge"
      className="gap-1.5 border-transparent leading-5 data-[tone=green]:text-success data-[tone=green]:bg-success-surface data-[tone=amber]:text-warning data-[tone=amber]:bg-warning-surface data-[tone=red]:text-danger data-[tone=red]:bg-danger-surface data-[tone=gray]:text-content-muted data-[tone=gray]:bg-surface-inset py-0.5 px-2.5"
    >
      <span className="w-1.25 h-1.25 bg-current rounded-full shrink-0" />
      {children}
    </StatusBadge>
  );
}

type BatteryProps = { value: number | null };

const BATTERY_INNER_MAX_WIDTH = 12.5;

export function Battery({ value }: BatteryProps) {
  const level = value === null ? null : Math.max(0, Math.min(100, value));
  const tone =
    level === null
      ? "unknown"
      : level < 20
        ? "critical"
        : level < 50
          ? "low"
          : "good";
  const fillWidth =
    level === null || level === 0
      ? 0
      : Math.max(1.5, (level / 100) * BATTERY_INNER_MAX_WIDTH);

  return (
    <span
      data-slot="battery"
      data-tone={tone}
      className="inline-flex items-center gap-2 text-sm font-semibold whitespace-nowrap tabular-nums text-primary data-[tone=low]:text-warning data-[tone=critical]:text-danger data-[tone=unknown]:text-content-muted data-[tone=unknown]:font-medium"
    >
      <svg
        viewBox="0 0 22 14"
        width="20"
        height="13"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className="shrink-0"
      >
        <rect
          x="1"
          y="2"
          width="16.5"
          height="10"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeDasharray={level === null ? "2.5 2" : undefined}
        />
        <path
          d="M19.5 5v4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {fillWidth > 0 && (
          <rect
            x="3"
            y="4"
            width={fillWidth}
            height="6"
            rx="1"
            fill="currentColor"
          />
        )}
      </svg>
      <span>{value === null ? "Unknown" : `${value}%`}</span>
    </span>
  );
}
