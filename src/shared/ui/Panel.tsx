import type { ComponentProps } from "react";
import { cn } from "../lib/utils";
import { Card } from "./primitives/card";

export function Panel({ className, ...props }: ComponentProps<typeof Card>) {
  return (
    <Card
      data-slot="panel"
      className={cn("block min-w-0 gap-0 p-5 sm:p-6", className)}
      {...props}
    />
  );
}
