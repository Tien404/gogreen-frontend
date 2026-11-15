import { config } from "@/config/app";
import { type State } from "@/domain/types";
import { fixtures } from "@/mocks/fixtures";
import type { TransitionContext } from "../context";
import type { TransitionResult } from "../types";

export function handleWorkspace({
  s,
  a,
}: TransitionContext): TransitionResult | undefined {
  if (a.type === "role") {
    s.role = a.role as State["role"];

    if (a.profile) s.profile = a.profile as State["profile"];
    else delete s.profile;

    if (a.persona) s.persona = String(a.persona);

    return {
      state: s,
      message: s.role ? "Workspace selected" : "You’re logged out.",
    };
  }

  if (a.type === "reset") {
    const f = fixtures();

    f.role = s.role;
    f.persona = s.persona;

    if (s.profile) f.profile = s.profile;

    return { state: f, message: "Snapshot restored to 20 October, 09:00" };
  }

  if (a.type === "preset") {
    const f = fixtures();

    f.role = s.role;
    f.persona = s.persona;

    if (s.profile) f.profile = s.profile;

    f.preset = String(a.preset);

    if (f.preset === "overstay") {
      f.bookings[0].status = "overstaying";
      f.bookings[0].end = -5;
      f.bookings[1].status = "expired";
      f.bookings[1].start = -60;
      f.bookings[1].end = -30;
    }

    if (f.preset === "charging") {
      f.charges[0].status = "interrupted";
      f.charges[0].reason =
        "Point fault · target not reached. Parking remains occupied.";
      f.charges.push({
        ...f.charges[0],
        id: "CH-004",
        status: "stopped",
        reason: "Need-by time reached at 42% of 80% target.",
      });
    }

    if (f.preset === "stale") {
      f.hubs[3].capacity = 0;
      f.vehicles
        .filter((v) => v.hub === "metro")
        .forEach((v) => {
          v.hub = null;
          v.status = "maintenance";
          v.stale = true;
        });
    }

    if (f.preset === "empty") f.activity = [];

    if (f.preset === "load-error") f.loadFailed = true;

    return { state: f, message: "Preset loaded. Previous actions reset." };
  }

  if (a.type === "retry") {
    s.loadFailed = false;

    return { state: s, message: "View loaded" };
  }
}

export function handleClock({
  s,
  a,
  log,
  ok,
}: TransitionContext): TransitionResult | undefined {
  if (a.type === "advance") {
    s.clock += Number(a.minutes);
    s.holds.forEach((h) => {
      if (h.status === "held" && h.expires <= s.clock) {
        h.status = "expired";
        s.vehicles.find((v) => v.id === h.vehicle)!.status = "available";
        log(
          "Hold expired",
          h.id,
          "Expired",
          "Vehicle available again",
          `/student/holds/${h.id}`,
        );
      }
    });
    s.bookings.forEach((b) => {
      if (b.status === "confirmed" && s.clock > b.start + config.checkInGrace) {
        b.status = "expired";
        log(
          "No-show",
          b.id,
          "Expired",
          "No vehicle removed",
          `/student/parking/${b.id}`,
        );
      }

      if (b.status === "checked-in" && s.clock > b.end)
        b.status = "overstaying";
    });

    return ok(`Clock advanced ${a.minutes} minutes`);
  }
}

export function handleSamples({
  s,
  a,
  log,
  ok,
}: TransitionContext): TransitionResult | undefined {
  if (a.type === "sample") {
    if (
      s.preset === "older-event" ||
      s.activity.some((x) => x.action === "sample" && x.result === "Success")
    ) {
      log(
        "Sample event",
        "EV-001",
        "Ignored",
        "Duplicate or older fixture update ignored",
      );

      return { state: s, message: "Sample update ignored" };
    }

    const v = s.vehicles[0];

    v.battery = 68;

    return ok("Battery fixture updated to 68%", "EV-001", "/operator/fleet");
  }
}
