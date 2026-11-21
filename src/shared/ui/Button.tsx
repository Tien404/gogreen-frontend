import { type ButtonHTMLAttributes } from "react";

const variantStyles = {
  primary:
    "px-5 text-on-dark bg-accent [&:hover:not(:disabled)]:bg-brand-hover [&:hover:not(:disabled)]:text-on-dark",
  secondary:
    "px-5   bg-surface-inset text-content [&:hover:not(:disabled)]:bg-soft",
  ghost: "bg-transparent text-content-muted hover:bg-soft px-2",
  danger: "px-5 bg-danger text-on-dark hover:bg-danger-hover",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      data-variant={variant}
      data-slot="button"
      className={`active:translate-y-px inline-flex items-center justify-center gap-2 min-h-11 rounded-xs text-sm font-medium leading-5 whitespace-normal py-2 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
