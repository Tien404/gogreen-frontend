import { campusInputToIso } from "@/integration/studentRecords";
import { inputTime, parseTime } from "@/shared/lib/time";

export function parkingIntervalErrors(
  start: string,
  end: string,
  clock: number,
) {
  const errors: { start?: string; end?: string } = {};
  let validStart = false;
  let validEnd = false;
  try {
    campusInputToIso(start);
    validStart = true;
  } catch {
    errors.start = "Choose a valid start date and time.";
  }
  try {
    campusInputToIso(end);
    validEnd = true;
  } catch {
    errors.end = "Choose a valid end date and time.";
  }
  if (validStart && parseTime(start) < clock)
    errors.start =
      "Start time has passed. Choose a later time or move the interval forward.";
  if (validStart && validEnd && parseTime(end) <= parseTime(start))
    errors.end = "End time must be after the start time.";
  return errors;
}

export function moveParkingInterval(start: string, end: string, clock: number) {
  const duration = parseTime(end) - parseTime(start);
  const nextStart = Math.floor(clock) + 1;
  return {
    start: inputTime(nextStart),
    end: inputTime(
      nextStart + (Number.isFinite(duration) && duration > 0 ? duration : 60),
    ),
  };
}
