require("./register.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  parkingIntervalErrors,
  moveParkingInterval,
} = require("../src/features/parking/model/interval.ts");
const { parseTime } = require("../src/shared/lib/time.ts");

test("a seven-day interval reports only the past start, not an end ordering error", () => {
  const errors = parkingIntervalErrors(
    "2026-11-22T08:25",
    "2026-11-29T09:25",
    parseTime("2026-11-22T08:26"),
  );
  assert.match(errors.start, /Start time has passed/);
  assert.equal(errors.end, undefined);
});
test("equal and reversed end times report the end field specifically", () => {
  for (const end of ["2026-11-22T08:25", "2026-11-22T08:24"]) {
    assert.match(
      parkingIntervalErrors(
        "2026-11-22T08:25",
        end,
        parseTime("2026-11-22T08:20"),
      ).end,
      /after the start/,
    );
  }
});
test("invalid campus dates are rejected without normalizing them into a later day", () => {
  assert.match(
    parkingIntervalErrors("2026-02-30T08:25", "2026-03-02T09:25", 0).start,
    /valid start/,
  );
});
test("explicit recovery preserves duration and moves start strictly past a fractional server minute", () => {
  const start = "2026-11-22T08:25",
    end = "2026-11-29T09:25";
  const clock = parseTime("2026-11-22T08:26") + 0.7;
  const moved = moveParkingInterval(start, end, clock);
  assert.ok(parseTime(moved.start) > clock);
  assert.equal(
    parseTime(moved.end) - parseTime(moved.start),
    parseTime(end) - parseTime(start),
  );
  assert.deepEqual(parkingIntervalErrors(moved.start, moved.end, clock), {});
});
