import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";
import { Label } from "./primitives/label";

type FieldProps = {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
};

export function Field({ label, children, hint, error }: FieldProps) {
  const generatedId = useId();
  const child = isValidElement(children)
    ? (children as ReactElement<{
        id?: string;
        required?: boolean;
        "aria-describedby"?: string;
        "aria-invalid"?: boolean;
      }>)
    : null;
  const id = child?.props.id ?? generatedId;
  const descriptionId = `${id}-description`;
  return (
    <div
      data-slot="field"
      className="mb-5 flex min-w-0 flex-col gap-2 [&_[data-slot=select-wrapper]]:w-full"
    >
      <Label htmlFor={id} className="leading-5">
        <span>
          {label}
          {child?.props.required && (
            <span aria-hidden="true" className="ml-1">
              *
            </span>
          )}
        </span>
      </Label>
      {child
        ? cloneElement(child, {
            id,
            "aria-describedby":
              [
                child.props["aria-describedby"],
                (hint || error) && descriptionId,
              ]
                .filter(Boolean)
                .join(" ") || undefined,
            "aria-invalid": error ? true : child.props["aria-invalid"],
          })
        : children}
      {(hint || error) && (
        <small
          id={descriptionId}
          className={
            error
              ? "text-sm leading-5 text-destructive"
              : "text-sm leading-5 text-muted-foreground"
          }
        >
          {error ?? hint}
        </small>
      )}
    </div>
  );
}
