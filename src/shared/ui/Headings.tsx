import { type ReactNode } from "react";

type PageTitleProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: PageTitleProps) {
  return (
    <div
      data-slot="page-title"
      className="flex justify-between items-center gap-5 mb-5 max-[600px]:items-start max-[600px]:flex-col max-[600px]:gap-4 max-[600px]:mb-5 max-[600px]:**:data-[slot~=button]:min-h-10"
    >
      <div>
        {eyebrow && (
          <div
            data-slot="eyebrow"
            className="text-xs font-semibold tracking-[1.3px] text-content-muted mb-2 max-[600px]:text-xs"
          >
            {eyebrow}
          </div>
        )}
        <h1 className="leading-[1.15] demo:text-demo max-[1200px]:text-lg max-[600px]:text-lg max-[600px]:tracking-[-1px]">
          {title}
        </h1>
        <p className="leading-[1.65] mt-3 max-[600px]:text-sm max-[600px]:mt-2">
          {description}
        </p>
      </div>
      {action}
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
      className="flex items-center justify-between gap-4 mb-5 max-[600px]:items-start max-[600px]:**:data-[slot~=text-link]:shrink-0 max-[600px]:**:data-[slot~=text-link]:text-xs max-[600px]:**:data-[slot~=text-link]:gap-1 max-[600px]:[&_[data-slot~=text-link]_svg]:hidden"
    >
      <div>
        <h2 className="leading-[1.4] text-md max-[600px]:text-md">{title}</h2>
        {subtitle && (
          <p className="leading-[1.65] text-xs mt-1 max-[600px]:text-xs">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
