import type { Coordinates } from "@/shared/lib/coordinates";

export const campusCenter: Coordinates = [10.8725, 106.8005];

// Demo Hubs anchored to real landmarks, checked 2026-11-23; not operating stations.
const demoLocations: Readonly<Partial<Record<string, Coordinates>>> = {
  // KTX Khu A, Tạ Quang Bửu bus stop beside the dormitory.
  // https://www.openstreetmap.org/node/6543789616
  north: [10.87578, 106.80507],
  // VNU-HCM Central Library, main building on Võ Trường Toản.
  // https://www.vnulib.edu.vn/eng/ (Getting to the Central Library)
  // OSM-derived place coordinates: https://www.findlatitudeandlongitude.com/l/Central%2BLibrary%2C%2BV%C3%B5%2BTr%C6%B0%E1%BB%9Dng%2BTo%E1%BA%A3n%2C%2BVietnam%2BNational%2BUniversity%2BHo%2BChi%2BMinh%2BCity%2BUrban%2BArea%2C%2BPh%C6%B0%E1%BB%9Dng%2BLinh%2BXu%C3%A2n%2C%2BTh%E1%BB%A7%2B%C4%90%E1%BB%A9c%2C%2BHo%2BChi%2BMinh/10604654/
  library: [10.869774, 106.796204],
  // University of Science, Linh Trung campus.
  // https://www.openstreetmap.org/node/9593572488
  science: [10.87593, 106.79778],
  // Đại học Quốc gia Metro station (Line 1), not Bến xe Suối Tiên terminus.
  // https://mrt.com.vn/tphcm/ga-dai-hoc-quoc-gia/
  metro: [10.86629, 106.80121],
};

export function hubLocation(hub: {
  id: string;
  coordinates?: Coordinates | null;
}) {
  if (hub.coordinates) return { position: hub.coordinates, demo: false };
  const position = demoLocations[hub.id];
  return position ? { position, demo: true } : null;
}
