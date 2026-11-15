import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";

type FieldProps = {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
};

export function Field({ label, children, hint, error }: FieldProps) {
  const id = useId();

  const child = isValidElement(children)
    ? (children as ReactElement<{
        required?: boolean;
        "aria-describedby"?: string;
        "aria-invalid"?: boolean;
      }>)
    : null;

  return (
    <label
      data-slot="field"
      className="flex flex-col gap-2 min-w-0 mb-5 text-sm leading-5 [&_input]:w-full [&_select]:w-full [&_textarea]:w-full [&:has(:invalid:not(:placeholder-shown):focus)_input]:border-danger"
    >
      <span className="font-medium">
        {label}
        {child?.props.required && <span aria-hidden="true"> *</span>}
      </span>
      {child
        ? cloneElement(child, {
            "aria-describedby": hint || error ? id : undefined,
            "aria-invalid": error ? true : undefined,
          })
        : children}
      {(hint || error) && (
        <small
          id={id}
          data-error={!!error}
          className="leading-[1.6] data-[error=true]:text-danger font-normal"
        >
          {error ?? hint}
        </small>
      )}
    </label>
  );
}
