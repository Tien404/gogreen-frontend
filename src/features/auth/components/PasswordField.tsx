import { Input, Label, Button } from "@/shared/ui";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

type PasswordFieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  newPassword?: boolean;
};

export function PasswordField({
  label,
  name,
  error,
  hint,
  newPassword = false,
}: PasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-2 mb-5 text-sm">
      <Label htmlFor={id} className="font-medium">
        {label} <span aria-hidden="true">*</span>
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={newPassword ? 8 : undefined}
          maxLength={128}
          autoComplete={newPassword ? "new-password" : "current-password"}
          aria-invalid={!!error}
          aria-describedby={
            [hint && `${id}-hint`, error && `${id}-error`]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className="w-full pr-12"
        />
        <Button
          variant="ghost"
          size="icon"
          type="button"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
          className="absolute right-1 top-1/2 -translate-y-1/2 grid size-11 place-items-center rounded-lg text-content-muted hover:bg-soft hover:text-primary disabled:opacity-50"
        >
          {visible ? (
            <EyeOff size={20} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Eye size={20} strokeWidth={1.75} aria-hidden="true" />
          )}
        </Button>
      </div>
      {hint && (
        <small id={`${id}-hint`} className="text-content-muted">
          {hint}
        </small>
      )}
      {error && (
        <small id={`${id}-error`} className="text-danger">
          {error}
        </small>
      )}
    </div>
  );
}
