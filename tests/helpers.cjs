require("./register.cjs");

const { fixtures } = require("../src/mocks/fixtures.ts");
const { occupancy, available } = require("../src/domain/selectors.ts");
const { transition } = require("../src/store/transition.ts");
function demo(role = "student", preset = "normal") {
  let s = fixtures();
  s.role = role;
  if (preset !== "normal") s = transition(s, { type: "preset", preset }).state;
  return {
    get s() {
      return s;
    },
    act(a) {
      const r = transition(s, a);
      s = r.state;
      return r;
    },
  };
}
function hold(d) {
  return d.act({
    type: "reserve",
    vehicle: available(d.s, "north")[0].id,
    destination: "library",
  });
}
function ride(d) {
  const h = hold(d);
  return d.act({ type: "pickup", id: h.id });
}

module.exports = {
  fixtures,
  occupancy,
  available,
  transition,
  demo,
  hold,
  ride,
};
