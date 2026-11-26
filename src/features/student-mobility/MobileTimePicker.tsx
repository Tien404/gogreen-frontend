import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { CalendarIcon, Clock3 } from "lucide-react";
import { Button, Field, Input, Modal } from "@/shared/ui";
import { inputTime, parseTime } from "@/shared/lib/time";

function toLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dayValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + month + "-" + day;
}

export function MobileTimePicker({
  label,
  value,
  onChange,
  clock,
  error,
  durationFrom,
  optional = false,
  onClear,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  clock: number;
  error?: string;
  durationFrom?: string;
  optional?: boolean;
  onClear?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const today = inputTime(clock).slice(0, 10);
  const minDate = toLocalDate(today);
  const duration =
    durationFrom && value ? parseTime(value) - parseTime(durationFrom) : null;

  function openPicker() {
    setDraft(value || inputTime(Math.floor(clock) + 5));
    setOpen(true);
  }

  const dateLabel = (day: string) =>
    day === today
      ? "Today"
      : toLocalDate(day).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });

  return (
    <section className="mb-4 rounded-xl bg-surface-muted p-3.5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{label}</h2>
        {optional && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={value ? onClear : openPicker}
          >
            {value ? "Clear" : "Set time"}
          </Button>
        )}
      </div>
      {durationFrom && (
        <div
          role="group"
          aria-label="Quick duration"
          className="mt-2 grid grid-cols-4 gap-2"
        >
          {[
            [30, "30m"],
            [60, "1h"],
            [120, "2h"],
            [240, "4h"],
          ].map(([minutes, text]) => (
            <Button
              type="button"
              key={minutes}
              size="sm"
              variant={duration === minutes ? "primary" : "outline"}
              aria-pressed={duration === minutes}
              onClick={() =>
                onChange(inputTime(parseTime(durationFrom) + Number(minutes)))
              }
            >
              {text}
            </Button>
          ))}
        </div>
      )}
      {value && (
        <button
          type="button"
          onClick={openPicker}
          aria-label={label + " date and time"}
          className="mt-3 flex min-h-12 w-full items-center justify-between gap-2 rounded-lg bg-panel px-3 text-left text-sm font-semibold hover:bg-green-muted"
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-content-muted"
            />
            {dateLabel(value.slice(0, 10))}
          </span>
          <span className="flex shrink-0 items-center gap-2 tabular-nums">
            <Clock3 aria-hidden="true" className="size-4 text-content-muted" />
            {value.slice(11, 16)}
          </span>
        </button>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <Modal
        title={label}
        description="Choose a date and time."
        open={open}
        onOpenChange={setOpen}
        size="sm"
      >
        {open && (
          <>
            <div className="student-date-calendar">
              <DayPicker
                mode="single"
                required
                today={minDate}
                defaultMonth={toLocalDate(draft.slice(0, 10))}
                startMonth={minDate}
                selected={toLocalDate(draft.slice(0, 10))}
                disabled={{ before: minDate }}
                onSelect={(day) => setDraft(dayValue(day) + draft.slice(10))}
              />
            </div>
            <Field label="Time">
              <Input
                type="time"
                required
                value={draft.slice(11, 16)}
                onChange={(event) =>
                  setDraft(draft.slice(0, 11) + event.target.value)
                }
                className="student-picker-clock"
              />
            </Field>
            <Button
              type="button"
              className="w-full"
              disabled={draft.length !== 16}
              onClick={() => {
                onChange(draft);
                setOpen(false);
              }}
            >
              Done
            </Button>
          </>
        )}
      </Modal>
    </section>
  );
}
