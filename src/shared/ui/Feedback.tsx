import { type ReactNode } from "react";
import { Icon } from "../components/Icon";

type AlertProps = {
  children: ReactNode;
  tone?: string;
};

export function Alert({ children, tone = "info" }: AlertProps) {
  return (
    <div
      data-tone={tone}
      className="rounded-xs bg-soft text-content-muted flex items-start gap-3 text-sm leading-[1.6] [&_>_svg]:mt-1 [&_>_svg]:shrink-0 [&_p]:text-inherit data-[tone=error]:bg-danger-surface data-[tone=error]:text-danger [&_a]:underline p-4 my-5 mx-0"
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon name={tone === "error" ? "alert" : "help"} />
      <div>{children}</div>
    </div>
  );
}

type EmptyProps = {
  title?: string;
  text?: string;
  action?: ReactNode;
};

export function Empty({
  title = "No matches found",
  text = "Try another search or adjust your filters.",
  action,
}: EmptyProps) {
  return (
    <div className="text-center py-6 px-5 max-[600px]:py-5 max-[600px]:px-4">
      <div
        data-slot="icon-box"
        className="inline-flex items-center justify-center bg-soft text-accent w-11 h-11 rounded-xs shrink-0 mb-5"
      >
        <Icon name="search" size={24} />
      </div>
      <h3 className="text-md">{title}</h3>
      <p className="leading-[1.65] mt-3 mb-5 max-w-105 mx-auto">{text}</p>
      {action}
    </div>
  );
}
