"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

function Table({
  className,
  scrollable = true,
  ...props
}: React.ComponentProps<"table"> & { scrollable?: boolean }) {
  return (
    <div
      data-slot="table-container"
      role={scrollable ? "region" : undefined}
      aria-label={
        scrollable
          ? (props["aria-label"] ?? "Scrollable data table")
          : undefined
      }
      tabIndex={scrollable ? 0 : undefined}
      className={cn(
        "relative w-full max-w-full rounded-xl bg-panel in-data-[slot=panel]:border in-data-[slot=panel]:border-divider",
        scrollable
          ? "overflow-x-auto focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          : "overflow-visible",
      )}
    >
      <table
        data-slot="table"
        className={cn(
          "w-full caption-top text-sm tabular-nums [&_th]:wrap-anywhere [&_thead_th]:wrap-normal [&_td]:wrap-anywhere",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "bg-surface-muted/90 [&_tr]:border-0 [&_tr:hover]:bg-transparent [&_th]:text-content/70 [&_th]:text-sm [&_th]:font-medium [&_small]:text-inherit",
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0 [&_tr:last-child_th]:border-b-0 [&_tr:last-child_td]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn("border-b transition-colors", className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-11 px-4 py-3 text-left align-middle font-medium whitespace-normal text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-4 align-middle whitespace-normal [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
