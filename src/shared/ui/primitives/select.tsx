import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type Option = { value: string; label: string; disabled: boolean };
function optionText(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number")
        return String(child);
      return React.isValidElement<{ children?: React.ReactNode }>(child)
        ? optionText(child.props.children)
        : "";
    })
    .join("");
}
function optionsFrom(children: React.ReactNode): Option[] {
  const options: Option[] = [];
  React.Children.forEach(children, (child) => {
    if (
      !React.isValidElement<{
        value?: string;
        disabled?: boolean;
        children?: React.ReactNode;
      }>(child)
    )
      return;
    if (child.type === "option") {
      const label = optionText(child.props.children);
      options.push({
        value: String(child.props.value ?? label),
        label,
        disabled: Boolean(child.props.disabled),
      });
    } else {
      options.push(...optionsFrom(child.props.children));
    }
  });
  return options;
}

type SelectProps = Omit<
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
  "value" | "defaultValue" | "onChange" | "children"
> & {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  size?: "sm" | "default";
  wrapperClassName?: string;
};

export function Select({
  children,
  value,
  defaultValue,
  onValueChange,
  name,
  required,
  disabled,
  className,
  wrapperClassName,
  size = "default",
  ...props
}: SelectProps) {
  const options = optionsFrom(children);
  const placeholder = options.find((option) => option.value === "")?.label;
  const [localValue, setLocalValue] = React.useState(
    defaultValue ?? options.find((option) => !option.disabled)?.value ?? "",
  );
  const selected = value ?? localValue;
  const emptyKey = `empty-${React.useId()}`;
  return (
    <div
      data-slot="select-wrapper"
      className={cn(
        "relative min-w-0 w-full sm:w-auto",
        disabled && "opacity-50",
        wrapperClassName,
      )}
    >
      <SelectPrimitive.Root
        value={selected}
        name={name}
        required={required}
        disabled={disabled}
        onValueChange={(next) => {
          const actual = next === emptyKey ? "" : next;
          setLocalValue(actual);
          onValueChange?.(actual);
        }}
      >
        <SelectPrimitive.Trigger
          data-slot="select-trigger"
          data-size={size}
          className={cn(
            "flex h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-md border border-input bg-background px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-surface-muted focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 aria-invalid:border-destructive disabled:cursor-not-allowed data-[size=sm]:h-9 [&>span:first-child]:min-w-0 [&>span:first-child]:truncate",
            className,
          )}
          {...props}
        >
          <SelectPrimitive.Value placeholder={placeholder}>
            {options.find((option) => option.value === selected)?.label ??
              placeholder}
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon asChild>
            <ChevronDownIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-content-muted"
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            side="bottom"
            align="start"
            sideOffset={6}
            collisionPadding={12}
            className="z-400 max-h-[min(320px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-24px)] overflow-hidden rounded-lg border border-divider bg-panel text-content shadow-md"
          >
            <SelectPrimitive.ScrollUpButton className="flex h-7 items-center justify-center">
              <ChevronUpIcon className="size-4" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value || emptyKey}
                  disabled={
                    option.disabled || (required && option.value === "")
                  }
                  className="relative flex min-h-11 cursor-pointer items-center rounded-md py-2 pr-9 pl-3 text-sm leading-5 outline-none data-[highlighted]:bg-surface-muted data-[state=checked]:bg-soft data-[state=checked]:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-3">
                    <CheckIcon className="size-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex h-7 items-center justify-center">
              <ChevronDownIcon className="size-4" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
