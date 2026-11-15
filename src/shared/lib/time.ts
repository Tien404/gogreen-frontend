import { config } from "@/config/app";

export function time(minutes: number) {
  return new Date(
    new Date(config.snapshot).getTime() + minutes * 60000,
  ).toLocaleTimeString("en-GB", {
    timeZone: config.timezone,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function inputTime(minutes: number) {
  return new Date(Date.parse(config.snapshot) + (minutes + 420) * 60000)
    .toISOString()
    .slice(0, 16);
}

export function parseTime(value: string) {
  return (
    (Date.parse(`${value}:00+07:00`) - Date.parse(config.snapshot)) / 60000
  );
}
