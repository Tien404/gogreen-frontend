import type { ComponentProps } from "react";
import { Button as ShadcnButton } from "./primitives/button";

type ButtonProps = Omit<ComponentProps<typeof ShadcnButton>, "variant"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "link";
};

export function Button({ variant = "primary", ...props }: ButtonProps) {
  return (
    <ShadcnButton
      variant={
        variant === "primary"
          ? "default"
          : variant === "danger"
            ? "destructive"
            : variant
      }
      {...props}
    />
  );
}
