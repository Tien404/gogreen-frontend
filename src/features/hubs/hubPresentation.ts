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
  north: { area: "KTX Khu A · Tạ Quang Bửu", x: 23, y: 28 },
  library: { area: "VNU-HCM Central Library · Võ Trường Toản", x: 55, y: 42 },
  science: { area: "University of Science · Linh Trung campus", x: 75, y: 68 },
  metro: {
    area: "Đại học Quốc gia Metro station · Line 1",
    x: 30,
    y: 77,
  },
};
