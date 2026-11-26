import { type ReactNode } from "react";

type PageTitleProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageTitle({ title, description, action }: PageTitleProps) {
  return (
    <div
      data-slot="page-title"
      className={
        description ? "mb-6 max-[600px]:mb-5" : "mb-4 max-[600px]:mb-3"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 font-semibold leading-tight tracking-tight wrap-anywhere">
          {title}
        </h1>
        {action && <div className="page-actions shrink-0">{action}</div>}
      </div>
      {description && (
        <p className="mt-2 max-w-[65ch] text-base leading-relaxed wrap-anywhere">
          {description}
        </p>
      )}
    </div>
  );
}

type SectionHeadProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function SectionHead({ title, subtitle, action }: SectionHeadProps) {
  return (
    <div
      data-slot="section-head"
      className="mb-4 max-[600px]:**:data-[slot~=text-link]:text-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="min-w-0 text-xl font-semibold leading-snug wrap-anywhere">
          {title}
        </h2>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {subtitle && (
        <p className="mt-1 max-w-[65ch] text-base leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
