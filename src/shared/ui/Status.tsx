import { Badge as StatusBadge } from "./primitives/badge";
import { type ReactNode } from "react";
import { Icon } from "../components/Icon";

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

export function Battery({ value }: BatteryProps) {
  return (
    <span
      data-low={value !== null && value < 25}
      className="inline-flex gap-2 items-center text-primary text-sm font-semibold whitespace-nowrap data-[low=true]:text-warning"
    >
      <Icon name="battery" size={18} />
      {value === null ? "Unknown" : `${value}%`}
    </span>
  );
}
