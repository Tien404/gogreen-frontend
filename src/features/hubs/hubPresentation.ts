export const hubPresentation: Readonly<
  Partial<
    Record<
      string,
      {
        area: string;
        x: number;
        y: number;
      }
    >
  >
> = {
  north: { area: "Student dormitories & residential services", x: 23, y: 28 },
  library: { area: "Library & student service area", x: 55, y: 42 },
  science: { area: "University campuses & teaching facilities", x: 75, y: 68 },
  metro: {
    area: "Metro Line 1 connection & onward campus journeys",
    x: 30,
    y: 77,
  },
};
