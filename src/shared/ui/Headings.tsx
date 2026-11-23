import { type ReactNode } from "react";

type PageTitleProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageTitle({ title, description, action }: PageTitleProps) {
  return (
    <div
      data-slot="page-title"
      className="flex items-end justify-between gap-5 mb-6 max-[600px]:items-start max-[600px]:flex-col max-[600px]:gap-4 max-[600px]:mb-5"
    >
      <div className="min-w-0">
        <h1 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.025em] max-[600px]:text-[26px] wrap-anywhere">
          {title}
        </h1>
        <p className="leading-[1.65] mt-2 max-w-[72ch] text-sm wrap-anywhere">
          {description}
        </p>
      </div>
      {action && <div className="page-actions">{action}</div>}
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
      className="flex flex-wrap items-start justify-between gap-3 mb-4 [&_>_div]:min-w-0 max-[600px]:**:data-[slot~=text-link]:text-sm"
    >
      <div>
        <h2 className="leading-[1.4] text-lg">{title}</h2>
        {subtitle && (
          <p className="leading-[1.65] text-sm mt-1 max-w-[72ch]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
