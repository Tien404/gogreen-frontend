import type { State } from "./types";
export function occupancy(s: State, id: string) {
  return s.hubs.find((hub) => hub.id === id)?.live?.occupied ?? 0;
}
export function freeSpaces(s: State, id: string) {
  return s.hubs.find((hub) => hub.id === id)?.live?.bookable ?? 0;
}
export function pointFree(s: State, id: string) {
  return s.hubs.find((hub) => hub.id === id)?.live?.availablePoints ?? 0;
}
